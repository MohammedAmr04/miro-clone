"use client";
import { useWhiteboard } from "@/store";
import { SHAPE_COMPONENTS } from "@/types/types";
import Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Stage, Transformer } from "react-konva";

export default function Whiteboard() {
  const { layers, setSelectedLayerId, selectedLayerId, updateLayer } =
    useWhiteboard();
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
              id={layer.id}
              onClick={() => setSelectedLayerId(layer.id)}
              onTap={() => setSelectedLayerId(layer.id)}
              onDragEnd={(e) => {
                updateLayer(layer.id, {
                  x: e.target.x(),
                  y: e.target.y(),
                });
              }}
              onTransformEnd={(e) => {
                // transformer is changing scale of the node
                // and NOT its width or height
                // but in the store we have only width and height
                // to match the data better we will reset scale on transform end
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                // we will reset it back
                node.scaleX(1);
                node.scaleY(1);
                updateLayer(layer.id, {
                  ...layer,
                  x: node?.x(),
                  y: node?.y(),
                  // set minimal value
                  width: Math.max(5, node?.width() * scaleX),
                  height: Math.max(5, node?.height() * scaleY),
                });
              }}
            />
          );
        })}
        <Transformer
          flipEnabled={false}
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
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
