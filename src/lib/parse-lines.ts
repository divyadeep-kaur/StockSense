export function parseLines(formData: FormData) {
  const lines: Record<number, { productId?: string; quantity?: number }> = {};
  for (const [key, value] of formData.entries()) {
    const match = key.match(/^lines\[(\d+)\]\.(productId|quantity)$/);
    if (!match) continue;
    const index = Number(match[1]);
    const field = match[2] as "productId" | "quantity";
    lines[index] ??= {};
    if (field === "quantity") {
      lines[index].quantity = Number(value);
    } else {
      lines[index].productId = String(value);
    }
  }
  return Object.values(lines).filter(
    (line): line is { productId: string; quantity: number } =>
      Boolean(line.productId) && Boolean(line.quantity) && line.quantity! > 0
  );
}
