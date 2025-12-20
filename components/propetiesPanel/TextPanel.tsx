import { useWhiteboard } from "@/store";
function PropetiesText() {
  const { selectedLayerId, updateLayer } = useWhiteboard();
  const selectedLayer = useWhiteboard((state) =>
    state.layers.find((layer) => layer.id === selectedLayerId)
  );
  if (!selectedLayerId) return null;
  if (!selectedLayer) return null;

  return (
    <div className="mb-6 space-y-3">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Text Content
      </label>
      <textarea
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-gray-700 bg-gray-50"
        rows={3}
        value={selectedLayer?.text || ""}
        onChange={(e) => updateLayer(selectedLayerId, { text: e.target.value })}
        placeholder="Enter text here..."
      />

      <div className="flex flex-col gap-1">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Font Size
        </label>
        <input
          type="number"
          min={8}
          max={120}
          value={selectedLayer.fontSize || 24}
          onChange={(e) =>
            updateLayer(selectedLayerId, {
              fontSize: Number(e.target.value),
            })
          }
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
        />
      </div>
    </div>
  );
}

export default PropetiesText;
