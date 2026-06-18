import type { RealtimeChannel } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { Order, OrderItem, OrderStatus } from "@/types";

type OrderRow = {
  id: string;
  customer_name: string | null;
  items: OrderItem[];
  remark: string | null;
  total_price: number | string | null;
  status: string | null;
  created_at: string;
};

export interface CreateOrderInput {
  customerName?: string;
  items: OrderItem[];
  remark?: string;
  totalPrice?: 0;
}

const validStatuses: OrderStatus[] = ["pending", "cooking", "done"];

const normalizeStatus = (status: string | null): OrderStatus =>
  validStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : "pending";

const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  customerName: row.customer_name ?? "家里人",
  items: row.items,
  remark: row.remark ?? "",
  status: normalizeStatus(row.status),
  totalPrice: 0,
  createdAt: row.created_at,
});

export const createOrder = async (orderInput: CreateOrderInput): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: orderInput.customerName ?? "家里人",
      items: orderInput.items,
      remark: orderInput.remark ?? "",
      total_price: orderInput.totalPrice ?? 0,
      status: "pending",
    })
    .select("id, customer_name, items, remark, total_price, status, created_at")
    .single<OrderRow>();

  if (error) {
    throw error;
  }

  return mapOrderRow(data);
};

export const listOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_name, items, remark, total_price, status, created_at")
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapOrderRow);
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
): Promise<Order> => {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("id, customer_name, items, remark, total_price, status, created_at")
    .single<OrderRow>();

  if (error) {
    throw error;
  }

  return mapOrderRow(data);
};

export const subscribeOrders = (callback: () => void): RealtimeChannel => {
  const channel = supabase
    .channel("orders-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          callback();
        }
      },
    )
    .subscribe((status, error) => {
      if (error) {
        console.error("Supabase orders realtime error:", error);
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("Supabase orders realtime failed:", status);
      }
    });

  return channel;
};

export const unsubscribeOrders = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
