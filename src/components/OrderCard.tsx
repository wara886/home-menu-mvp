"use client";

import type { Dish, Order, OrderStatus } from "@/types";

const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "待处理",
    className: "bg-[#fff7ed] text-[#c2410c] ring-[#fed7aa]",
  },
  cooking: {
    label: "制作中",
    className: "bg-[#ecfdf3] text-[#15803d] ring-[#bbf7d0]",
  },
  done: {
    label: "已完成",
    className: "bg-stone-100 text-stone-500 ring-stone-200",
  },
};

const actionLabels: Record<OrderStatus, string> = {
  pending: "开始做",
  cooking: "完成",
  done: "已完成",
};

interface OrderCardProps {
  order: Order;
  dishesById: Map<number, Dish>;
  onAdvanceStatus: (order: Order) => void;
}

export function OrderCard({ order, dishesById, onAdvanceStatus }: OrderCardProps) {
  const createdAt = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(order.createdAt));
  const status = statusMeta[order.status] ?? statusMeta.pending;
  const isDone = order.status === "done";

  return (
    <article className="rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-stone-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-stone-400">下单时间</p>
          <h2 className="mt-1 text-[18px] font-bold text-stone-950">{createdAt}</h2>
          <p className="mt-1 text-sm text-stone-500">点菜人：{order.customerName || "未填写"}</p>
          <p className="mt-1 text-sm text-stone-500">
            订单编号：<span className="font-semibold text-stone-700">{order.id.slice(-6)}</span>
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-bold ring-1 ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {order.items.map((item) => {
          const dish = dishesById.get(item.dishId);

          return (
            <li key={item.dishId} className="rounded-[14px] bg-[#fffaf4] p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold text-stone-900">
                    {item.name || dish?.name || `菜品 ${item.dishId}`}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {item.category || dish?.category || "未分类"} · 0 元
                  </p>
                </div>
                <span className="shrink-0 text-[15px] font-bold text-stone-700">
                  x {item.quantity}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-[14px] bg-stone-100 p-3">
        <p className="text-xs font-semibold text-stone-400">备注</p>
        <p className="mt-1 text-[15px] leading-6 text-stone-700">
          {order.remark ? order.remark : "无备注"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
        <div>
          <p className="text-sm font-medium text-stone-500">合计</p>
          <p className="mt-0.5 text-lg font-bold text-[#16a34a]">{order.totalPrice} 元</p>
        </div>
        <button
          type="button"
          onClick={() => onAdvanceStatus(order)}
          disabled={isDone}
          className="min-h-11 rounded-full bg-[#16a34a] px-5 text-[15px] font-bold text-white disabled:bg-stone-200 disabled:text-stone-500"
        >
          {actionLabels[order.status] ?? "开始做"}
        </button>
      </div>
    </article>
  );
}
