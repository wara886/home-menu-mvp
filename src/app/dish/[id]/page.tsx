import { notFound } from "next/navigation";

import { DishDetailClient } from "@/components/DishDetailClient";
import { dishes, getDishById } from "@/lib/dishes";

export function generateStaticParams() {
  return dishes.map((dish) => ({ id: String(dish.id) }));
}

export default async function DishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dish = getDishById(Number(id));

  if (!dish) {
    notFound();
  }

  return <DishDetailClient dish={dish} />;
}
