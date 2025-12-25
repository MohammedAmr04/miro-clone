"use client";

import { useWhiteboard } from "@/store";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const STEP = 0.1;

function ZoomControl() {
  const { camera, setCamera } = useWhiteboard();

  const zoomIn = () => {
    setCamera({
      scale: Math.min(camera.scale + STEP, MAX_ZOOM),
    });
  };

  const zoomOut = () => {
    setCamera({
      scale: Math.max(camera.scale - STEP, MIN_ZOOM),
    });
  };

  return (
    <div
      className="absolute bottom-4 end-4 z-10 flex items-center gap-2 rounded-2xl bg-white p-2 backdrop-blur-sm shadow-md"
      role="group"
      aria-label="Zoom controls"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={zoomIn}
              disabled={camera.scale >= MAX_ZOOM}
              aria-label="Zoom in"
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom in</p>
          </TooltipContent>
        </Tooltip>

        <span
          className="text-2xl font-bold italic min-w-[70px] text-center"
          aria-live="polite"
        >
          {Math.round(camera.scale * 100)}%
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={zoomOut}
              disabled={camera.scale <= MIN_ZOOM}
              aria-label="Zoom out"
            >
              <Minus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default ZoomControl;
