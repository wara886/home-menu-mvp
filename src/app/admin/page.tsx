import { AdminPageClient } from "@/components/AdminPageClient";
import { dishes } from "@/lib/dishes";

export default function AdminPage() {
  return <AdminPageClient dishes={dishes} />;
}
