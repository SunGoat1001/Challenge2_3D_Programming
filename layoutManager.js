export const LAYOUTS = {
    small: {
        key: "small",
        label: "Small",
        width: 4,
        depth: 3,
        height: 2.8,
        camera: { position: [5, 3, 5], target: [0.2, 1, 0], minDistance: 2.5, maxDistance: 9 }
    },
    medium: {
        key: "medium",
        label: "Medium",
        width: 6,
        depth: 4,
        height: 3,
        camera: { position: [6, 3, 6], target: [0.3, 1, 0], minDistance: 3, maxDistance: 12 }
    },
    large: {
        key: "large",
        label: "Large",
        width: 8,
        depth: 6,
        height: 3.2,
        camera: { position: [7.5, 3.5, 7.5], target: [0.4, 1, 0], minDistance: 3, maxDistance: 14 }
    }
};

export function getLayout(key = "medium") {
    return LAYOUTS[key] || LAYOUTS.medium;
}

export function getLayoutKeys() {
    return Object.keys(LAYOUTS);
}

export function clampFurnitureToLayout(items, roomSize) {
    const margin = 0.2;
    items.forEach((item) => {
        const pos = item.mesh.position;
        pos.x = Math.min(Math.max(pos.x, -roomSize.width / 2 + margin), roomSize.width / 2 - margin);
        pos.z = Math.min(Math.max(pos.z, -roomSize.depth / 2 + margin), roomSize.depth / 2 - margin);
    });
}
