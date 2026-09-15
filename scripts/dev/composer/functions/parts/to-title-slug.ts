export function toTitleSlug(item: { title: string }): string {
  let { title } = item;

  let slug: string = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-|-$/gu, '');

  return slug;
}
