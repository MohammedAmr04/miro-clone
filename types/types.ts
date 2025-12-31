import Konva from "konva";
import {
  Rect,
  Circle,
  Text,
  Line,
  Path,
  KonvaNodeComponent,
} from "react-konva";

export type LayerType = "Rectangle" | "Circle" | "Text" | "Path" | "Icon";

export interface LayerBase {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
}

export interface RectangleLayer extends LayerBase {
  type: "Rectangle";
  cornerRadius?: number;
}

export interface CircleLayer extends LayerBase {
  type: "Circle";
}

export interface PathLayer extends LayerBase {
  type: "Path";
  points: number[][];
}

export interface TextLayer extends LayerBase {
  type: "Text";
  text: string;
  fontSize: number;
  fontFamily: string;
  align?: "left" | "center" | "right";
}

export type Layer = RectangleLayer | CircleLayer | PathLayer | TextLayer;

// 5. Mapping Components
export const SHAPE_COMPONENTS: Record<string, any> = {
  Rectangle: Rect,
  Circle: Circle,
  Text: Text,
  Path: Path,
};
