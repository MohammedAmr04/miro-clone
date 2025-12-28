"use client";

import { useWhiteboard } from "@/store";
import { Circle, Text, Square, Hand, Pencil } from "lucide-react";

export default function Toolbar() {
  const { createLayer, mode, setMode } = useWhiteboard();
  
  return (
    <ul className="absolute top-1/2 p-4 z-50 -translate-y-1/2 start-3 rounded-xl border-2 bg-white flex flex-col items-center justify-center gap-2">
      {/* Mode Selection */}
      <li 
        onClick={() => setMode({ type: mode.type === 'hand' ? 'selection' : 'hand' })}
        className={`cursor-pointer p-2 rounded-lg transition-colors ${
          mode.type === 'hand' || mode.type === 'selection' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title={mode.type === 'hand' ? 'Selection Mode' : 'Pan Mode'}
      >
        <Hand size={36} />
      </li>

      <li 
        onClick={() => setMode({ type: 'pencil' })}
        className={`cursor-pointer p-2 rounded-lg transition-colors ${
          mode.type === 'pencil' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
        }`}
        title="Draw Mode"
      >
        <Pencil size={36} />
      </li>

      {/* Separator */}
      <div className="w-full h-px bg-gray-300 my-2"></div>

      {/* Shape Creation - Only visible in selection mode */}
      {mode.type === 'selection' && (
        <>
          <li 
            onClick={() => createLayer("Rectangle")}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Add Rectangle"
          >
            <Square size={36} />
          </li>
          
          <li 
            onClick={() => createLayer("Circle")}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Add Circle"
          >
            <Circle size={36} />
          </li>
          
          <li 
            onClick={() => createLayer("Text")}
            className="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Add Text"
          >
            <Text size={36} />
          </li>
        </>
      )}
    </ul>
  );
}