"use client";
import { useWhiteboard } from "@/store";
import { SHAPE_COMPONENTS } from "@/types/types";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Stage, Transformer, Line } from "react-konva";

export default function Whiteboard() {
  const {
    layers,
    setSelectedLayerId,
    selectedLayerId,
    updateLayer,
    camera,
    setCamera,
    mode,
  } = useWhiteboard();

  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [lines, setLines] = useState<Array<{ tool: string; points: number[] }>>([]);
  const isDrawing = useRef(false);

  // Ensure component is mounted (important for Next.js SSR)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (isMounted && transformerRef.current) {
      if (!selectedLayerId) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
        return;
      }
      const selectedNode = transformerRef.current
        .getStage()
        ?.findOne("#" + selectedLayerId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedLayerId, isMounted]);

  const handleCheckDeselect = (e: Konva.KonvaEventObject<Event>) => {
    const { target } = e;
    const clickedOnEmpty = target === target.getStage();
    if (clickedOnEmpty) {
      setSelectedLayerId(null);
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

    // Determine zoom direction
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    // When we zoom on trackpad, e.evt.ctrlKey is true
    // In that case, revert direction
    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    const scaleBy = 1.1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom range
    if (newScale < 0.2 || newScale > 4) return;

    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    setCamera({
      x: newPos.x,
      y: newPos.y,
      scale: newScale,
    });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Only draw in pencil mode
    if (mode.type !== 'pencil') return;

    // Only start drawing if clicking on empty canvas
    const clickedOnEmpty = e.target === e.target.getStage();
    if (!clickedOnEmpty) return;

    // Prevent stage dragging when drawing
    e.target.getStage()?.draggable(false);

    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    // Account for camera position and scale
    const x = (pos.x - camera.x) / camera.scale;
    const y = (pos.y - camera.y) / camera.scale;

    setLines([...lines, { tool: 'pen', points: [x, y] }]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    // Account for camera position and scale
    const x = (pos.x - camera.x) / camera.scale;
    const y = (pos.y - camera.y) / camera.scale;

    // Immutable state update
    setLines((prevLines) => {
      const newLines = [...prevLines];
      const lastLine = { ...newLines[newLines.length - 1] };
      lastLine.points = [...lastLine.points, x, y];
      newLines[newLines.length - 1] = lastLine;
      return newLines;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    // Re-enable stage dragging based on mode
    if (stageRef.current) {
      stageRef.current.draggable(mode.type === 'hand');
    }
  };

  // Update stage draggable when mode changes
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.draggable(mode.type === 'hand');
    }
  }, [mode]);

  if (!isMounted) {
    return null; // Prevent SSR issues
  }

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      ref={stageRef}
      draggable={mode.type === 'hand'}
      x={camera.x}
      y={camera.y}
      scaleX={camera.scale}
      scaleY={camera.scale}
      onMouseDown={(e) => {
        handleCheckDeselect(e);
        handleMouseDown(e);
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={(e) => {
        handleCheckDeselect(e);
        handleMouseDown(e);
      }}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onWheel={handleWheel}
      onDragEnd={(e) => {
        if (e.target === e.target.getStage()) {
          setCamera({
            x: e.target.x(),
            y: e.target.y(),
          });
        }
      }}
    >
      <Layer>
        {/* Drawing lines */}
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke="#df4b26"
            strokeWidth={5 / camera.scale} // Adjust stroke width for zoom level
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        ))}

        {/* Shape layers from store */}
        {layers.map((layer) => {
          const Component = SHAPE_COMPONENTS[layer.type];
          if (!Component) return null;
          return (
            <Component
              key={layer.id}
              {...layer}
              id={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              onTap={() => setSelectedLayerId(layer.id)}
              onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
                updateLayer(layer.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
                // Transformer changes scale of the node
                // but in the store we have width and height
                // Reset scale and update dimensions
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                
                // Reset scale back to 1
                node.scaleX(1);
                node.scaleY(1);
                
                updateLayer(layer.id, {
                  ...layer,
                  x: node?.x(),
                  y: node?.y(),
                  // Set minimal value
                  width: Math.max(5, node?.width() * scaleX),
                  height: Math.max(5, node?.height() * scaleY),
                });
              }}
            />
          );
        })}

        {/* Transformer for shape selection */}
        <Transformer
          flipEnabled={false}
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize - minimum 5px
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}