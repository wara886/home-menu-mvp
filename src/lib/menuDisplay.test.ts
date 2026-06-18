import { describe, expect, it } from "vitest";

import {
  getCategoryDisplayName,
  getDishDescription,
} from "./menuDisplay";
import type { Dish } from "@/types";

const makeDish = (dish: Partial<Dish> & Pick<Dish, "id" | "category">): Dish => ({
  id: dish.id,
  name: dish.name ?? "测试菜",
  category: dish.category,
  video_time_sec: dish.video_time_sec ?? 0,
  video_time: dish.video_time ?? "00:00",
  cover_image: dish.cover_image ?? "covers/001_西红柿炒鸡蛋_cover.jpg",
  source_card_image: dish.source_card_image ?? "recipe_cards/001_西红柿炒鸡蛋.jpg",
  steps: dish.steps ?? [],
  tags: dish.tags ?? [dish.category],
  image_step_check: dish.image_step_check,
});

describe("menu display helpers", () => {
  it("maps raw categories to playful display names", () => {
    expect(getCategoryDisplayName("鸡蛋类")).toBe("蛋香香");
    expect(getCategoryDisplayName("猪肉排骨")).toBe("嗷肉肉");
    expect(getCategoryDisplayName("素菜豆制品")).toBe("吃素素");
  });

  it("uses short category descriptions when dishes have no description field", () => {
    expect(getDishDescription(makeDish({ id: 1, category: "牛肉牛蛙" }))).toBe(
      "重口下饭，适合想吃辣的时候。",
    );
    expect(getDishDescription(makeDish({ id: 2, category: "锅物粉条" }))).toBe(
      "热乎入味，适合想吃点暖的。",
    );
  });

});
