import { getDashboardKpis, getLowStockAlerts, getRecentOperations } from "@/lib/dashboard";

const GROQ_MODEL = "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export type AssistantMessage = { role: "user" | "assistant"; content: string };

async function buildContext(userName: string) {
  const [kpis, lowStock, recent] = await Promise.all([
    getDashboardKpis(),
    getLowStockAlerts(8),
    getRecentOperations(8),
  ]);

  const lowStockLines = lowStock.length
    ? lowStock.map((p) => `- ${p.name} (${p.sku}): ${p.totalOnHand} on hand, reorder below ${p.minStockQty}`).join("\n")
    : "- none";

  const recentLines = recent.length
    ? recent
        .map((r) => `- ${r.type} · ${r.item} · qty ${r.quantity} · ${r.location} · ${r.status} · ${r.date.toISOString().slice(0, 10)}`)
        .join("\n")
    : "- none";

  return `You are the in-app assistant for StockSense, an inventory management system. You are talking to ${userName}.

Answer questions about the business's current inventory using the live data below. Be concise and concrete — cite numbers from the data instead of speaking in generalities. If asked something the data below can't answer, say so plainly instead of guessing. You can also explain how to use StockSense features (receipts, delivery orders, internal transfers, adjustments, move history) in general terms.

Reply in plain conversational text only — this is rendered in a plain-text chat bubble with no markdown support. Do not use asterisks, tables, headers, or bullet characters like "-" or "•"; write lists as short sentences or numbered inline (e.g. "1) ... 2) ...") instead.

Current snapshot:
- Total products: ${kpis.totalProducts}
- Low or out of stock: ${kpis.lowOrOutOfStock} (in stock: ${kpis.levels.inStock}, low: ${kpis.levels.lowStock}, out: ${kpis.levels.outOfStock})
- Pending receipts: ${kpis.pendingReceipts}
- Pending deliveries: ${kpis.pendingDeliveries}
- Scheduled internal transfers: ${kpis.transfersScheduled}

Products needing reorder attention:
${lowStockLines}

Recent stock movements:
${recentLines}`;
}

export async function askAssistant(userName: string, history: AssistantMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server.");
  }

  const system = await buildContext(userName);

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1024,
      messages: [{ role: "system", content: system }, ...history],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq request failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return typeof content === "string" && content.length > 0
    ? content
    : "I couldn't come up with a response — try rephrasing that.";
}
