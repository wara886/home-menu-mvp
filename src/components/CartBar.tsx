"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface CartSummaryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  imageSrc: string;
}

interface CartBarProps {
  selectedDishCount: number;
  totalQuantity?: number;
  summaryItems?: CartSummaryItem[];
  onIncrement?: (dishId: number) => void;
  onDecrement?: (dishId: number) => void;
  onRemove?: (dishId: number) => void;
  onClear?: () => void;
}

export function CartBar({
  selectedDishCount,
  totalQuantity = 0,
  summaryItems = [],
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
}: CartBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasItems = selectedDishCount > 0;
  const hasSummary = hasItems && summaryItems.length > 0;

  const handleClear = () => {
    onClear?.();
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+4px)] pt-0">
      {isOpen ? (
        <div className="mx-auto mb-2 max-w-[398px] overflow-hidden rounded-[18px] bg-white shadow-2xl ring-1 ring-stone-200">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2.5">
            <div>
              <div className="text-[17px] font-bold text-stone-950">已点菜品</div>
              <div className="mt-0.5 text-[13px] text-stone-500">
                已选 {selectedDishCount} 道菜 / 共 {totalQuantity} 份
              </div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full bg-stone-100 px-3 py-1.5 text-[13px] font-semibold text-stone-500"
            >
              清空
            </button>
          </div>

          {hasSummary ? (
            <div className="max-h-[292px] space-y-2 overflow-y-auto bg-[#fbfaf6] p-3">
              {summaryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-[14px] bg-white p-2.5 ring-1 ring-stone-100"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-[8px] bg-stone-200">
                    <img
                      src={item.imageSrc}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.opacity = "0";
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold text-stone-950">
                      {item.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="truncate text-[12px] text-stone-500">
                        {item.category}
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#0f8a45]">
                        0 元
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove?.(item.id)}
                      className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-stone-400"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      删除
                    </button>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDecrement?.(item.id)}
                      aria-label={`减少${item.name}数量`}
                      className="grid size-8 place-items-center rounded-full border border-[#0f8a45] bg-white text-[#0f8a45]"
                    >
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <span className="min-w-5 text-center text-[14px] font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrement?.(item.id)}
                      aria-label={`增加${item.name}数量`}
                      className="grid size-8 place-items-center rounded-full bg-[#0f8a45] text-white"
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#fbfaf6] px-4 py-8 text-center text-[15px] font-semibold text-stone-500">
              还没有点菜
            </div>
          )}

          <div className="flex items-center justify-between border-t border-stone-100 px-4 py-3">
            <span className="text-[14px] text-stone-500">合计</span>
            <span className="whitespace-nowrap text-[18px] font-bold text-[#0f8a45]">0 元</span>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[398px] items-center justify-between rounded-full bg-[#202124] p-1.5 pl-2 text-white shadow-2xl">
        <button
          type="button"
          onClick={() => setIsOpen((current) => (hasItems ? !current : true))}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
          aria-label="查看已点菜品"
        >
          <div className="grid size-10 place-items-center rounded-full bg-[#0f8a45]">
            <ShoppingCart size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold">已选 {selectedDishCount} 道菜</div>
            <div className="truncate whitespace-nowrap text-[12px] text-white/68">合计 0 元</div>
          </div>
        </button>

        {hasItems ? (
          <Link
            href="/cart"
            className="rounded-full bg-[#0f8a45] px-4 py-2.5 text-[15px] font-semibold text-white"
          >
            去下单
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-full bg-stone-200 px-4 py-2.5 text-[15px] font-semibold text-stone-500"
          >
            去下单
          </button>
        )}
      </div>
    </div>
  );
}
