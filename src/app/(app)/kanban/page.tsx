import { prisma } from "@/lib/prisma";
import { getKanbanCards } from "@/lib/kanban";
import { KanbanBoard } from "./kanban-board";

export default async function KanbanPage() {
  const [cards, warehouses] = await Promise.all([
    getKanbanCards(),
    prisma.warehouse.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex h-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Kanban Board</h1>
        <p className="mt-1 text-sm text-muted">
          Receipts, deliveries, transfers and adjustments, organized by status. Drag a card to move it.
        </p>
      </div>

      <KanbanBoard initialCards={cards} warehouses={warehouses} />
    </div>
  );
}
