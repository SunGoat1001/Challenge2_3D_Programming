import * as THREE from "three";
import { initScene } from "./scene.js";
import { FURNITURE_TYPES, createFurnitureState, addFurniture, removeFurniture, resetFurniture, swapFurnitureType, updateFurnitureColor, serializeFurniture, restoreFurniture } from "./furniture.js";
import { setupInteraction } from "./interaction.js";
import { initUI } from "./ui.js";
import { LAYOUTS, getLayout, getLayoutKeys, clampFurnitureToLayout } from "./layoutManager.js";
import { createGrid, updateGrid } from "./gridSnapping.js";
import { animateColor, animatePop, animateScaleIn, updateTweens } from "./animationManager.js";
import { isMuted, play, setMuted } from "./audioManager.js";
import { createTextureManager } from "./textureManager.js";
import { createTextureGallery } from "./textureGallery.js";
import { initTexturePanel } from "./uiTexturePanel.js";
import { createTransformManager } from "./transformManager.js";
import { initTransformPanel } from "./uiTransformPanel.js";

const container = document.getElementById("scene-container");
const cellSize = 0.5;
let layoutKey = "medium";
let currentLayout = getLayout(layoutKey);

const { scene, camera, renderer, controls, roomSize, setLayout } = initScene(container, currentLayout);
let gridHelper = createGrid(scene, roomSize, cellSize);

const furnitureState = createFurnitureState(scene);
const textureManager = createTextureManager();
const textureGallery = createTextureGallery();
const transformManager = createTransformManager();
const STORAGE_KEY = "living-room-layout";
let persistEnabled = true;
let snapEnabled = false;
let gridVisible = false;
let defaultColor = document.getElementById("color-picker").value;

function collectMaterials(mesh) {
    const materials = [];
    mesh.traverse((child) => {
        if (child.isMesh && child.material) materials.push(child.material);
    });
    return materials;
}

function saveLayout() {
    if (!persistEnabled) return;
    const data = {
        layout: layoutKey,
        snap: snapEnabled,
        grid: gridVisible,
        muted: isMuted(),
        furniture: serializeFurniture(furnitureState),
        transforms: transformManager.serializeTransforms(furnitureState.items)
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function applyLayoutKey(key) {
    layoutKey = key;
    currentLayout = getLayout(key);
    setLayout(currentLayout);
    clampFurnitureToLayout(furnitureState.items, roomSize);
    gridHelper = updateGrid(gridHelper, scene, roomSize, cellSize);
    gridHelper.visible = gridVisible;
}

function loadLayout() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            restoreFurniture(furnitureState, parsed);
            return;
        }
        if (parsed.layout && LAYOUTS[parsed.layout]) {
            applyLayoutKey(parsed.layout);
        }
        snapEnabled = !!parsed.snap;
        gridVisible = !!parsed.grid;
        setMuted(!!parsed.muted);
        restoreFurniture(furnitureState, parsed.furniture || []);
        transformManager.restoreTransforms(parsed.transforms || {}, furnitureState.items);
        clampFurnitureToLayout(furnitureState.items, roomSize);
    } catch (err) {
        console.warn("Failed to restore layout", err);
    }
}

function setSelectionUI(item) {
    ui.setRemoveEnabled(!!item);
    if (item) {
        ui.setStatus(`Selected: ${item.type} #${item.id}`);
        document.getElementById("color-picker").value = typeof item.color === "string" ? item.color : `#${item.color.toString(16).padStart(6, "0")}`;
        play("select");
        // Update texture panel
        texturePanel.setSelectedObject(item.id);
        const textures = textureGallery.getTexturesForObject(item.id);
        const activeId = textureGallery.getActiveTexture(item.id);
        texturePanel.renderThumbnails(textures, activeId);
        // Update transform panel
        transformManager.initializeTransform(item.id, item.mesh);
        const transform = transformManager.getTransform(item.id);
        transformPanel.setSelectedObject(item.id);
        transformPanel.updateScaleDisplay(transform.scale);
        transformPanel.updateRotationDisplay(transform.rotationY);
    } else {
        ui.setStatus(null);
        texturePanel.setSelectedObject(null);
        transformPanel.setSelectedObject(null);
    }
}

const interaction = setupInteraction({
    renderer,
    camera,
    controls,
    scene,
    furnitureState,
    roomSize,
    snap: { enabled: snapEnabled, cellSize },
    onSelect: (item) => setSelectionUI(item),
    onMove: () => saveLayout()
});

const ui = initUI({
    types: FURNITURE_TYPES,
    layouts: getLayoutKeys(),
    onLayoutChange: (key) => {
        applyLayoutKey(key);
        interaction.clearSelection();
        saveLayout();
        play("layout");
    },
    onTypeChange: (type) => {
        const selected = interaction.getSelected();
        if (selected && selected.type !== type) {
            const replacement = swapFurnitureType(furnitureState, selected, type);
            if (replacement) {
                animateScaleIn(replacement.mesh, 250, 1);
            }
            interaction.setSelectionById(replacement?.id);
            saveLayout();
        }
    },
    onColorChange: (color) => {
        defaultColor = color;
        const selected = interaction.getSelected();
        if (selected) {
            updateFurnitureColor(selected, color);
            animateColor(collectMaterials(selected.mesh), color, 350);
            saveLayout();
        }
    },
    onAdd: () => {
        const item = addFurniture(furnitureState, {
            type: ui.getActiveType(),
            color: defaultColor,
            position: new THREE.Vector3(0, 0, 0)
        });
        animateScaleIn(item.mesh);
        interaction.setSelectionById(item.id);
        saveLayout();
        play("add");
    },
    onRemove: () => {
        const selected = interaction.getSelected();
        if (!selected) return;
        removeFurniture(furnitureState, selected.id);
        interaction.clearSelection();
        saveLayout();
        play("remove");
    },
    onReset: () => {
        resetFurniture(furnitureState);
        interaction.clearSelection();
        saveLayout();
    },
    onPersistToggle: (enabled) => {
        persistEnabled = enabled;
        if (enabled) saveLayout();
    },
    onSnapToggle: (enabled) => {
        snapEnabled = enabled;
        interaction.setSnapEnabled(enabled);
        saveLayout();
    },
    onGridToggle: (visible) => {
        gridVisible = visible;
        gridHelper.visible = visible;
        saveLayout();
    },
    onMuteToggle: (muted) => {
        setMuted(muted);
        saveLayout();
    }
});

const texturePanel = initTexturePanel({
    onTextureSelect: async (objectId, textureId) => {
        const selected = interaction.getSelected();
        if (!selected || selected.id !== objectId) return;

        textureGallery.setActiveTexture(objectId, textureId);
        textureManager.applyTextureToMesh(textureId, selected.mesh);

        const textures = textureGallery.getTexturesForObject(objectId);
        const activeId = textureGallery.getActiveTexture(objectId);
        texturePanel.renderThumbnails(textures, activeId);

        saveLayout();
        play("select");
    },
    onTextureRemove: async (objectId, textureId) => {
        textureGallery.removeTextureFromObject(objectId, textureId);
        textureManager.disposeTexture(textureId);

        const selected = interaction.getSelected();
        if (selected && selected.id === objectId) {
            const textures = textureGallery.getTexturesForObject(objectId);
            const activeId = textureGallery.getActiveTexture(objectId);
            texturePanel.renderThumbnails(textures, activeId);
            if (!activeId && selected.mesh) {
                textureManager.removeTextureFromMesh(selected.mesh);
            }
        }

        saveLayout();
        play("remove");
    },
    onTextureUpload: async (objectId, file) => {
        const selected = interaction.getSelected();
        if (!selected || selected.id !== objectId) return;

        try {
            const { url, texture } = await textureManager.loadTextureFromFile(file);
            const textureId = textureManager.generateTextureId();
            textureManager.addTexture(textureId, url, texture);

            const textureEntry = { id: textureId, imageURL: url, texture };
            textureGallery.addTextureToObject(objectId, textureEntry);
            textureGallery.setActiveTexture(objectId, textureId);

            textureManager.applyTextureToMesh(textureId, selected.mesh);

            const textures = textureGallery.getTexturesForObject(objectId);
            const activeId = textureGallery.getActiveTexture(objectId);
            texturePanel.renderThumbnails(textures, activeId);

            saveLayout();
            play("add");
        } catch (err) {
            console.error("Failed to upload texture:", err);
        }
    }
});

const transformPanel = initTransformPanel({
    onScaleChange: (objectId, value) => {
        const selected = interaction.getSelected();
        if (!selected || selected.id !== objectId) return;
        transformManager.setScale(objectId, selected.mesh, value);
        saveLayout();
    },
    onRotationChange: (objectId, degrees) => {
        const selected = interaction.getSelected();
        if (!selected || selected.id !== objectId) return;
        transformManager.setRotationY(objectId, selected.mesh, degrees);
        saveLayout();
    },
    onReset: (objectId) => {
        const selected = interaction.getSelected();
        if (!selected || selected.id !== objectId) return;
        transformManager.resetTransform(objectId, selected.mesh);
        const transform = transformManager.getTransform(objectId);
        transformPanel.updateScaleDisplay(transform.scale);
        transformPanel.updateRotationDisplay(transform.rotationY);
        saveLayout();
    }
});

loadLayout();
interaction.setSnapEnabled(snapEnabled);
gridHelper.visible = gridVisible;
ui.setLayoutActive(layoutKey);
ui.setSnapChecked(snapEnabled);
ui.setGridChecked(gridVisible);
ui.setMuteChecked(isMuted());

// Keyboard shortcuts for transform
document.addEventListener("keydown", (e) => {
    const selected = interaction.getSelected();
    if (!selected) return;

    // Scale shortcuts: +/=, -/_
    if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        transformManager.adjustScale(selected.id, selected.mesh, 0.1);
        const transform = transformManager.getTransform(selected.id);
        transformPanel.updateScaleDisplay(transform.scale);
        saveLayout();
    } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        transformManager.adjustScale(selected.id, selected.mesh, -0.1);
        const transform = transformManager.getTransform(selected.id);
        transformPanel.updateScaleDisplay(transform.scale);
        saveLayout();
    }
    // Rotation shortcuts: Q, E
    else if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        transformManager.adjustRotation(selected.id, selected.mesh, -15);
        const transform = transformManager.getTransform(selected.id);
        transformPanel.updateRotationDisplay(transform.rotationY);
        saveLayout();
    } else if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        transformManager.adjustRotation(selected.id, selected.mesh, 15);
        const transform = transformManager.getTransform(selected.id);
        transformPanel.updateRotationDisplay(transform.rotationY);
        saveLayout();
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateTweens();
    renderer.render(scene, camera);
}

animate();
