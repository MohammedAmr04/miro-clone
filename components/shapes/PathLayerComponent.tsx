// src/components/PathLayerComponent.tsx
import React from "react";
import { Path } from "react-konva";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "@/utils/getSvgPathFromStroke";
import { PathLayer } from "@/types/types";
import { useWhiteboard } from "@/store";

interface Props {
  layer: PathLayer;
  onSelect: () => void;
}

export const PathLayerComponent = ({ layer, onSelect }: Props) => {
  const { updateLayer } = useWhiteboard();

  // حساب شكل الخط بناءً على النقاط والضغط
  const stroke = getStroke(layer.points, {
    size: 10, // سمك الخط
    thinning: 0.5, // تأثير الضغط
    smoothing: 0.5, // نعومة الخط
    streamline: 0.5,
  });

  const pathData = getSvgPathFromStroke(stroke);

  return (
    <Path
      x={layer.x}
      y={layer.y}
      fill={layer.fill || "#000"} // في perfect-freehand الخط عبارة عن شكل مملوء (Fill) مش Stroke
      data={pathData}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onSelect();
        updateLayer(layer.id, { x: e.target.x(), y: e.target.y() });
      }}
    />
  );
};
