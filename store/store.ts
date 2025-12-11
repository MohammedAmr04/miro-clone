import { Layer, LayerType } from "@/types/types";
import { createLayerFactory } from "@/utils/CreateLayer";
import { create } from "zustand";

interface IWhiteboard {
  layers: Layer[];
  selectedLayerId: null | string;
  setSelectedLayerId: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  createLayer: (type: LayerType) => void;
}

const useWhiteboard = create<IWhiteboard>((set) => ({
  layers: [],
  selectedLayerId: null,
  setSelectedLayerId: (id: string | null) => set({ selectedLayerId: id }),
  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, ...updates } : layer
      ),
    })),
  createLayer: (type) =>
    set((state) => {
      const newLayer = createLayerFactory(type);

      return {
        layers: [...state.layers, newLayer],
        selectedLayerId: newLayer.id,
      };
    }),
}));

export { type IWhiteboard, useWhiteboard };
