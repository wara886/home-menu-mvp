import type { Dish } from "@/types";

export const categoryDisplayName: Record<string, string> = {
  鸡蛋类: "蛋香香",
  猪肉排骨: "嗷肉肉",
  鸡鸭禽类: "鸡鸭鸭",
  牛肉牛蛙: "牛蛙蛙",
  海鲜水产: "海鲜鲜",
  素菜豆制品: "吃素素",
  凉拌开胃: "凉拌拌",
  锅物粉条: "锅粉粉",
};

const categoryDescriptions: Record<string, string> = {
  鸡蛋类: "鸡蛋处理好，配菜洗净切好。",
  猪肉排骨: "家常下饭菜，今晚可以点这个。",
  鸡鸭禽类: "香香嫩嫩，适合当主菜。",
  牛肉牛蛙: "重口下饭，适合想吃辣的时候。",
  海鲜水产: "鲜香入味，适合加个硬菜。",
  素菜豆制品: "清爽不腻，搭配肉菜刚好。",
  凉拌开胃: "清爽开胃，适合饭前来一份。",
  锅物粉条: "热乎入味，适合想吃点暖的。",
};

export const getCategoryDisplayName = (category: string) =>
  categoryDisplayName[category] ?? category;

export const getDishDescription = (dish: Dish) =>
  categoryDescriptions[dish.category] ?? dish.steps[0] ?? "今晚可以点这个。";
