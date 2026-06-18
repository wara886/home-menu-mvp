import { dishes } from "@/lib/dishes";
import { HomeClient } from "@/components/HomeClient";

export default function Home() {
  return <HomeClient dishes={dishes} />;
}
