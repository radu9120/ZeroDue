import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { InvoiceItemRow } from "./types";
import { InvoiceItemsMobileList } from "./InvoiceItemsMobileList";

interface InvoiceItemsTableProps {
  isEditing: boolean;
  canEditFullInvoice: boolean;
  itemRows: InvoiceItemRow[];
  items: InvoiceItemRow[];
  onItemChange: (index: number, patch: Partial<InvoiceItemRow>) => void;
  onItemRemove: (index: number) => void;
  onAddItem: () => void;
  onRecalculate: () => void;
  currency: string;
  invoiceCurrency: string;
  getCurrencySymbol: (code?: string) => string;
  isCompactLayout: boolean;
  taxLabel?: string;
  template?: string;
}

export function InvoiceItemsTable({
  isEditing,
  canEditFullInvoice,
  itemRows,
  items,
  onItemChange,
  onItemRemove,
  onAddItem,
  onRecalculate,
  currency,
  invoiceCurrency,
  getCurrencySymbol,
  isCompactLayout,
  taxLabel = "VAT",
  template,
}: InvoiceItemsTableProps) {
  const isHourly = template === "hourly" || template === "freelance";
  const isTimesheet = template === "timesheet";
  const qtyLabel = isHourly ? "Hours" : "Qty";
  const priceLabel = isHourly ? "Rate/Hr" : "Unit Price";

  if (isCompactLayout) {
    return (
      <InvoiceItemsMobileList
        isEditing={isEditing}
        canEditFullInvoice={canEditFullInvoice}
        itemRows={itemRows}
        items={items}
        onItemChange={onItemChange}
        onItemRemove={onItemRemove}
        onAddItem={onAddItem}
        onRecalculate={onRecalculate}
        currency={currency}
        invoiceCurrency={invoiceCurrency}
        getCurrencySymbol={getCurrencySymbol}
        taxLabel={taxLabel}
        template={template}
      />
    );
  }

  return (
    <div className="mb-6" style={{ marginBottom: "24px" }}>
      <div
        className="overflow-x-auto"
        style={{ overflowX: isCompactLayout ? "auto" : "visible" }}
      >
        <div className="overflow-hidden rounded-xl border border-slate-700 dark:border-slate-600">
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: isCompactLayout ? 640 : "100%",
            }}
          >
            <thead>
              <tr className="bg-slate-800 dark:bg-slate-700 text-white">
                {isTimesheet ? (
                  <>
                    <th
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Day
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Date
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide"
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Start
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide"
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Finish
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide"
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Hours
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Amount
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                      }}
                    >
                      Description
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide w-20"
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "80px",
                      }}
                    >
                      {qtyLabel}
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide w-28"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "112px",
                      }}
                    >
                      {priceLabel}
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide w-20"
                      style={{
                        padding: "12px 16px",
                        textAlign: "center",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "80px",
                      }}
                    >
                      {taxLabel}
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide w-32"
                      style={{
                        padding: "12px 16px",
                        textAlign: "right",
                        fontSize: "11px",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        width: "128px",
                      }}
                    >
                      Amount
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800">
              {isEditing && canEditFullInvoice ? (
                itemRows.length > 0 ? (
                  itemRows.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                    >
                      {isTimesheet ? (
                        <>
                          <td className="px-4 py-3 text-sm dark:text-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 dark:text-slate-400 w-24">
                                {item.description
                                  ? new Date(
                                      item.description
                                    ).toLocaleDateString("en-US", {
                                      weekday: "long",
                                    })
                                  : "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <input
                              type="date"
                              value={item.description || ""}
                              onChange={(event) =>
                                onItemChange(index, {
                                  description: event.target.value,
                                })
                              }
                              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1.5 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="time"
                              value={item.start_time || ""}
                              onChange={(event) =>
                                onItemChange(index, {
                                  start_time: event.target.value,
                                })
                              }
                              className="w-full text-center text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="time"
                              value={item.end_time || ""}
                              onChange={(event) =>
                                onItemChange(index, {
                                  end_time: event.target.value,
                                })
                              }
                              className="w-full text-center text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={0}
                              step={0.1}
                              value={Number(item.quantity ?? 0)}
                              onChange={(event) => {
                                const next = parseFloat(
                                  event.target.value || "0"
                                );
                                onItemChange(index, {
                                  quantity: Number.isFinite(next) ? next : 0,
                                });
                                onRecalculate();
                              }}
                              className="w-16 text-center text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-slate-100">
                            {getCurrencySymbol(currency)}
                            {Number(item.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-3 text-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onItemRemove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm dark:text-slate-200">
                            <div className="flex items-center gap-2">
                              <input
                                value={item.description || ""}
                                onChange={(event) =>
                                  onItemChange(index, {
                                    description: event.target.value,
                                  })
                                }
                                placeholder="Item description"
                                className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1.5 text-sm"
                              />
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => onItemRemove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={Number(item.quantity ?? 0)}
                              onChange={(event) => {
                                const next = parseInt(
                                  event.target.value || "0",
                                  10
                                );
                                onItemChange(index, {
                                  quantity: Number.isFinite(next) ? next : 0,
                                });
                                onRecalculate();
                              }}
                              className="w-16 text-center text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={Number(item.unit_price ?? 0)}
                              onChange={(event) => {
                                const next = parseFloat(
                                  event.target.value || "0"
                                );
                                onItemChange(index, {
                                  unit_price: Number.isFinite(next) ? next : 0,
                                });
                                onRecalculate();
                              }}
                              className="w-24 text-right text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.01}
                              value={Number(item.tax ?? 0)}
                              onChange={(event) => {
                                const next = parseFloat(
                                  event.target.value || "0"
                                );
                                onItemChange(index, {
                                  tax: Number.isFinite(next) ? next : 0,
                                });
                                onRecalculate();
                              }}
                              className="w-16 text-center text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-slate-100">
                            {getCurrencySymbol(currency)}
                            {Number(item.amount || 0).toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={isTimesheet ? 7 : 5}
                      className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400"
                    >
                      No items yet
                    </td>
                  </tr>
                )
              ) : items.length > 0 ? (
                items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                  >
                    {isTimesheet ? (
                      <>
                        <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-slate-200">
                          {item.description
                            ? new Date(item.description).toLocaleDateString(
                                "en-US",
                                { weekday: "long" }
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-slate-200">
                          {item.description
                            ? new Date(item.description).toLocaleDateString(
                                "en-US"
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm text-gray-900 dark:text-slate-200">
                          {item.start_time || "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm text-gray-900 dark:text-slate-200">
                          {item.end_time || "-"}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm text-gray-900 dark:text-slate-200">
                          {Number(item.quantity || 0)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-slate-100">
                          {getCurrencySymbol(invoiceCurrency)}{" "}
                          {Number(item.amount || 0).toFixed(2)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3.5 text-sm text-gray-900 dark:text-slate-200">
                          {item.description || "No description"}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm text-gray-900 dark:text-slate-200">
                          {Number(item.quantity || 0)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-sm text-gray-900 dark:text-slate-200">
                          {getCurrencySymbol(invoiceCurrency)}{" "}
                          {Number(item.unit_price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-center text-sm text-gray-900 dark:text-slate-200">
                          {Number(item.tax || 0)}%
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-slate-100">
                          {getCurrencySymbol(invoiceCurrency)}{" "}
                          {Number(item.amount || 0).toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isTimesheet ? 6 : 5}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400"
                  >
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isEditing && canEditFullInvoice && (
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={onAddItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      )}
    </div>
  );
}
