"use client";

import { ArrowLeft, ClipboardList, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { listOrders } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types";

const statusLabels: Record<OrderStatus, string> = {
  pending: "待处理",
  cooking: "制作中",
  done: "已完成",
};

const statusClassNames: Record<OrderStatus, string> = {
  pending: "bg-[#fff7ed] text-[#c2410c] ring-[#fed7aa]",
  cooking: "bg-[#ecfdf3] text-[#15803d] ring-[#bbf7d0]",
  done: "bg-stone-100 text-stone-500 ring-stone-200",
};

const formatOrderTime = (createdAt: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));

export function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      setError("");

      try {
        setOrders(await listOrders());
      } catch (loadError) {
        console.error("Load orders failed:", loadError);
        setError("订单加载失败，请检查 Supabase 配置");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-[#fff8f1] px-4 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-5">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="返回首页"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
        >
          <ArrowLeft size={22} aria-hidden="true" />
        </Link>
        <div>
          <p className="text-sm font-medium text-[#15803d]">已点菜单</p>
          <h1 className="text-[28px] font-bold leading-tight text-stone-950">订单记录</h1>
        </div>
      </header>

      {error ? (
        <section className="mt-5 rounded-[20px] bg-white p-5 text-center text-[15px] font-semibold text-red-500 ring-1 ring-stone-200">
          {error}
        </section>
      ) : isLoading ? (
        <section className="mt-8 rounded-[22px] bg-white p-6 text-center text-[15px] font-semibold text-stone-500 shadow-sm ring-1 ring-stone-200">
          正在加载订单...
        </section>
      ) : orders.length === 0 ? (
        <section className="mt-8 rounded-[22px] bg-white p-6 text-center shadow-sm ring-1 ring-stone-200">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#ecfdf3] text-[#15803d]">
            <ClipboardList size={27} aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-stone-950">还没有点过菜</h2>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#16a34a] px-5 text-[15px] font-bold text-white"
          >
            <Home size={18} aria-hidden="true" />
            继续点菜
          </Link>
        </section>
      ) : (
        <section className="mt-5 space-y-3">
          {orders.map((order) => {
            const status = order.status in statusLabels ? order.status : "pending";

            return (
              <article
                key={order.id}
                className="rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-stone-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-stone-500">
                      订单编号：
                      <span className="font-semibold text-stone-700">{order.id.slice(-6)}</span>
                    </p>
                    <h2 className="mt-1 text-[18px] font-bold text-stone-950">
                      {formatOrderTime(order.createdAt)}
                    </h2>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold ring-1 ${statusClassNames[status]}`}
                  >
                    {statusLabels[status]}
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.dishId}
                      className="flex items-center justify-between gap-3 rounded-[14px] bg-[#fffaf4] p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold text-stone-900">
                          {item.name}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-sm text-[#15803d]">0 元</p>
                      </div>
                      <span className="shrink-0 text-[15px] font-bold text-stone-700">
                        x {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 rounded-[14px] bg-stone-100 p-3">
                  <p className="text-xs font-semibold text-stone-400">备注</p>
                  <p className="mt-1 text-[15px] leading-6 text-stone-700">
                    {order.remark ? order.remark : "无备注"}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span className="text-sm font-medium text-stone-500">合计</span>
                  <span className="whitespace-nowrap text-lg font-bold text-[#16a34a]">
                    {order.totalPrice} 元
                  </span>
                </div>
              </article>
            );
          })}

          <Link
            href="/"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#16a34a] px-5 text-[16px] font-bold text-white"
          >
            <Home size={18} aria-hidden="true" />
            继续点菜
          </Link>
        </section>
      )}
    </main>
  );
}
