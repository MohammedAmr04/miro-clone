"use client";
import { useWhiteboard } from "@/store";
import { SHAPE_COMPONENTS } from "@/types/types";
import { Layer, Stage } from "react-konva";

export default function Whiteboard() {
  const { layers, setSelectedLayerId } = useWhiteboard();

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        {layers.map((layer) => {
          const Component = SHAPE_COMPONENTS[layer.type];
          if (!Component) return null;
          return (
            <Component
              key={layer.id}
              {...layer}
              onClick={() => setSelectedLayerId(layer.id)}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}
