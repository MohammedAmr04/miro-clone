# Whiteboard Drawing Feature - Complete Documentation

## Overview
This documentation covers the implementation of a freehand drawing feature for a React-Konva whiteboard application. The feature allows users to draw smooth, continuous lines while maintaining the ability to select, transform, and pan the canvas.

---

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Architecture](#architecture)
3. [Key Problems Solved](#key-problems-solved)
4. [Component Breakdown](#component-breakdown)
5. [State Management](#state-management)
6. [Implementation Details](#implementation-details)
7. [User Flow](#user-flow)

---

## Core Concepts

### React-Konva Basics
- **Stage**: The main container that holds all canvas content
- **Layer**: A container for shapes and objects (like Photoshop layers)
- **Line**: A shape component that renders paths based on points
- **Transformer**: A special component that adds handles for resizing/rotating shapes

### Drawing Mechanics
Drawing on a canvas involves three phases:
1. **Mouse Down**: Start a new line, record the starting point
2. **Mouse Move**: While drawing, continuously add points to the line
3. **Mouse Up**: Stop drawing, finalize the line

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              User Interface                  │
│                                              │
│  ┌──────────┐         ┌─────────────────┐  │
│  │ Toolbar  │────────▶│   Whiteboard    │  │
│  │          │         │                 │  │
│  │ - Modes  │         │ - Canvas        │  │
│  │ - Tools  │         │ - Shapes        │  │
│  │ - Shapes │         │ - Drawing Lines │  │
│  └──────────┘         └─────────────────┘  │
│       │                       │             │
│       └───────────┬───────────┘             │
│                   ▼                         │
│           ┌───────────────┐                 │
│           │  Zustand Store │                │
│           │                │                │
│           │ - Mode State   │                │
│           │ - Layers       │                │
│           │ - Camera       │                │
│           └───────────────┘                 │
└─────────────────────────────────────────────┘
```

---

## Key Problems Solved

### Problem 1: Duplicate Stage Components
**Issue**: The original code had two `<Stage>` components rendering simultaneously.

```typescript
// ❌ WRONG - Two stages conflict
<Stage>...</Stage>  // For shapes
<Stage>...</Stage>  // For drawing
```

**Solution**: Merge into a single Stage with one Layer containing both shapes and lines.

```typescript
// ✅ CORRECT - Single unified stage
<Stage>
  <Layer>
    {/* Drawing lines */}
    {/* Shape layers */}
    {/* Transformer */}
  </Layer>
</Stage>
```

---

### Problem 2: Drawing Creates Dots Instead of Lines
**Issue**: The Stage's `draggable` property conflicts with drawing.

**Why it happened**:
- When `Stage` is `draggable={true}`, mouse movements trigger drag events
- Drawing requires tracking mouse movements to add points to the line
- The drag event interrupts the drawing, creating disconnected dots

**Solution**: Conditionally control the `draggable` property based on mode.

```typescript
// Make stage draggable only in 'hand' (pan) mode
<Stage draggable={mode.type === 'hand'} />

// Disable dragging when starting to draw
const handleMouseDown = (e) => {
  if (mode.type === 'pencil') {
    e.target.getStage()?.draggable(false); // Prevent panning
    isDrawing.current = true;
  }
};

// Re-enable after drawing
const handleMouseUp = () => {
  isDrawing.current = false;
  if (stageRef.current) {
    stageRef.current.draggable(mode.type === 'hand');
  }
};
```

---

### Problem 3: Drawing Doesn't Account for Camera Transform
**Issue**: When zoomed or panned, drawing coordinates are wrong.

**Why it happened**:
- `getPointerPosition()` returns screen coordinates
- Canvas has camera transforms (pan/zoom)
- Need to convert screen coordinates to world coordinates

**Solution**: Transform coordinates using camera position and scale.

```typescript
const pos = stage?.getPointerPosition();

// Convert screen coordinates to world coordinates
const worldX = (pos.x - camera.x) / camera.scale;
const worldY = (pos.y - camera.y) / camera.scale;
```

**Visual Explanation**:
```
Screen Space:          World Space (Canvas):
┌─────────────┐       ┌─────────────────────┐
│   [Click]   │       │                     │
│    (100,50) │  →    │  Actual position    │
│             │       │  depends on:        │
│  Viewport   │       │  - Camera X/Y       │
└─────────────┘       │  - Zoom level       │
                      └─────────────────────┘
```

---

### Problem 4: State Mutation
**Issue**: Directly mutating state objects.

```typescript
// ❌ WRONG - Mutating objects
lastLine.points = lastLine.points.concat([x, y]);
lines.splice(lines.length - 1, 1, lastLine);
setLines(lines.concat());
```

**Solution**: Create new objects and arrays.

```typescript
// ✅ CORRECT - Immutable updates
setLines((prevLines) => {
  const newLines = [...prevLines];              // Copy array
  const lastLine = { ...newLines[newLines.length - 1] }; // Copy object
  lastLine.points = [...lastLine.points, x, y]; // Copy points array
  newLines[newLines.length - 1] = lastLine;     // Replace
  return newLines;
});
```

---

## Component Breakdown

### 1. Whiteboard Component

**Responsibilities**:
- Render the canvas (Stage/Layer)
- Handle mouse/touch events
- Manage drawing state (lines array)
- Handle zoom/pan
- Render shapes and transformer

**Key State**:
```typescript
const [lines, setLines] = useState<Array<{ tool: string; points: number[] }>>([]);
const isDrawing = useRef(false);
const [isMounted, setIsMounted] = useState(false);
```

**Event Handlers**:

#### handleMouseDown
```typescript
const handleMouseDown = (e) => {
  // Only draw in pencil mode
  if (mode.type !== 'pencil') return;
  
  // Only draw on empty canvas
  const clickedOnEmpty = e.target === e.target.getStage();
  if (!clickedOnEmpty) return;
  
  // Prevent stage dragging
  e.target.getStage()?.draggable(false);
  
  // Start drawing
  isDrawing.current = true;
  
  // Get world coordinates
  const stage = e.target.getStage();
  const pos = stage?.getPointerPosition();
  const x = (pos.x - camera.x) / camera.scale;
  const y = (pos.y - camera.y) / camera.scale;
  
  // Create new line
  setLines([...lines, { tool: 'pen', points: [x, y] }]);
};
```

#### handleMouseMove
```typescript
const handleMouseMove = (e) => {
  if (!isDrawing.current) return;
  
  // Get world coordinates
  const stage = e.target.getStage();
  const pos = stage?.getPointerPosition();
  const x = (pos.x - camera.x) / camera.scale;
  const y = (pos.y - camera.y) / camera.scale;
  
  // Add point to current line (immutably)
  setLines((prevLines) => {
    const newLines = [...prevLines];
    const lastLine = { ...newLines[newLines.length - 1] };
    lastLine.points = [...lastLine.points, x, y];
    newLines[newLines.length - 1] = lastLine;
    return newLines;
  });
};
```

#### handleMouseUp
```typescript
const handleMouseUp = () => {
  isDrawing.current = false;
  
  // Re-enable stage dragging based on mode
  if (stageRef.current) {
    stageRef.current.draggable(mode.type === 'hand');
  }
};
```

---

### 2. Toolbar Component

**Responsibilities**:
- Provide mode switching UI
- Provide shape creation buttons
- Show/hide tools based on mode

**Key Features**:

#### Mode Toggle
```typescript
<li 
  onClick={() => setMode({ 
    type: mode.type === 'hand' ? 'selection' : 'hand' 
  })}
  className={`cursor-pointer p-2 rounded-lg transition-colors ${
    mode.type === 'hand' || mode.type === 'selection' 
      ? 'bg-blue-100 text-blue-600' 
      : 'hover:bg-gray-100'
  }`}
>
  <Hand size={36} />
</li>
```

#### Conditional Rendering
```typescript
{mode.type === 'selection' && (
  <>
    <li onClick={() => createLayer("Rectangle")}>
      <Square size={36} />
    </li>
    {/* More shape buttons */}
  </>
)}
```

---

## State Management

### Zustand Store Structure

```typescript
type CanvasMode =
  | { type: "selection" }  // Select and transform shapes
  | { type: "pencil" }     // Draw freehand
  | { type: "hand" }       // Pan the canvas
  | { type: "inserting"; layerType: LayerType }; // Insert new shape

interface IWhiteboard {
  layers: Layer[];              // All shapes on canvas
  mode: CanvasMode;             // Current interaction mode
  camera: CameraState;          // Pan/zoom state
  selectedLayerId: string | null; // Currently selected shape
  
  // Actions
  setMode: (mode: CanvasMode) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setSelectedLayerId: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  createLayer: (type: LayerType) => void;
  removeLayer: (id: string) => void;
}
```

### Why This Structure?

1. **Discriminated Union for Mode**: Using `{ type: "pencil" }` instead of just `"pencil"` allows for modes with additional data (like `inserting` mode with `layerType`)

2. **Immutable Updates**: All actions return new state objects

3. **Centralized State**: Single source of truth for all canvas state

---

## Implementation Details

### Camera Transform Math

**The Problem**: Converting between screen space and world space.

```
Screen Coordinates (what you click):
- Origin at top-left of viewport
- Affected by scroll/window position
- Example: (100, 50)

World Coordinates (where to draw):
- Origin at canvas (0, 0)
- Affected by pan (camera.x, camera.y)
- Affected by zoom (camera.scale)
```

**The Formula**:
```typescript
worldX = (screenX - cameraX) / scale
worldY = (screenY - cameraY) / scale
```

**Example**:
```
Camera: { x: 200, y: 100, scale: 2 }
Screen Click: (500, 300)

worldX = (500 - 200) / 2 = 150
worldY = (300 - 100) / 2 = 100

Result: Draw at world position (150, 100)
```

---

### Stroke Width Scaling

**The Problem**: When zoomed in, lines appear too thick. When zoomed out, too thin.

**Solution**: Inverse scale the stroke width.

```typescript
<Line
  strokeWidth={5 / camera.scale}  // Compensate for zoom
/>
```

**Why it works**:
- Zoom 2x (scale = 2): strokeWidth = 5/2 = 2.5 (thinner)
- Zoom 0.5x (scale = 0.5): strokeWidth = 5/0.5 = 10 (thicker)
- This keeps visual thickness constant

---

### Drawing Performance

**Line Component**:
```typescript
<Line
  points={[x1, y1, x2, y2, x3, y3, ...]}  // Flat array
  stroke="#df4b26"
  strokeWidth={5 / camera.scale}
  tension={0.5}         // Smooth curves
  lineCap="round"       // Rounded ends
  lineJoin="round"      // Rounded corners
/>
```

**Points Array Structure**:
```typescript
// ✅ CORRECT: Flat array [x, y, x, y, ...]
points: [100, 50, 102, 52, 104, 54]

// ❌ WRONG: Array of objects
points: [{x: 100, y: 50}, {x: 102, y: 52}]
```

---

## User Flow

### Drawing Flow
```
1. User clicks Pencil icon
   ↓
2. Mode changes to { type: 'pencil' }
   ↓
3. Stage becomes non-draggable
   ↓
4. User clicks/drags on canvas
   ↓
5. handleMouseDown creates new line with first point
   ↓
6. handleMouseMove adds points as user drags
   ↓
7. handleMouseUp finalizes the line
   ↓
8. Line stays on canvas, user can draw more
```

### Mode Switching Flow
```
Selection Mode:
- Stage: non-draggable
- Clicks: select shapes
- Toolbar: shows shape buttons
- Transformer: active on selection

Hand Mode (Pan):
- Stage: draggable
- Clicks: pan the canvas
- Toolbar: no shape buttons
- Transformer: inactive

Pencil Mode:
- Stage: non-draggable (during draw)
- Clicks: draw lines
- Toolbar: no shape buttons
- Transformer: inactive
```

---

## Best Practices Applied

### 1. Event Handler Naming
```typescript
// ✅ CORRECT: React-Konva uses camelCase
onMouseMove={handleMouseMove}
onMouseUp={handleMouseUp}

// ❌ WRONG: lowercase
onMousemove={handleMouseMove}
onmouseup={handleMouseUp}
```

### 2. Refs for Non-Reactive Values
```typescript
// Use ref for values that shouldn't trigger re-renders
const isDrawing = useRef(false);

// Don't use state for this:
// const [isDrawing, setIsDrawing] = useState(false); // ❌ Causes re-renders
```

### 3. SSR Protection
```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) return null;
```

This prevents hydration errors in Next.js by ensuring the component only renders on the client.

### 4. Immutable State Updates
Always create new objects/arrays instead of mutating:
```typescript
// ✅ CORRECT
setLines(prevLines => [...prevLines, newLine]);

// ❌ WRONG
lines.push(newLine);
setLines(lines);
```

---

## Common Issues & Solutions

### Issue: Lines appear in wrong position after zooming
**Solution**: Always transform coordinates using camera state in both mouseDown and mouseMove.

### Issue: Can't select shapes after drawing
**Solution**: Ensure deselection logic checks if clicked on empty canvas, not on a line.

### Issue: Drawing is choppy
**Solution**: Use `useRef` for `isDrawing` instead of state to avoid re-renders during mousemove.

### Issue: Lines disappear after mode change
**Solution**: Store lines in component state, not as temporary values. They persist across renders.

---

## Future Enhancements

1. **Eraser Tool**: Add `globalCompositeOperation="destination-out"` to Line component
2. **Color Picker**: Add color state and pass to Line stroke prop
3. **Undo/Redo**: Implement history stack for lines array
4. **Line Smoothing**: Use Catmull-Rom or Bezier curve algorithms
5. **Save/Load**: Serialize lines array to JSON for persistence
6. **Layer Management**: Move lines to separate Konva Layer for better performance

---

## Summary

The key to successful drawing implementation:

1. **Single Stage**: One unified Stage component for all canvas elements
2. **Mode Management**: Conditional behavior based on current mode
3. **Coordinate Transform**: Always account for camera position and scale
4. **Immutable Updates**: Never mutate state directly
5. **Proper Event Handling**: Disable dragging during draw operations

This architecture provides a solid foundation for a feature-rich whiteboard application with smooth drawing capabilities.