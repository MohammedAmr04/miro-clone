"use client";

import { LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: LucideIcon;
  label: string;
}

export const ToolbarButton = ({
  onClick,
  isActive,
  icon: Icon,
  label,
}: ToolbarButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`p-3 rounded-lg transition-all duration-200 group relative
            ${
              isActive
                ? "bg-blue-50 text-blue-600 shadow-inner"
                : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            }
          `}
        >
          <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        <p className="font-medium text-xs">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
