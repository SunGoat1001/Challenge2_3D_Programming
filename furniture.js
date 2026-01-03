import * as THREE from "three";

let nextId = 1;

export const FURNITURE_TYPES = ["sofa", "table", "chair"];

function baseMaterial(color) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05 });
}

function buildSofa(color) {
    const group = new THREE.Group();
    const mat = baseMaterial(color);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2, 0.45, 0.9), mat);
    seat.position.y = 0.225;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 0.2), mat);
    back.position.set(0, 0.6, -0.35);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45, 0.9), mat);
    armL.position.set(-0.975, 0.225, 0);
    const armR = armL.clone();
    armR.position.x = 0.975;
    [seat, back, armL, armR].forEach((m) => {
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
    });
    return group;
}

function buildTable(color) {
    const group = new THREE.Group();
    const mat = baseMaterial(color);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.7), mat);
    top.position.y = 0.55;
    top.castShadow = true;
    top.receiveShadow = true;
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.55, 12);
    const legPositions = [
        [-0.5, 0.275, -0.25],
        [0.5, 0.275, -0.25],
        [-0.5, 0.275, 0.25],
        [0.5, 0.275, 0.25]
    ];
    legPositions.forEach((p) => {
        const leg = new THREE.Mesh(legGeo, mat);
        leg.position.set(p[0], p[1], p[2]);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
    });
    group.add(top);
    return group;
}

function buildChair(color) {
    const group = new THREE.Group();
    const mat = baseMaterial(color);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), mat);
    seat.position.y = 0.5;
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.05), mat);
    back.position.set(0, 0.8, -0.225);
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 10);
    const legs = [
        [-0.2, 0.25, -0.2],
        [0.2, 0.25, -0.2],
        [-0.2, 0.25, 0.2],
        [0.2, 0.25, 0.2]
    ];
    legs.forEach((p) => {
        const leg = new THREE.Mesh(legGeo, mat);
        leg.position.set(p[0], p[1], p[2]);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
    });
    [seat, back].forEach((m) => {
        m.castShadow = true;
        m.receiveShadow = true;
        group.add(m);
    });
    return group;
}

function createMesh(type, color) {
    switch (type) {
        case "sofa":
            return buildSofa(color);
        case "table":
            return buildTable(color);
        case "chair":
        default:
            return buildChair(color);
    }
}

export function createFurnitureState(scene) {
    return {
        scene,
        items: []
    };
}

export function addFurniture(state, { type, color = 0xd4a373, position = new THREE.Vector3(0, 0, 0) }) {
    const mesh = createMesh(type, color);
    mesh.position.copy(position);
    mesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    const item = { id: nextId++, type, mesh, color };
    state.items.push(item);
    state.scene.add(mesh);
    return item;
}

export function removeFurniture(state, id) {
    const idx = state.items.findIndex((f) => f.id === id);
    if (idx === -1) return;
    const [item] = state.items.splice(idx, 1);
    state.scene.remove(item.mesh);
}

export function resetFurniture(state) {
    [...state.items].forEach((f) => removeFurniture(state, f.id));
}

export function swapFurnitureType(state, item, newType) {
    if (!item) return null;
    const pos = item.mesh.position.clone();
    const color = item.color;
    removeFurniture(state, item.id);
    const replacement = addFurniture(state, { type: newType, color, position: pos });
    return replacement;
}

export function updateFurnitureColor(item, color) {
    if (!item) return;
    item.color = color;
    item.mesh.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.color.set(color);
        }
    });
}

export function serializeFurniture(state) {
    return state.items.map((item) => ({
        id: item.id,
        type: item.type,
        color: typeof item.color === "number" ? `#${item.color.toString(16).padStart(6, "0")}` : item.color,
        position: item.mesh.position.toArray()
    }));
}

export function restoreFurniture(state, saved) {
    if (!Array.isArray(saved)) return;
    saved.forEach((entry) => {
        const color = entry.color || 0xd4a373;
        const pos = new THREE.Vector3().fromArray(entry.position || [0, 0, 0]);
        const item = addFurniture(state, { type: entry.type || "chair", color, position: pos });
        item.id = entry.id || nextId++;
        nextId = Math.max(nextId, item.id + 1);
    });
}
