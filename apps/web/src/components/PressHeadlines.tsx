import { fetchPressHeadlines } from "@/lib/press";
import { PressNews } from "./PressNews";

export async function PressHeadlines() {
  return <PressNews initialHeadlines={await fetchPressHeadlines()} />;
}
