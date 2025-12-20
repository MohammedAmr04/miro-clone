import { useWhiteboard } from "@/store";

function FillColorPanel({ children }: { children: React.ReactNode }) {
  const { selectedLayerId } = useWhiteboard();
  const selectedLayer = useWhiteboard((state) =>
    state.layers.find((layer) => layer.id === selectedLayerId)
  );
  if (!selectedLayerId) return null;
  if (!selectedLayer) return null;

  return (
    <div className="mb-6">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {selectedLayer.type === "Text" ? "Text Color" : "Fill Color"}
      </label>
      {children}
    </div>
  );
}

export default FillColorPanel;
