import { v4 as uuidv4 } from "uuid";
import { Layer, LayerType } from "@/types/types";

const SHAPE_DEFAULTS = {
  fill: "transparent",
  stroke: "#000000",
  strokeWidth: 2,
  width: 100,
  height: 100,
  draggable: true,
};

export const createLayerFactory = (type: LayerType): Layer => {
  const baseLayer = {
    id: uuidv4(),
    type: type,
    x: window.innerWidth / 2 - 50,
    y: window.innerHeight / 2 - 50,
    ...SHAPE_DEFAULTS,
  };

  switch (type) {
    case "Rectangle":
      console.log("Rectangle");
      return {
        ...baseLayer,
      };

    case "Circle":
      return {
        ...baseLayer,
      };

    case "Text":
      return {
        ...baseLayer,
        width: 200,
        height: 50,
        text: "Type something...",
        fontSize: 24,
        fontFamily: "sans-serif",
        fill: "#000000",
        stroke: undefined,
        strokeWidth: 0,
      } as Layer;

    default:
      throw new Error(`Layer type "${type}" is not supported in the factory.`);
  }
};
