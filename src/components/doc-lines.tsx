"use client";

import { useState } from "react";
import { Button, Select, Input } from "@/components/ui";
import { PlusIcon } from "@/components/icons";

type Product = { id: string; name: string; sku: string; uom: string };

export function DocLines({
  products,
  initialLines,
}: {
  products: Product[];
  initialLines?: Array<{ productId: string; quantity: number }>;
}) {
  const [rows, setRows] = useState(
    initialLines && initialLines.length > 0 ? initialLines : [{ productId: "", quantity: 1 }]
  );

  function addRow() {
    setRows((r) => [...r, { productId: "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: "productId" | "quantity", value: string) {
    setRows((r) =>
      r.map((row, i) => (i === index ? { ...row, [field]: field === "quantity" ? Number(value) : value } : row))
    );
  }

  return (
    <div className="space-y-3">
      <table className="w-full text-left text-sm">
        <thead className="text-muted">
          <tr>
            <th className="pb-2 font-medium">Product</th>
            <th className="w-32 pb-2 font-medium">Quantity</th>
            <th className="w-10 pb-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="py-1.5 pr-3">
                <Select
                  name={`lines[${i}].productId`}
                  value={row.productId}
                  onChange={(e) => updateRow(i, "productId", e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </Select>
              </td>
              <td className="py-1.5 pr-3">
                <Input
                  name={`lines[${i}].quantity`}
                  type="number"
                  min={0.01}
                  step="any"
                  value={row.quantity}
                  onChange={(e) => updateRow(i, "quantity", e.target.value)}
                  required
                />
              </td>
              <td className="py-1.5">
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-sm text-muted hover:text-danger"
                  aria-label="Remove line"
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button type="button" variant="secondary" size="sm" onClick={addRow}>
        <PlusIcon className="h-4 w-4" />
        Add Product
      </Button>
    </div>
  );
}

