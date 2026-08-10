import { useEffect, useState } from "react";
import { BLOG_FEEDS } from "../data/blogs";
import { slugify, uniqueSlug } from "../utils/slugify";

export interface Category {
  id: string;
  name: string;
}

export const UNCATEGORIZED: Category = { id: "uncategorized", name: "Uncategorized" };

// Seeds the initial category list from the curated feed data's category
// names. IDs are derived once here and then stay fixed — renaming a category
// only ever changes its `name`, never its `id`, so feed assignments (which
// point at ids) and the current selection survive a rename untouched.
// Exported so useCategoriesRemote can seed a new signed-in account the same way.
export function defaultCategories(): Category[] {
  const seen = new Set<string>();
  const result: Category[] = [];
  for (const feed of BLOG_FEEDS) {
    const id = slugify(feed.category);
    if (!seen.has(id)) {
      seen.add(id);
      result.push({ id, name: feed.category });
    }
  }
  return result;
}

export interface UseCategoriesResult {
  categories: Category[];
  allCategories: Category[];
  resolveCategoryId: (feedId: string, defaultCategoryName: string) => string;
  resolveCategoryName: (feedId: string, defaultCategoryName: string) => string;
  categoryNameById: (id: string) => string;
  addCategory: (name: string) => void;
  renameCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, direction: "up" | "down") => void;
  assignFeedCategory: (feedId: string, categoryId: string) => void;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : defaultCategories();
  });
  // feedId -> categoryId. Only present for feeds the user has explicitly
  // reassigned; everything else falls back to its default feed category.
  const [overrides, setOverrides] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("feedCategoryOverrides");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("feedCategoryOverrides", JSON.stringify(overrides));
  }, [overrides]);

  // Deleting a category (or renaming one out from under a stale override) is
  // handled entirely by this existence check — no cleanup pass over
  // `overrides` needed. A feed pointing at an id that no longer exists in
  // `categories` just falls back to Uncategorized automatically.
  const resolveCategoryId = (
    feedId: string,
    defaultCategoryName: string,
  ): string => {
    const assigned = overrides[feedId] ?? slugify(defaultCategoryName);
    return categories.some((c) => c.id === assigned)
      ? assigned
      : UNCATEGORIZED.id;
  };

  const categoryNameById = (id: string): string =>
    categories.find((c) => c.id === id)?.name ?? UNCATEGORIZED.name;

  const resolveCategoryName = (
    feedId: string,
    defaultCategoryName: string,
  ): string => categoryNameById(resolveCategoryId(feedId, defaultCategoryName));

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existingIds = new Set(categories.map((c) => c.id));
    existingIds.add(UNCATEGORIZED.id);
    const id = uniqueSlug(trimmed, existingIds);
    setCategories((prev) => [...prev, { id, name: trimmed }]);
  };

  const renameCategory = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const moveCategory = (id: string, direction: "up" | "down") => {
    setCategories((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  };

  const assignFeedCategory = (feedId: string, categoryId: string) => {
    setOverrides((prev) => ({ ...prev, [feedId]: categoryId }));
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
