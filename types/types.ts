import { ShapeConfig } from "konva/lib/Shape";

type LayerType = "Rectangle" | "Circle" | "Text";

interface Layer extends ShapeConfig {
  id: string;
  type: LayerType;
  fill: string;
  // border
  stroke?: string;
  strokeWidth?: number;
  // text
  text?: string;
  fontSize?: number;
}

export type { Layer, LayerType };
