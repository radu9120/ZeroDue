"use client";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

const InvoiceItemRow = ({
  index,
  onRemove,
  taxLabel,
}: {
  index: number;
  onRemove: () => void;
  taxLabel?: string;
}) => {
  const { control, register, setValue } = useFormContext();

  const quantity = useWatch({ control, name: `items.${index}.quantity` });
  const unitPrice = useWatch({ control, name: `items.${index}.unit_price` });
  const tax = useWatch({ control, name: `items.${index}.tax` });

  useEffect(() => {
    const q = Number(quantity) || 0;
    const u = Number(unitPrice) || 0;
    const t = Number(tax) || 0;

    const baseAmount = u * q;
    const taxAmount = baseAmount * (t / 100);
    const total = baseAmount + taxAmount;

    setValue(`items.${index}.amount`, parseFloat(total.toFixed(2)));
  }, [quantity, unitPrice, tax, index, setValue]);

  return (
    <div
      key={index}
      className="border-t py-3 space-y-3 pl-2 pr-2 sm:pr-4 border-blue-100"
    >
      {/* Mobile: Stack all fields vertically, Desktop: Grid layout */}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4 py-3">
        {/* Description with Delete Button */}
        <div className="flex gap-2 sm:gap-4 items-center">
          <div className="w-8 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:bg-red-50 p-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <FormField
            name={`items.${index}.description`}
            render={() => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className=""
                    placeholder="Item description"
                    {...register(`items.${index}.description`)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Quantity, Price, Tax - Responsive Grid */}
        <div className="grid grid-cols-3 gap-2 w-full items-center">
          {/* Quantity */}
          <div className="">
            <FormField
              name={`items.${index}.quantity`}
              render={() => (
                <FormItem>
                  <FormLabel className="md:hidden block text-xs text-secondary-text dark:text-slate-400 mb-1">
                    Qty
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      className=""
                      min="1"
                      {...register(`items.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Unit Price */}
          <div className="">
            <FormField
              name={`items.${index}.unit_price`}
              render={() => (
                <FormItem>
                  <FormLabel className="md:hidden block text-xs text-secondary-text dark:text-slate-400 mb-1">
                    Rate
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      min="0.00"
                      className="w-full text-center"
                      {...register(`items.${index}.unit_price`, {
                        valueAsNumber: true,
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="">
            {/* Tax (%) */}
            <FormField
              name={`items.${index}.tax`}
              render={() => (
                <FormItem className="relative ">
                  <FormLabel className="md:hidden block text-xs text-secondary-text dark:text-slate-400 mb-1">
                    {taxLabel}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        min="0"
                        {...register(`items.${index}.tax`, {
                          valueAsNumber: true,
                          setValueAs: (v) =>
                            v === null || v === undefined ? 0 : v,
                        })}
                        className="pr-6 w-full"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-500 text-sm">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="w-full flex justify-end">
        <div className="flex gap-4 text-right font-medium text-primary-text dark:text-slate-300">
          {/* Amount (read-only) */}
          <FormLabel className="text-base">Ammount:</FormLabel>
          <FormField
            name={`items.${index}.amount`}
            render={() => (
              <FormItem>
                <FormControl>
                  <span>
                    £
                    {(
                      useWatch({ control, name: `items.${index}.amount` }) ?? 0
                    ).toFixed(2)}
                  </span>
                  {/* <Input
                                    type="number"
                                    readOnly
                                    {...register(`items.${index}.amount`, { valueAsNumber: true })}
                                    className="bg-gray-100 cursor-not-allowed "
                                /> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

const InvoiceItems = ({ taxLabel = "VAT" }: { taxLabel?: string }) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-header-text dark:text-slate-100">
          Line Items
        </h3>
        <Button
          onClick={() =>
            append({
              description: "",
              unit_price: 0,
              quantity: 0,
              tax: 0,
              amount: 0,
            })
          }
          size="sm"
          className="bg-primary text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
      <div className="bg-white dark:bg-slate-800 border border-blue-100 rounded-lg overflow-hidden">
        <div className="w-full">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden md:block bg-blue-50 pl-2 pr-2 sm:pr-4">
            <div className="grid grid-cols-2 gap-4 py-3">
              <div className="flex text-left gap-2 sm:gap-4 text-sm font-medium text-secondary-text dark:text-slate-400">
                <div className="w-8"></div>
                <p>Description</p>
              </div>
              <div className="grid grid-cols-3 gap-2 w-full">
                <div className="text-center text-sm font-medium text-secondary-text dark:text-slate-400">
                  <p>Qty</p>
                </div>
                <div className="text-center text-sm font-medium text-secondary-text dark:text-slate-400">
                  <p>Rate</p>
                </div>
                <div className="text-center text-sm font-medium text-secondary-text dark:text-slate-400">
                  <p>{taxLabel}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile: No header - fields are stacked */}
          <div>
            {fields.map((field, index) => (
              <InvoiceItemRow
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
                taxLabel={taxLabel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItems;
