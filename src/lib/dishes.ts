import dishesData from "@/data/dishes.json";
import type { Dish } from "@/types";

export const dishes = dishesData as Dish[];

export const categories = Array.from(new Set(dishes.map((dish) => dish.category)));

export const getDishById = (id: number) => dishes.find((dish) => dish.id === id);

export const getDishesById = () => new Map(dishes.map((dish) => [dish.id, dish]));
