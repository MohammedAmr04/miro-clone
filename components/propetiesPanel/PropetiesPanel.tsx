import { useWhiteboard } from "@/store";
import PropetiesText from "./TextPanel";
import FillColorPanel from "./FillColorPanel";
import ColorsPanel from "./ColorsPanel";

function PropertiesPanel() {
  const { selectedLayerId, updateLayer } = useWhiteboard();
  const selectedLayer = useWhiteboard((state) =>
    state.layers.find((layer) => layer.id === selectedLayerId)
  );

  if (!selectedLayerId) return null;
  if (!selectedLayer) return null;

  return (
    <div className="fixed top-6 end-6 z-20 bg-white shadow-xl rounded-xl p-5 w-64 border border-gray-200 transition-all text-sm animate-in slide-in-from-right-10 fade-in duration-300">
      <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-100">
        <h2 className="font-semibold text-gray-800 text-lg">Properties</h2>
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium bg-gray-100 px-2 py-0.5 rounded">
          {selectedLayer.type}
        </span>
      </div>

      {/* Text Specific Controls */}
      {selectedLayer.type === "Text" && <PropetiesText />}

      {/* Fill Color */}
      <FillColorPanel>
        <ColorsPanel type="fill" />
      </FillColorPanel>
      {/* Stroke / Border */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Border Color
          </label>
        </div>

        <ColorsPanel type="stroke" />

        <div className="flex flex-col gap-1 mt-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Border Width
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={selectedLayer.strokeWidth || 0}
              onChange={(e) =>
                updateLayer(selectedLayerId, {
                  strokeWidth: Number(e.target.value),
                })
              }
              className="w-full accent-blue-600"
            />
            <span className="text-xs font-mono w-6 text-right">
              {selectedLayer.strokeWidth || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertiesPanel;
