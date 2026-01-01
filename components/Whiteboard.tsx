"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer as KonvaLayer, Transformer, Path } from "react-konva";
import Konva from "konva";
import { SHAPE_COMPONENTS } from "@/types/types";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "@/utils/getSvgPathFromStroke";
import { v4 as uuidv4 } from "uuid";
import { useWhiteboard } from "@/store";
import { PathLayerComponent } from "./shapes/PathLayerComponent";

export default function Whiteboard() {
  const {
    layers,
    mode,
    camera,
    setCamera,
    insertLayer,
    updateLayer,
    selectedLayerId,
    setSelectedLayerId,
    setMode,
  } = useWhiteboard();

  const [isMounted, setIsMounted] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // --- منطق الرسم الحر (Pencil) ---
  const isDrawing = useRef(false);
  // بنخزن النقاط هنا مؤقتاً عشان الأداء (بدون Re-render)
  const currentPoints = useRef<number[][]>([]);
  // بنستخدم State بسيطة بس عشان نجبر الـ Component يعمل render للخط وهو بيترسم
  const [currentPathData, setCurrentPathData] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // تحديث الـ Transformer
  useEffect(() => {
    if (isMounted && transformerRef.current && stageRef.current) {
      if (!selectedLayerId) {
        transformerRef.current.nodes([]);
      } else {
        const node = stageRef.current.findOne("#" + selectedLayerId);
        if (node) {
          transformerRef.current.nodes([node]);
        }
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedLayerId, isMounted, layers]); // added layers dependency

  // --- Handlers ---

  const handlePointerDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // 1. Deselect لو ضغطنا في الفراغ
    if (e.target === stage) {
      setSelectedLayerId(null);
    }

    // 2. لو الوضع قلم، ابدأ رسم
    if (mode.type === "pencil") {
      isDrawing.current = true;
      // منع تحريك الشاشة واحنا بنرسم
      stage.draggable(false);

      const pos = stage.getRelativePointerPosition();
      if (pos) {
        // [x, y, pressure]
        const point = [pos.x, pos.y, e.evt.pressure || 0.5];
        currentPoints.current = [point];
      }
    }
  };

  const handlePointerMove = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (mode.type !== "pencil" || !isDrawing.current) return;

    const stage = e.target.getStage();
    const pos = stage?.getRelativePointerPosition();

    if (pos) {
      const point = [pos.x, pos.y, e.evt.pressure || 0.5];
      // إضافة النقطة للـ Ref
      currentPoints.current.push(point);

      // حساب الشكل مؤقتاً للعرض فقط
      const stroke = getStroke(currentPoints.current, {
        size: 10,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      });
      setCurrentPathData(getSvgPathFromStroke(stroke));
    }
  };

  const handlePointerUp = () => {
    if (mode.type === "pencil" && isDrawing.current) {
      isDrawing.current = false;

      // حفظ الطبقة النهائية في الـ Store
      if (currentPoints.current.length > 0) {
        insertLayer({
          id: uuidv4(),
          type: "Path",
          x: 0, // النقاط في الـ Path بتكون relative للصفر
          y: 0,
          points: currentPoints.current,
          width: 0, // مش مهم للـ Path
          height: 0, // مش مهم للـ Path
          fill: "#000",
        });
      }

      // تنظيف المؤقت
      currentPoints.current = [];
      setCurrentPathData("");

      if (stageRef.current) stageRef.current.draggable(false);
    }
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition() || { x: 0, y: 0 };
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let direction = e.evt.deltaY > 0 ? 1 : -1;
    if (e.evt.ctrlKey) direction = -direction;

    const scaleBy = 1.1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom
    if (newScale < 0.1 || newScale > 10) return;

    setCamera({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  if (!isMounted) return null;

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      draggable={mode.type === "hand"}
      x={camera.x}
      y={camera.y}
      scaleX={camera.scale}
      scaleY={camera.scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      <KonvaLayer>
        {/* 1. رسم الطبقات المحفوظة */}
        {layers.map((layer) => {
          if (layer.type === "Path") {
            // استخدام المكون الجديد للرسم الحر
            return (
              <PathLayerComponent
                key={layer.id}
                layer={layer}
                onSelect={() => setSelectedLayerId(layer.id)}
              />
            );
          }

          // للأشكال الأخرى (Rectangle, Circle, etc.)
          const Component = SHAPE_COMPONENTS[layer.type];
          if (!Component) return null;

          return (
            <Component
              key={layer.id}
              // id={layer.id}
              {...layer}
              draggable={mode.type === "selection"}
              onClick={() => setSelectedLayerId(layer.id)}
              onTap={() => setSelectedLayerId(layer.id)}
              onDragEnd={(e: any) => {
                updateLayer(layer.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              onTransformEnd={(e: any) => {
                // Logic تغيير الحجم (مهم جداً)
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1); // Reset scale
                node.scaleY(1);
                updateLayer(layer.id, {
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, node.width() * scaleX),
                  height: Math.max(5, node.height() * scaleY),
                });
              }}
            />
          );
        })}

        {/* 2. رسم الخط المؤقت أثناء حركة الماوس */}
        {currentPathData && (
          <Path
            data={currentPathData}
            fill="#000" // اللون المؤقت
            x={0}
            y={0}
            opacity={0.6} // خفيفة شوية عشان تبان إنها لسه بتترسم
            listening={false} // عشان متعملش تداخل مع الماوس
          />
        )}

        {/* 3. الـ Transformer */}
        <Transformer ref={transformerRef} />
      </KonvaLayer>
    </Stage>
  );
}
