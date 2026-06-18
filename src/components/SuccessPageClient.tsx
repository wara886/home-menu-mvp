"use client";

import { Check, ClipboardList, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SuccessPageClient() {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("orderId") ?? "");
  }, []);

  return (
    <main className="mx-auto grid min-h-screen max-w-[430px] place-items-center bg-[#fff8f1] px-4 py-8">
      <section className="w-full rounded-[24px] bg-white p-6 text-center shadow-sm ring-1 ring-stone-200">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#198754] text-white">
          <Check size={34} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-[28px] font-bold text-stone-950">下单成功</h1>
        <p className="mt-2 text-[16px] leading-7 text-stone-600">已通知厨房，等待投喂</p>
        {orderId ? (
          <p className="mt-3 rounded-[14px] bg-[#fffaf4] px-3 py-2 text-sm text-stone-500">
            订单编号：{orderId.slice(-6)}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#202124] px-4 py-3 text-base font-semibold text-white"
          >
            <Home size={19} aria-hidden="true" />
            继续点菜
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffcf56] px-4 py-3 text-base font-semibold text-[#202124]"
          >
            <ClipboardList size={19} aria-hidden="true" />
            查看订单
          </Link>
        </div>
      </section>
    </main>
  );
}
