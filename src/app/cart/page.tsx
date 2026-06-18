import { CartPageClient } from "@/components/CartPageClient";
import { dishes } from "@/lib/dishes";

export default function CartPage() {
  return <CartPageClient dishes={dishes} />;
}
