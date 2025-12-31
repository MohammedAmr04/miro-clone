import { Layer, LayerType } from "@/types/types";
import { createLayerFactory } from "@/utils/CreateLayer";
import { create } from "zustand";

type CameraState = {
  x: number;
  y: number;
  scale: number;
};
type CanvasMode =
  | { type: "selection" }
  | { type: "pencil" }
  | { type: "hand" } // Panning mode
  | { type: "inserting"; layerType: LayerType };

type IWhiteboard = {
  layers: Layer[];
  mode: CanvasMode;
  camera: CameraState;
  selectedLayerId: null | string;

  setMode: (mode: CanvasMode) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setSelectedLayerId: (id: string | null) => void;

  updateLayer: (id: string, updates: Partial<Layer>) => void;
  insertLayer: (layer: Layer) => void;
  createLayer: (type: LayerType) => void;
  removeLayer: (id: string) => void;
};

const useWhiteboard = create<IWhiteboard>((set) => ({
  layers: [],
  selectedLayerId: null,
  mode: { type: "selection" },
  camera: {
    x: 0,
    y: 0,
    scale: 1,
  },
  setCamera: (camera: Partial<CameraState>) =>
    set((state) => ({ camera: { ...state.camera, ...camera } })),
  setMode: (mode: CanvasMode) => set({ mode }),
  setSelectedLayerId: (id: string | null) => set({ selectedLayerId: id }),
  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map(
        (layer) => (layer.id === id ? { ...layer, ...updates } : layer) as Layer
      ),
    })),
  createLayer: (type) =>
    set((state) => {
      const newLayer = createLayerFactory(type);

      return {
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
        mode: { type: "selection" },
      };
    }),
  insertLayer: (layer) =>
    set((state) => ({
      layers: [...state.layers, layer],
      selectedLayerId: layer.id,
    })),
  removeLayer: (id: string) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      selectedLayerId: null,
    })),
}));

export { type IWhiteboard, useWhiteboard, type CanvasMode, type CameraState };
