"use client";

import { useWhiteboard } from "@/store";
import { Circle, Text, Square } from "lucide-react";

export default function Toolbar() {
  const { createLayer } = useWhiteboard();
  return (
    <ul className="absolute top-1/2 p-4 z-50 -translate-y-1/2 start-3 rounded-xl border-2  flex flex-col items-center justify-center gap-2">
      <li onClick={() => createLayer("Rectangle")}>
        <Square size={36} />
      </li>
      <li onClick={() => createLayer("Circle")}>
        <Circle size={36} />
      </li>
      <li onClick={() => createLayer("Text")}>
        <Text size={36} />
      </li>
    </ul>
  );
}
