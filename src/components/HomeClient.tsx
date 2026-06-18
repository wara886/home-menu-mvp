"use client";

import { ClipboardList, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CartBar } from "@/components/CartBar";
import { DishCard } from "@/components/DishCard";
import { getCategoryDisplayName } from "@/lib/menuDisplay";
import {
  getDishImage,
  getSelectedDishCount,
  getTotalCartQuantity,
} from "@/lib/orderStorage";
import { useCart } from "@/lib/useCart";
import type { Dish } from "@/types";

interface HomeClientProps {
  dishes: Dish[];
}

export function HomeClient({ dishes }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("");
  const { cart, increment, decrement, remove, clear } = useCart();

  const categories = useMemo(
    () => Array.from(new Set(dishes.map((dish) => dish.category))),
    [dishes],
  );
  const currentCategory = activeCategory || categories[0] || "";

  const filteredDishes = currentCategory
    ? dishes.filter((dish) => dish.category === currentCategory)
    : dishes;
  const currentCategoryDisplayName = getCategoryDisplayName(currentCategory);

  const selectedDishCount = getSelectedDishCount(cart);
  const cartQuantityByDish = useMemo(
    () => new Map(cart.map((item) => [item.dishId, item.quantity])),
    [cart],
  );
  const dishesById = useMemo(() => new Map(dishes.map((dish) => [dish.id, dish])), [dishes]);
  const totalQuantity = getTotalCartQuantity(cart);
  const cartSummaryItems = cart
    .map((item) => {
      const dish = dishesById.get(item.dishId);
      if (!dish) {
        return null;
      }

      return {
        id: dish.id,
        name: dish.name,
        category: getCategoryDisplayName(dish.category),
        quantity: item.quantity,
        imageSrc: getDishImage(dish),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <main className="mx-auto min-h-screen max-w-[430px] overflow-hidden bg-[#f4f1e9] text-stone-950">
      <header className="relative h-[230px] overflow-hidden bg-[linear-gradient(135deg,#064e3b_0%,#0f8a45_58%,#72b86d_100%)] px-4 pb-3 pt-[calc(env(safe-area-inset-top)+16px)] text-white">
        <div className="absolute -right-10 -top-12 size-36 rounded-full bg-white/10" />
        <div className="absolute bottom-4 right-8 size-16 rounded-full bg-[#ffd166]/18" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-white text-[24px] font-bold text-[#0f8a45] shadow-sm ring-1 ring-white/40">
              然
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[22px] font-bold leading-tight">然然的养猪场</h1>
              <p className="mt-1.5 text-[13px] leading-5 text-white/82">
                82 道家常菜 · 全部 0 元
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label="搜索"
              className="grid size-9 place-items-center rounded-full bg-white/18 text-white shadow-sm ring-1 ring-white/20 backdrop-blur"
            >
              <Search size={19} aria-hidden="true" />
            </button>
            <Link
              href="/orders"
              aria-label="订单"
              className="grid size-9 place-items-center rounded-full bg-white/18 text-white shadow-sm ring-1 ring-white/20 backdrop-blur"
            >
              <ClipboardList size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-[16px] bg-white/16 px-3.5 py-2.5 text-[13px] font-medium text-white/88 shadow-sm ring-1 ring-white/14 backdrop-blur">
          点完菜，男朋友开做
        </div>
      </header>

      <section className="flex bg-[#fbfaf6] pb-[132px]" style={{ height: 'calc(100dvh - 230px)' }}>
        <aside className="w-[104px] shrink-0 overflow-y-auto bg-[#eceee9] py-2">
          {categories.map((category) => {
            const isActive = category === currentCategory;
            const displayName = getCategoryDisplayName(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`relative flex h-[70px] w-full items-center px-3 text-left text-[16px] font-bold leading-5 transition ${
                  isActive ? "bg-[#fbfaf6] text-[#0f8a45]" : "text-stone-700"
                }`}
              >
                {isActive ? (
                  <span className="absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full bg-[#0f8a45]" />
                ) : null}
                <span className="whitespace-nowrap">{displayName}</span>
              </button>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto bg-[#fbfaf6] px-3 pb-8 pt-3">
          <div className="mb-3 flex items-center justify-between pt-1">
            <h2 className="text-[18px] font-bold text-stone-950">
              {currentCategoryDisplayName}({filteredDishes.length})
            </h2>
          </div>

          <div className="space-y-3">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                quantity={cartQuantityByDish.get(dish.id) ?? 0}
                onIncrement={increment}
                onDecrement={decrement}
              />
            ))}
          </div>
        </div>
      </section>

      <CartBar
        selectedDishCount={selectedDishCount}
        totalQuantity={totalQuantity}
        summaryItems={cartSummaryItems}
        onIncrement={increment}
        onDecrement={decrement}
        onRemove={remove}
        onClear={clear}
      />
    </main>
  );
}
