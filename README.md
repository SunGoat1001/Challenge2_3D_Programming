# 3D Living Room Design App

A modern, interactive Three.js-powered 3D furniture designer that lets you create, customize, and arrange furniture in virtual living rooms with intuitive controls and real-time visual feedback.
## Video Demo

[![3D Living Room Design App Demo](https://img.youtube.com/vi/zNB0qjm52Bc/0.jpg)](https://youtu.be/zNB0qjm52Bc "3D Living Room Design App Demo")
---

## Table of Contents

- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Running the App](#running-the-app)
- [Controls & Interaction Guide](#controls--interaction-guide)
- [Libraries & Dependencies](#libraries--dependencies)

--- 

## Features

### ✅ Core Features

#### 🏠 **3D Environment**

- Realistic room with configurable dimensions
- Dynamic lighting with shadows
- Multiple room layout presets (Small, Medium, Large)
- Responsive camera controls with OrbitControls
- Grid-based floor system for alignment

#### 🛋️ **Furniture Management**

- Pre-built furniture types: Sofa, Table, Chair
- Add/remove furniture dynamically
- Full scene reset
- One object selection at a time
- Visual selection highlighting with BoxHelper

#### 🎨 **Material & Texture System**

- Real-time color picker for furniture materials
- Upload and apply custom textures to objects
- Texture gallery with thumbnail previews
- Texture removal and management
- Proper memory disposal for textures

#### 📐 **Transform Controls**

- **Scale**: Adjust furniture size (0.5x – 2.5x) with slider or keyboard
- **Rotation**: Rotate objects around Y-axis (0° – 360°) with 15° snap intervals
- **Position**: Drag furniture on the floor plane or use keyboard movement
- Reset transform to original state
- Keyboard shortcuts (Q/E for rotate, +/− for scale)

#### 🎯 **Alignment & Snapping**

- Optional grid snapping (0.5m cells)
- Toggleable visual grid overlay
- Room boundary constraints to prevent objects leaving the space
- Snap furniture to grid cells for precise placement

#### 🎬 **Animation & Feedback**

- Smooth scale-in animation for added furniture
- Pop animation on furniture swap
- Color transition animation on material change
- Real-time visual feedback for all interactions
- Subtle audio cues (add, select, remove, layout change)

#### 💾 **Data Persistence**

- Auto-save furniture layout to localStorage
- Save/restore object positions, colors, scales, rotations
- Save/restore texture selections per object
- Preserve layout preferences (snap, grid, mute state)
- Manual toggle to enable/disable persistence

---

## Setup & Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Clone or navigate to the project directory:**

   ```bash
   cd challenge2
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Verify installation:**

   ```bash
   npm list
   ```

   Expected output should show:

   - `three@^0.182.0`
   - `vite@^7.3.0`

---

## Running the App

### Development Mode (Recommended)

```bash
npx vite
```

The app will start on `http://localhost:5173` (or the next available port).

Open this URL in your browser. Hot module reloading is enabled for quick iteration.

---

## Controls & Interaction Guide

### 🖱️ Mouse & Pointer Controls

| Action                   | Behavior                                           |
| ------------------------ | -------------------------------------------------- |
| **Click on furniture**   | Select object (highlight with blue border)         |
| **Click empty space**    | Deselect current object                            |
| **Drag selected object** | Move furniture on floor plane                      |
| **Scroll on canvas**     | Zoom in/out (camera distance)                      |
| **Right-click + drag**   | Rotate camera around scene (when nothing selected) |
| **Middle-click + drag**  | Pan camera (when nothing selected)                 |

### ⌨️ Keyboard Shortcuts

#### General

| Key            | Action                                |
| -------------- | ------------------------------------- |
| **+** / **=**  | Increase selected object scale by 0.1 |
| **−** / **\_** | Decrease selected object scale by 0.1 |
| **Q**          | Rotate selected object left 15°       |
| **E**          | Rotate selected object right 15°      |

#### Movement (when object selected)

| Key                     | Action                      |
| ----------------------- | --------------------------- |
| **Arrow Up** / **W**    | Move forward (−Z)           |
| **Arrow Down** / **S**  | Move backward (+Z)          |
| **Arrow Left** / **A**  | Move left (−X)              |
| **Arrow Right** / **D** | Move right (+X)             |
| **Shift** (with arrows) | Move faster (0.25m vs 0.1m) |

### 🎛️ UI Controls

#### Design Menu (Click to expand/collapse)

**Layouts Section**

- Click buttons: `Small` | `Medium` | `Large`
- Switches room dimensions and camera view
- Clamps existing furniture to new boundaries

**Furniture Section**

- Click type: `sofa` | `table` | `chair`
- Selects furniture type to add
- Highlighted button shows active type

**Color Section**

- Click color picker to open system color selector
- Applied to selected object instantly
- Shows current object color when selected

**Action Buttons**

- **Add**: Spawn furniture at center (type = selected type)
- **Remove**: Delete selected furniture
- **Reset**: Clear all furniture from scene

**Toggles**

- **Snap to grid**: Enable/disable grid-aligned positioning
- **Show grid**: Toggle grid overlay visibility
- **Mute**: Silence audio feedback cues
- **Save layout**: Toggle localStorage persistence

**Transform Section** (appears when object selected)

- **Scale slider**: 0.5 – 2.5 (step 0.05)
- **Scale buttons**: −/+ to adjust by 0.1
- **Rotation slider**: 0° – 360° (step 15°)
- **Rotation buttons**: ←/→ to adjust by 15°
- **Reset button**: Restore default scale/rotation

**Textures Section** (appears when object selected)

- **Upload button**: Select image file to apply as texture
- **Thumbnail grid**: Shows uploaded textures
- Click thumbnail to apply texture to selected object
- Checkmark ✓ shows active texture
- **×** button on thumbnail to remove texture

---

### Module Responsibilities

| Module                | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `scene.js`            | Three.js initialization, room/lighting/camera      |
| `furniture.js`        | Furniture geometry & data structures               |
| `interaction.js`      | Raycasting, selection, dragging, keyboard movement |
| `ui.js`               | Main UI event handlers & state                     |
| `layoutManager.js`    | Room presets & dimension switching                 |
| `gridSnapping.js`     | Grid geometry & snap-to-grid logic                 |
| `transformManager.js` | Scale/rotation tracking & application              |
| `textureManager.js`   | Image loading & Three.js texture creation          |
| `textureGallery.js`   | Per-object texture lists & active state            |
| `uiTexturePanel.js`   | Texture UI panel rendering                         |
| `uiTransformPanel.js` | Scale/rotation slider UI                           |
| `animationManager.js` | Tweening & smooth transitions                      |
| `audioManager.js`     | Audio context & feedback sounds                    |

---

## Libraries & Dependencies

### Production Dependencies

#### **Three.js** (`^0.182.0`)

- **Purpose**: 3D graphics rendering
- **Features Used**:
  - Scene, Camera, WebGLRenderer
  - Geometries: PlaneGeometry, BoxGeometry, CylinderGeometry
  - Materials: MeshStandardMaterial
  - Lighting: AmbientLight, DirectionalLight, PointLight
  - Shadows: PCFSoftShadowMap
  - Controls: OrbitControls addon
  - Helpers: BoxHelper
  - Raycasting for object selection
  - TextureLoader for image loading
  - GridHelper for grid visualization

### Development Dependencies

#### **Vite** (`^7.3.0`)

- **Purpose**: Fast build tool and dev server
- **Features**:
  - Hot Module Replacement (HMR)
  - ES modules support
  - Optimized production builds
  - Native CSS/image handling

### Asset Sources

- **Images**: Textures uploaded by users via file input
- **Geometries**: Procedurally generated (no external models)
- **Audio**: Generated via Web Audio API (sine wave tones)

---

**Happy designing! 🏠✨**
