"use client";
import { useWhiteboard } from "@/store";
import { SHAPE_COMPONENTS } from "@/types/types";
import Konva from "konva";
import { Layer, Stage } from "react-konva";

export default function Whiteboard() {
  const { layers, setSelectedLayerId } = useWhiteboard();

  const handleCheckDeselect = (e: Konva.KonvaEventObject<Event>) => {
    const { target } = e;
    const clickedOnEmpty = target === target.getStage();
    if (clickedOnEmpty) {
      setSelectedLayerId(null);
    }
  };
  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleCheckDeselect}
      onTouchStart={handleCheckDeselect}
    >
      <Layer>
        {layers.map((layer) => {
          const Component = SHAPE_COMPONENTS[layer.type];
          if (!Component) return null;
          return (
            <Component
              key={layer.id}
              {...layer}
              onClick={() => setSelectedLayerId(layer.id)}
              onTap={() => setSelectedLayerId(layer.id)}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
