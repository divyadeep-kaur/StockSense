import type { DocStatus } from "@prisma/client";
import type { KanbanKind } from "@/lib/kanban";

/** Valid drop targets per kind + current status, mirrored from the transitions the existing action functions actually support. */
export function validTargetsFor(kind: KanbanKind, status: DocStatus): DocStatus[] {
  if (kind === "ADJUSTMENT") return [];
  if (status === "DONE" || status === "CANCELED") return [];

  if (kind === "RECEIPT") {
    if (status === "DRAFT") return ["READY", "DONE", "CANCELED"];
    if (status === "READY") return ["DONE", "CANCELED"];
    return [];
  }

  // DELIVERY / TRANSFER share the same DRAFT/WAITING/READY/DONE/CANCELED flow
  if (status === "READY") return ["DONE", "CANCELED"];
  return ["READY", "CANCELED"];
}
