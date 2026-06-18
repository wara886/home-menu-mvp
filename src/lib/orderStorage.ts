import type { CartItem, Dish, Order, OrderStatus } from "@/types";

const CART_KEY = "home-menu-cart";

const hasLocalStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

const readJson = <T>(key: string, fallback: T): T => {
  if (!hasLocalStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T) => {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getImagePath = (imagePath: string) => {
  const encodedPath = imagePath
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `/images/${encodedPath}`;
};

export const addDishToCart = (items: CartItem[], dishId: number): CartItem[] => {
  const existing = items.find((item) => item.dishId === dishId);
  if (!existing) {
    return [...items, { dishId, quantity: 1, note: "" }];
  }

  return items.map((item) =>
    item.dishId === dishId ? { ...item, quantity: item.quantity + 1 } : item,
  );
};

export const changeCartQuantity = (
  items: CartItem[],
  dishId: number,
  quantity: number,
): CartItem[] => {
  if (quantity < 1) {
    return items.filter((item) => item.dishId !== dishId);
  }

  return items.map((item) => (item.dishId === dishId ? { ...item, quantity } : item));
};

export const changeCartItemNote = (
  items: CartItem[],
  dishId: number,
  note: string,
): CartItem[] => items.map((item) => (item.dishId === dishId ? { ...item, note } : item));

export const getSelectedDishCount = (items: CartItem[]) => items.length;

export const getTotalCartQuantity = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const removeDishFromCart = (items: CartItem[], dishId: number) =>
  items.filter((item) => item.dishId !== dishId);

export const clearCartItems = (_items: CartItem[]) => [];

export const buildOrder = (
  items: CartItem[],
  dishes: Dish[],
  customerName: string,
  remark: string,
  now = new Date().toISOString(),
  id = `order-${now}-${Math.random().toString(36).slice(2, 8)}`,
): Order => {
  const dishesById = new Map(dishes.map((dish) => [dish.id, dish]));

  return {
    id,
    customerName,
    items: items.flatMap((item) => {
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
    }),
    remark,
    status: "pending",
    totalPrice: 0,
    createdAt: now,
  };
};

export const replaceOrderStatus = (
  orders: Order[],
  orderId: string,
  status: OrderStatus,
  now = new Date().toISOString(),
): Order[] =>
  orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          status,
          updatedAt: now,
        }
      : order,
  );

export const getOrdersSortedByCreatedAtDesc = (orders: Order[]) =>
  [...orders].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );

export const getOrderStatusCounts = (orders: Order[]) =>
  orders.reduce(
    (counts, order) => ({
      ...counts,
      [order.status]: counts[order.status] + 1,
    }),
    {
      total: orders.length,
      pending: 0,
      cooking: 0,
      done: 0,
    },
  );

export const getNextOrderStatus = (status: OrderStatus): OrderStatus => {
  if (status === "pending") {
    return "cooking";
  }

  if (status === "cooking") {
    return "done";
  }

  return "done";
};

export const getCart = () => readJson<CartItem[]>(CART_KEY, []);

export const saveCart = (items: CartItem[]) => writeJson(CART_KEY, items);

export const clearCart = () => saveCart([]);
