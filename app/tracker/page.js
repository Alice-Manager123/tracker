"use client";
import { useEffect } from "react";
import Tracker from "@/components/Tracker";

export default function TrackerPage() {
  useEffect(() => {
    fetch("/api/setup", { method: "POST" });
  }, []);
  return <Tracker />;
}
