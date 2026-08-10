import { useEffect, useState } from "react";
import { supabase, fireAndForget } from "../lib/supabaseClient";
import { slugify, uniqueSlug } from "../utils/slugify";
import { UNCATEGORIZED, defaultCategories } from "./useCategories";
import type { Category, UseCategoriesResult } from "./useCategories";

// Supabase-backed counterpart to useCategories — same external interface, so
// Dashboard doesn't need to change how it *consumes* this, only which hook
// it calls for a signed-in user. See supabase/migrations/0001_init.sql for
// the `categories` / `feed_category_overrides` tables this reads/writes.
export function useCategoriesRemote(userId: string): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ data: categoryRows }, { data: overrideRows }] = await Promise.all([
        supabase
          .from("categories")
          .select("category_key,name")
          .eq("user_id", userId)
          .order("sort_order"),
        supabase.from("feed_category_overrides").select("feed_id,category_key").eq("user_id", userId),
      ]);
      if (cancelled) return;

      if (categoryRows && categoryRows.length > 0) {
        setCategories(categoryRows.map((r) => ({ id: r.category_key, name: r.name })));
      } else {
        // First time this account has loaded categories — seed the same
        // defaults the guest experience starts with.
        const defaults = defaultCategories();
        setCategories(defaults);
        fireAndForget(
          supabase.from("categories").insert(
            defaults.map((c, index) => ({
              user_id: userId,
              category_key: c.id,
              name: c.name,
              sort_order: index,
            })),
          ),
        );
      }

      if (overrideRows) {
        const map: Record<string, string> = {};
        for (const row of overrideRows) map[row.feed_id] = row.category_key;
        setOverrides(map);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Deleting a category (or renaming one out from under a stale override) is
  // handled entirely by this existence check — no cleanup pass over
  // `overrides` needed, same as the local hook.
  const resolveCategoryId = (feedId: string, defaultCategoryName: string): string => {
    const assigned = overrides[feedId] ?? slugify(defaultCategoryName);
    return categories.some((c) => c.id === assigned) ? assigned : UNCATEGORIZED.id;
  };

  const categoryNameById = (id: string): string =>
    categories.find((c) => c.id === id)?.name ?? UNCATEGORIZED.name;

  const resolveCategoryName = (feedId: string, defaultCategoryName: string): string =>
    categoryNameById(resolveCategoryId(feedId, defaultCategoryName));

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existingIds = new Set(categories.map((c) => c.id));
    existingIds.add(UNCATEGORIZED.id);
    const id = uniqueSlug(trimmed, existingIds);
    const sortOrder = categories.length;
    setCategories((prev) => [...prev, { id, name: trimmed }]);
    fireAndForget(
      supabase.from("categories").insert({ user_id: userId, category_key: id, name: trimmed, sort_order: sortOrder }),
    );
  };

  const renameCategory = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
    fireAndForget(
      supabase.from("categories").update({ name: trimmed }).eq("user_id", userId).eq("category_key", id),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    fireAndForget(supabase.from("categories").delete().eq("user_id", userId).eq("category_key", id));
  };

  const moveCategory = (id: string, direction: "up" | "down") => {
    const index = categories.findIndex((c) => c.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= categories.length) return;

    const next = [...categories];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setCategories(next);

    // Persist the whole list's new order — simplest correct approach given
    // sort_order needs to stay contiguous. (Promise.all does call .then() on
    // each builder internally, so — unlike the other writes in this file —
    // this one already fired even before error-logging was added here.)
    Promise.all(
      next.map((c, i) =>
        supabase.from("categories").update({ sort_order: i }).eq("user_id", userId).eq("category_key", c.id),
      ),
    ).then((results) => {
      const failed = results.find((r) => r.error);
      if (failed?.error) console.error("Supabase write failed:", failed.error.message);
    });
  };

  const assignFeedCategory = (feedId: string, categoryId: string) => {
    setOverrides((prev) => ({ ...prev, [feedId]: categoryId }));
    fireAndForget(
      supabase
        .from("feed_category_overrides")
        .upsert({ user_id: userId, feed_id: feedId, category_key: categoryId }),
    );
  };

  return {
    categories,
    allCategories: [...categories, UNCATEGORIZED],
    resolveCategoryId,
    resolveCategoryName,
    categoryNameById,
    addCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
    assignFeedCategory,
  };
}
