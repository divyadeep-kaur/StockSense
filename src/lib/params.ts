/** Normalizes a Next.js searchParams value (string | string[] | undefined) into a string array. */
export function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
