"use client";

import { useWhiteboard } from "@/store/store";
import { Undo2, Redo2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UndoRedoControl() {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    // Subscribe to temporal state changes to update UI
    const unsub = useWhiteboard.temporal.subscribe((state) => {
      setCanUndo(state.pastStates.length > 0);
      setCanRedo(state.futureStates.length > 0);
    });
    return unsub;
  }, []);

  const handleUndo = () => {
    useWhiteboard.temporal.getState().undo();
  };

  const handleRedo = () => {
    useWhiteboard.temporal.getState().redo();
  };

  return (
    <div className="absolute bottom-4 start-4 flex gap-2 bg-white p-1.5 rounded-lg shadow-sm border border-gray-200 z-10">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-2 hover:bg-gray-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            onClick={handleUndo}
            disabled={!canUndo}
          >
            <Undo2 className="w-5 h-5 text-gray-700" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="p-2 hover:bg-gray-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            onClick={handleRedo}
            disabled={!canRedo}
          >
            <Redo2 className="w-5 h-5 text-gray-700" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
