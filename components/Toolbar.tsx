"use client";

import { useWhiteboard } from "@/store";
import {
  Circle,
  Type,
  Square,
  Hand,
  Pencil,
  MousePointer2,
} from "lucide-react";
import { ToolbarButton } from "./toolbar/ToolbarButton";
import { ToolbarSeparator } from "./toolbar/ToolbarSeparator";

export default function Toolbar() {
  const { createLayer, mode, setMode } = useWhiteboard();

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-50 flex flex-col gap-1 p-1.5 bg-white rounded-xl shadow-lg border border-gray-100/50 backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <ToolbarButton
          label="Select"
          icon={MousePointer2}
          isActive={mode.type === "selection" || mode.type === "inserting"}
          onClick={() => setMode({ type: "selection" })}
        />
        <ToolbarButton
          label="Hand Tool"
          icon={Hand}
          isActive={mode.type === "hand"}
          onClick={() => setMode({ type: "hand" })}
        />
        <ToolbarButton
          label="Pencil"
          icon={Pencil}
          isActive={mode.type === "pencil"}
          onClick={() => setMode({ type: "pencil" })}
        />
      </div>

      <ToolbarSeparator />

      <div className="flex flex-col gap-1">
        <ToolbarButton
          label="Rectangle"
          icon={Square}
          isActive={false} // Actions don't stay active in this implementation logic
          onClick={() => createLayer("Rectangle")}
        />
        <ToolbarButton
          label="Circle"
          icon={Circle}
          isActive={false}
          onClick={() => createLayer("Circle")}
        />
        <ToolbarButton
          label="Text"
          icon={Type}
          isActive={false}
          onClick={() => createLayer("Text")}
        />
      </div>
    </div>
  );
}
