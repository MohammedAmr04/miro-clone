import { ShapeConfig } from "konva/lib/Shape";
import { Rect, Circle, Text } from "react-konva";

type LayerType = "Rectangle" | "Circle" | "Text";

const SHAPE_COMPONENTS = {
  Rectangle: Rect,
  Circle: Circle,
  Text: Text,
};
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
export { SHAPE_COMPONENTS };
