"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { getDishDescription } from "@/lib/menuDisplay";
import { getImagePath } from "@/lib/orderStorage";
import type { Dish } from "@/types";

interface DishCardProps {
  dish: Dish;
  quantity: number;
  onIncrement: (dishId: number) => void;
  onDecrement: (dishId: number) => void;
}

export function DishCard({ dish, quantity, onIncrement, onDecrement }: DishCardProps) {
  const paddedId = String(dish.id).padStart(3, "0");
  const [imgSrc, setImgSrc] = useState(`/images/products/${paddedId}.jpg`);

  const handleImgError = () => {
    // 商品图加载失败，回退到 cover 图
    setImgSrc(getImagePath(dish.cover_image));
  };

  return (
    <article className="flex gap-2.5 rounded-[14px] bg-white p-2.5 shadow-sm ring-1 ring-stone-100">
      <Link
        href={`/dish/${dish.id}`}
        className="relative size-[100px] shrink-0 overflow-hidden rounded-[10px] bg-stone-200"
      >
        <img
          src={imgSrc}
          alt={dish.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={handleImgError}
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <Link href={`/dish/${dish.id}`} className="block">
          <h2 className="truncate text-[18px] font-bold leading-6 text-stone-950">
            {dish.name}
          </h2>
          <p className="mt-1 line-clamp-2 min-h-10 text-[13px] leading-5 text-stone-500">
            {getDishDescription(dish)}
          </p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[12px] tracking-[1px] text-[#f7b500]">★★★★★</span>
            <span className="truncate text-[11px] text-stone-400">然然推荐</span>
          </div>
        </Link>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="shrink-0 whitespace-nowrap text-[15px] font-bold text-[#0f8a45]">
            0 元
          </span>

          {quantity > 0 ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onDecrement(dish.id)}
                aria-label={`减少${dish.name}数量`}
                className="grid size-7 place-items-center rounded-full border border-[#0f8a45] bg-white text-[#0f8a45] active:scale-95"
              >
                <Minus size={13} aria-hidden="true" />
              </button>
              <span className="min-w-5 text-center text-[13px] font-semibold text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrement(dish.id)}
                aria-label={`增加${dish.name}数量`}
                className="grid size-7 place-items-center rounded-full bg-[#0f8a45] text-white shadow-sm active:scale-95"
              >
                <Plus size={13} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onIncrement(dish.id)}
              aria-label={`加入${dish.name}`}
              className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#0f8a45] text-white/90 shadow-sm active:scale-95"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
