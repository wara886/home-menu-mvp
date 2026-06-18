import { describe, expect, it } from "vitest";

import {
  addDishToCart,
  buildOrder,
  changeCartQuantity,
  clearCartItems,
  getSelectedDishCount,
  getImagePath,
  getNextOrderStatus,
  getOrderStatusCounts,
  getOrdersSortedByCreatedAtDesc,
  getTotalCartQuantity,
  removeDishFromCart,
  replaceOrderStatus,
} from "./orderStorage";
import type { Dish } from "@/types";

const dishes: Dish[] = [
  {
    id: 1,
    name: "西红柿炒鸡蛋",
    category: "鸡蛋类",
    video_time_sec: 2,
    video_time: "00:02",
    cover_image: "covers/001_西红柿炒鸡蛋_cover.jpg",
    source_card_image: "recipe_cards/001_西红柿炒鸡蛋.jpg",
    steps: [],
    tags: ["鸡蛋类"],
  },
  {
    id: 2,
    name: "红烧排骨",
    category: "猪肉排骨",
    video_time_sec: 3,
    video_time: "00:03",
    cover_image: "covers/002_红烧排骨_cover.jpg",
    source_card_image: "recipe_cards/002_红烧排骨.jpg",
    steps: [],
    tags: ["猪肉排骨"],
  },
];

describe("order storage helpers", () => {
  it("maps extracted image paths to public image URLs", () => {
    expect(getImagePath("covers/001_西红柿炒鸡蛋_cover.jpg")).toBe(
      "/images/covers/001_%E8%A5%BF%E7%BA%A2%E6%9F%BF%E7%82%92%E9%B8%A1%E8%9B%8B_cover.jpg",
    );
    expect(getImagePath("recipe_cards/001_西红柿炒鸡蛋.jpg")).toBe(
      "/images/recipe_cards/001_%E8%A5%BF%E7%BA%A2%E6%9F%BF%E7%82%92%E9%B8%A1%E8%9B%8B.jpg",
    );
  });

  it("adds a dish to the cart and increments existing quantity", () => {
    const first = addDishToCart([], 1);
    const second = addDishToCart(first, 1);

    expect(second).toEqual([{ dishId: 1, quantity: 2, note: "" }]);
  });

  it("counts selected dishes by unique dish item, not quantity", () => {
    expect(
      getSelectedDishCount([
        { dishId: 1, quantity: 3, note: "" },
        { dishId: 2, quantity: 1, note: "" },
      ]),
    ).toBe(2);
  });

  it("counts total cart quantity across selected dishes", () => {
    expect(
      getTotalCartQuantity([
        { dishId: 1, quantity: 3, note: "" },
        { dishId: 2, quantity: 2, note: "" },
      ]),
    ).toBe(5);
  });

  it("removes a dish from the cart directly", () => {
    const updated = removeDishFromCart(
      [
        { dishId: 1, quantity: 3, note: "" },
        { dishId: 2, quantity: 2, note: "" },
      ],
      1,
    );

    expect(updated).toEqual([{ dishId: 2, quantity: 2, note: "" }]);
  });

  it("clears all cart items", () => {
    expect(clearCartItems([{ dishId: 1, quantity: 3, note: "" }])).toEqual([]);
  });

  it("removes cart items when quantity is set below one", () => {
    const updated = changeCartQuantity(
      [
        { dishId: 1, quantity: 2, note: "" },
        { dishId: 2, quantity: 1, note: "" },
      ],
      1,
      0,
    );

    expect(updated).toEqual([{ dishId: 2, quantity: 1, note: "" }]);
  });

  it("builds a zero-yuan pending order with customer and expanded dish items", () => {
    const order = buildOrder(
      [{ dishId: 1, quantity: 2, note: "少辣" }],
      dishes,
      "然然",
      "少油少盐",
      "2026-06-18T10:00:00.000Z",
      "order-test-123456",
    );

    expect(order.id).toBe("order-test-123456");
    expect(order.customerName).toBe("然然");
    expect(order.status).toBe("pending");
    expect(order.totalPrice).toBe(0);
    expect(order.remark).toBe("少油少盐");
    expect(order.items).toEqual([
      {
        dishId: 1,
        name: "西红柿炒鸡蛋",
        category: "鸡蛋类",
        quantity: 2,
        coverImage: "covers/001_西红柿炒鸡蛋_cover.jpg",
        price: 0,
      },
    ]);
    expect(order.createdAt).toBe("2026-06-18T10:00:00.000Z");
  });

  it("updates order status without changing other orders", () => {
    const orders = [
      buildOrder(
        [{ dishId: 1, quantity: 1, note: "" }],
        dishes,
        "然然",
        "",
        "2026-06-18T10:00:00.000Z",
        "order-test-000001",
      ),
      buildOrder(
        [{ dishId: 2, quantity: 1, note: "" }],
        dishes,
        "然然",
        "",
        "2026-06-18T10:01:00.000Z",
        "order-test-000002",
      ),
    ];
    const updated = replaceOrderStatus(
      orders,
      orders[0].id,
      "done",
      "2026-06-18T10:02:00.000Z",
    );

    expect(updated[0].status).toBe("done");
    expect(updated[0].updatedAt).toBe("2026-06-18T10:02:00.000Z");
    expect(updated[1]).toEqual(orders[1]);
  });

  it("sorts orders by created time with newest first", () => {
    const oldest = buildOrder(
      [{ dishId: 1, quantity: 1, note: "" }],
      dishes,
      "然然",
      "",
      "2026-06-18T09:00:00.000Z",
      "order-test-oldest",
    );
    const newest = buildOrder(
      [{ dishId: 2, quantity: 1, note: "" }],
      dishes,
      "然然",
      "",
      "2026-06-18T11:00:00.000Z",
      "order-test-newest",
    );
    const middle = buildOrder(
      [{ dishId: 1, quantity: 2, note: "" }],
      dishes,
      "然然",
      "",
      "2026-06-18T10:00:00.000Z",
      "order-test-middle",
    );

    expect(getOrdersSortedByCreatedAtDesc([oldest, newest, middle]).map((order) => order.id)).toEqual(
      ["order-test-newest", "order-test-middle", "order-test-oldest"],
    );
  });

  it("counts orders by the three admin statuses", () => {
    const pending = buildOrder(
      [{ dishId: 1, quantity: 1, note: "" }],
      dishes,
      "然然",
      "",
      "2026-06-18T09:00:00.000Z",
      "order-test-pending",
    );
    const cooking = {
      ...buildOrder(
        [{ dishId: 2, quantity: 1, note: "" }],
        dishes,
        "然然",
        "",
        "2026-06-18T10:00:00.000Z",
        "order-test-cooking",
      ),
      status: "cooking" as const,
    };
    const done = {
      ...buildOrder(
        [{ dishId: 1, quantity: 2, note: "" }],
        dishes,
        "然然",
        "",
        "2026-06-18T11:00:00.000Z",
        "order-test-done",
      ),
      status: "done" as const,
    };

    expect(getOrderStatusCounts([pending, cooking, done])).toEqual({
      total: 3,
      pending: 1,
      cooking: 1,
      done: 1,
    });
  });

  it("advances admin order statuses through pending, cooking, and done", () => {
    expect(getNextOrderStatus("pending")).toBe("cooking");
    expect(getNextOrderStatus("cooking")).toBe("done");
    expect(getNextOrderStatus("done")).toBe("done");
  });
});
