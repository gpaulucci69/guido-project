export type Page<T> = { items: T[]; nextCursor?: string };

export function nextPage<T>(page: Page<T>): string | undefined {
  return page.nextCursor;
}
