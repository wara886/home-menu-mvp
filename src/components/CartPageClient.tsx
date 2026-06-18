"use client";

import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { getCategoryDisplayName } from "@/lib/menuDisplay";
import { createOrder } from "@/lib/orders";
import {
  getImagePath,
  getSelectedDishCount,
  getTotalCartQuantity,
} from "@/lib/orderStorage";
import { useCart } from "@/lib/useCart";
import type { Dish } from "@/types";

interface CartPageClientProps {
  dishes: Dish[];
}

export function CartPageClient({ dishes }: CartPageClientProps) {
  const router = useRouter();
  const { cart, increment, decrement, remove, clear } = useCart();
  const [remark, setRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dishesById = useMemo(() => new Map(dishes.map((dish) => [dish.id, dish])), [dishes]);
  const selectedDishCount = getSelectedDishCount(cart);
  const totalQuantity = getTotalCartQuantity(cart);
  const hasItems = selectedDishCount > 0;

  const handleSubmit = async () => {
    if (!hasItems || isSubmitting) {
      return;
    }

    const orderItems = cart.flatMap((item) => {
      const dish = dishesById.get(item.dishId);
      if (!dish) {
        return [];
      }

      return [
        {
          dishId: dish.id,
          name: dish.name,
          category: dish.category,
          quantity: item.quantity,
          coverImage: dish.cover_image,
          price: 0 as const,
        },
      ];
    });

    if (orderItems.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const order = await createOrder({
        customerName: "家里人",
        items: orderItems,
        remark: remark.trim(),
        totalPrice: 0,
      });

      // 推送通知到 iPhone（fire-and-forget）
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "家里人",
          items: orderItems,
          remark: remark.trim(),
          orderId: order.id,
        }),
      }).catch(() => {});

      clear();
      router.push(`/order/success?orderId=${order.id}`);
    } catch (submitError) {
      console.error("Submit order failed:", submitError);
      setError("提交失败，请检查 Supabase 配置后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-[#f4f1e9] px-4 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-5">
      <header className="flex items-start gap-3">
        <Link
          href="/"
          aria-label="返回首页"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-tight text-stone-950">确认点菜</h1>
          <p className="mt-1 text-[15px] leading-6 text-stone-500">
            全部 0 元，提交后男朋友接单
          </p>
        </div>
      </header>

      {!hasItems ? (
        <section className="mt-8 rounded-[22px] bg-white p-6 text-center shadow-sm ring-1 ring-stone-200">
          <h2 className="text-xl font-bold text-stone-950">还没有点菜，先去选几道吧</h2>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-[#202124] px-6 py-3 text-base font-semibold text-white"
          >
            返回首页
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-5 space-y-3">
            {cart.map((item) => {
              const dish = dishesById.get(item.dishId);

              if (!dish) {
                return null;
              }

              return (
                <article
                  key={item.dishId}
                  className="rounded-[18px] bg-white p-3 shadow-sm ring-1 ring-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-16 shrink-0 overflow-hidden rounded-[10px] bg-stone-200">
                      <img
                        src={getImagePath(dish.cover_image)}
                        alt={dish.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.opacity = "0";
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[17px] font-bold text-stone-950">
                        {dish.name}
                      </h2>
                      <div className="mt-1 flex items-center gap-2 text-[13px]">
                        <span className="truncate text-stone-500">
                          {getCategoryDisplayName(dish.category)}
                        </span>
                        <span className="whitespace-nowrap font-semibold text-[#0f8a45]">
                          0 元
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(item.dishId)}
                      aria-label={`删除${dish.name}`}
                      className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-500"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => decrement(item.dishId)}
                      aria-label={`减少${dish.name}数量`}
                      className="grid size-8 place-items-center rounded-full border border-[#0f8a45] bg-white text-[#0f8a45]"
                    >
                      <Minus size={15} aria-hidden="true" />
                    </button>
                    <span className="min-w-6 text-center text-[14px] font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => increment(item.dishId)}
                      aria-label={`增加${dish.name}数量`}
                      className="grid size-8 place-items-center rounded-full bg-[#0f8a45] text-white"
                    >
                      <Plus size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-4 rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-stone-100">
            <label className="text-[16px] font-bold text-stone-950" htmlFor="order-remark">
              口味备注
            </label>
            <textarea
              id="order-remark"
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder="比如：少油少盐，不要香菜，多放辣"
              rows={4}
              className="mt-3 w-full resize-none rounded-[14px] border border-stone-200 bg-[#fffaf4] px-4 py-3 text-[16px] leading-6 outline-none focus:border-[#0f8a45]"
            />
          </section>

          <section className="mt-5 rounded-[22px] bg-[#202124] p-4 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[16px] font-bold">
                  已选 {selectedDishCount} 道菜 / 共 {totalQuantity} 份
                </div>
                <div className="mt-1 text-sm text-white/68">合计 0 元</div>
              </div>
              <div className="text-2xl font-bold">0 元</div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasItems || isSubmitting}
              className={`mt-4 w-full rounded-full px-5 py-4 text-[17px] font-bold active:scale-[0.99] ${
                hasItems && !isSubmitting
                  ? "bg-[#0f8a45] text-white"
                  : "bg-stone-200 text-stone-500"
              }`}
            >
              {isSubmitting ? "正在提交..." : "0 元提交订单"}
            </button>
            {error ? <p className="mt-3 text-center text-sm font-semibold text-red-300">{error}</p> : null}
          </section>
        </>
      )}
    </main>
  );
}
