import { v4 as uuidv4 } from "uuid";
import { Layer, LayerType } from "@/types/types";

const SHAPE_DEFAULTS = {
  fill: "transparent",
  stroke: "#000000",
  strokeWidth: 2,
  width: 100,
  height: 100,
  rotation: 0,
};

// بنستلم الكاميرا عشان نعرف السنتر فين، وبنخليها اختيارية عشان لو مش موجودة
export const createLayerFactory = (
  type: LayerType,
  cameraX = 0,
  cameraY = 0
): Layer => {
  const layerId = uuidv4();

  // حل مشكلة الـ SSR: نستخدم قيم افتراضية لو window مش موجود
  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 800;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 600;

  // حساب الموقع بناءً على الكاميرا (عشان العنصر ينزل في نص شاشة المستخدم)
  const x = -cameraX + centerX - 50;
  const y = -cameraY + centerY - 50;

  const baseLayer = {
    id: layerId,
    type: type,
    x,
    y,
    ...SHAPE_DEFAULTS,
  };

  switch (type) {
    case "Rectangle":
      return { ...baseLayer, type: "Rectangle" }; // Explicit type return

    case "Circle":
      return { ...baseLayer, type: "Circle" };

    case "Text":
      return {
        ...baseLayer,
        type: "Text",
        text: "Type something...",
        fontSize: 24,
        fontFamily: "Inter",
        width: 200, // النص محتاج عرض أكبر شوية
        strokeWidth: 0,
        fill: "#000000",
      };

    // الـ Path والـ Icon مش بيتعملهم create من هنا عادة، بس لو حبيت تعمل Placeholder
    case "Path":
      throw new Error(
        "Path should be created via drawing, not factory directly."
      );

    default:
      throw new Error(`Layer type "${type}" is not supported.`);
  }
};
