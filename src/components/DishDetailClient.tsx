"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CartBar } from "@/components/CartBar";
import {
  addDishToCart,
  getCart,
  getImagePath,
  getSelectedDishCount,
  saveCart,
} from "@/lib/orderStorage";
import type { CartItem, Dish } from "@/types";

interface DishDetailClientProps {
  dish: Dish;
}

export function DishDetailClient({ dish }: DishDetailClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const selectedDishCount = getSelectedDishCount(cart);

  const handleAdd = () => {
    const nextCart = addDishToCart(cart, dish.id);
    setCart(nextCart);
    saveCart(nextCart);
  };

  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-[#fff8f1] pb-[128px]">
      <div className="relative aspect-[4/3] bg-stone-100">
        <img
          src={getImagePath(dish.cover_image)}
          alt={dish.name}
          className="h-full w-full object-cover"
        />
        <Link
          href="/"
          aria-label="返回首页"
          className="absolute left-4 top-[calc(env(safe-area-inset-top)+14px)] grid size-11 place-items-center rounded-full bg-white/92 text-stone-950 shadow-sm"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
      </div>

      <section className="px-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#d14b2a]">{dish.category}</p>
            <h1 className="mt-1 text-[28px] font-bold leading-tight text-stone-950">{dish.name}</h1>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`加入${dish.name}`}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-[#198754] text-white shadow-sm active:scale-95"
          >
            <Plus size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {dish.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-stone-700 ring-1 ring-stone-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="text-xl font-bold text-stone-950">做法步骤</h2>
        <ol className="mt-3 space-y-3">
          {dish.steps.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-[18px] bg-white p-4 ring-1 ring-stone-200">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ffcf56] text-sm font-bold text-stone-950">
                {index + 1}
              </span>
              <p className="text-[16px] leading-7 text-stone-800">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 pt-6">
        <h2 className="text-xl font-bold text-stone-950">原始菜谱卡片</h2>
        <div className="mt-3 overflow-hidden rounded-[18px] bg-white ring-1 ring-stone-200">
          <img
            src={getImagePath(dish.source_card_image)}
            alt={`${dish.name}原始菜谱卡片`}
            className="w-full"
            loading="lazy"
          />
        </div>
      </section>

      <CartBar selectedDishCount={selectedDishCount} />
    </main>
  );
}
