import { useWhiteboard } from "@/store";
import COLORS from "./COLORS";
type ColorsPanelProps = "fill" | "stroke";
function ColorsPanel({ type }: { type: ColorsPanelProps }) {
  const { selectedLayerId, updateLayer } = useWhiteboard();
  const selectedLayer = useWhiteboard((state) =>
    state.layers.find((layer) => layer.id === selectedLayerId)
  );
  if (!selectedLayerId) return null;
  if (!selectedLayer) return null;
  return (
    <div className="grid grid-cols-4 gap-2">
      {COLORS.map((color) => (
        <button
          key={color}
          className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            selectedLayer[type] === color
              ? "ring-2 ring-blue-600 ring-offset-2"
              : ""
          }`}
          style={{
            backgroundColor: color === "transparent" ? "white" : color,
          }}
          onClick={() => updateLayer(selectedLayerId, { [type]: color })}
          title={color}
        >
          {color === "transparent" && (
            <span className="text-red-500 text-xs font-bold">/</span>
          )}
        </button>
      ))}
    </div>
  );
}

export default ColorsPanel;
