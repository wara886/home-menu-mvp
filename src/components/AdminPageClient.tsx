"use client";

import { ArrowLeft, ClipboardList, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminLogin } from "@/components/AdminLogin";
import { OrderCard } from "@/components/OrderCard";
import { listOrders, subscribeOrders, unsubscribeOrders, updateOrderStatus } from "@/lib/orders";
import { getNextOrderStatus, getOrderStatusCounts } from "@/lib/orderStorage";
import type { Dish, Order } from "@/types";

interface AdminPageClientProps {
  dishes: Dish[];
}

export function AdminPageClient({ dishes }: AdminPageClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== "undefined" ? sessionStorage.getItem("admin_authenticated") === "true" : false,
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const dishesById = useMemo(() => new Map(dishes.map((dish) => [dish.id, dish])), [dishes]);
  const counts = useMemo(() => getOrderStatusCounts(orders), [orders]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setOrders(await listOrders());
    } catch (loadError) {
      console.error("Load admin orders failed:", loadError);
      setError("订单加载失败，请检查 Supabase 配置，或稍后手动刷新");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const channel = subscribeOrders(() => {
      loadOrders();
    });

    return () => {
      unsubscribeOrders(channel);
    };
  }, [loadOrders]);

  const handleAdvanceStatus = async (order: Order) => {
    const nextStatus = getNextOrderStatus(order.status);
    if (nextStatus === order.status) {
      return;
    }

    try {
      const updatedOrder = await updateOrderStatus(order.id, nextStatus);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === updatedOrder.id ? updatedOrder : currentOrder,
        ),
      );
    } catch (updateError) {
      console.error("Update order status failed:", updateError);
      setError("状态更新失败，请稍后重试");
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-[#fff8f1] px-4 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="返回点菜"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-stone-950 ring-1 ring-stone-200"
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </Link>
          <div>
            <p className="text-sm font-medium text-[#15803d]">管理后台</p>
            <h1 className="text-[28px] font-bold leading-tight text-stone-950">订单列表</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-3 text-[14px] font-semibold text-[#15803d] ring-1 ring-stone-200"
        >
          <RefreshCw size={16} aria-hidden="true" />
          刷新
        </button>
      </header>

      <section className="mt-4 rounded-[18px] bg-[#173f2b] p-4 text-white shadow-sm">
        <div>
          <p className="text-sm text-white/70">当前订单数</p>
          <p className="mt-1 text-3xl font-bold">{counts.total} 单</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-[14px] bg-white/12 p-3">
            <p className="text-xs text-white/68">待处理</p>
            <p className="mt-1 text-xl font-bold">{counts.pending}</p>
          </div>
          <div className="rounded-[14px] bg-white/12 p-3">
            <p className="text-xs text-white/68">制作中</p>
            <p className="mt-1 text-xl font-bold">{counts.cooking}</p>
          </div>
          <div className="rounded-[14px] bg-white/12 p-3">
            <p className="text-xs text-white/68">已完成</p>
            <p className="mt-1 text-xl font-bold">{counts.done}</p>
          </div>
        </div>
      </section>

      {error ? (
        <section className="mt-5 rounded-[20px] bg-white p-4 text-center text-[15px] font-semibold text-red-500 ring-1 ring-stone-200">
          {error}
        </section>
      ) : null}

      {isLoading ? (
        <section className="mt-5 rounded-[20px] bg-white p-6 text-center text-[15px] font-semibold text-stone-500 ring-1 ring-stone-200">
          正在加载订单...
        </section>
      ) : orders.length === 0 ? (
        <section className="mt-5 rounded-[20px] bg-white p-6 text-center ring-1 ring-stone-200">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#ecfdf3] text-[#15803d]">
            <ClipboardList size={27} aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-stone-950">还没有订单</h2>
          <p className="mt-2 text-[15px] leading-6 text-stone-500">
            下单后，这里会显示 Supabase 同步过来的点菜记录。
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#16a34a] px-5 text-[15px] font-bold text-white"
          >
            返回点菜
          </Link>
        </section>
      ) : (
        <section className="mt-5 space-y-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              dishesById={dishesById}
              onAdvanceStatus={handleAdvanceStatus}
            />
          ))}
        </section>
      )}
    </main>
  );
}
