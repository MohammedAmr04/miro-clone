"use client";
import PropertiesPanel from "@/components/propetiesPanel";
import Toolbar from "@/components/Toolbar";
import dynamic from "next/dynamic";
const Whiteboard = dynamic(() => import("@/components/Whiteboard"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
export default function HomePage() {
  return (
    <main className="relative w-full h-screen bg-[#f0f2f5]  overflow-hidden selection:bg-none">
      <Toolbar />
      <PropertiesPanel />
      <div className="absolute inset-0 z-1">
        <Whiteboard />
      </div>

      <div
        className="absolute inset-0 opacity-20  pointer-events-none "
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
    </main>
  );
}
