import Tracker from "@/components/Tracker";
import { setupDB } from "@/lib/db";

export default async function TrackerPage() {
  await setupDB();
  return <Tracker />;
}