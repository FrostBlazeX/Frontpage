export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

export function uniqueSlug(name: string, existingIds: Set<string>): string {
  let id = slugify(name);
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${slugify(name)}-${suffix++}`;
  }
  return id;
}
