import * as THREE from "three";

export function createGrid(scene, roomSize, cellSize = 0.5) {
    const vertices = [];
    for (let x = -roomSize.width / 2; x <= roomSize.width / 2 + 0.0001; x += cellSize) {
        vertices.push(x, 0, -roomSize.depth / 2, x, 0, roomSize.depth / 2);
    }
    for (let z = -roomSize.depth / 2; z <= roomSize.depth / 2 + 0.0001; z += cellSize) {
        vertices.push(-roomSize.width / 2, 0, z, roomSize.width / 2, 0, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color: 0xcfd8e3, transparent: true, opacity: 0.25 });
    const grid = new THREE.LineSegments(geometry, material);
    grid.position.y = 0.002;
    grid.visible = false;
    scene.add(grid);
    return grid;
}

export function updateGrid(grid, scene, roomSize, cellSize = 0.5) {
    if (grid) {
        scene.remove(grid);
        grid.geometry?.dispose?.();
        grid.material?.dispose?.();
    }
    return createGrid(scene, roomSize, cellSize);
}

export function snapToGrid(position, cellSize = 0.5) {
    const snapped = position.clone();
    snapped.x = Math.round(snapped.x / cellSize) * cellSize;
    snapped.z = Math.round(snapped.z / cellSize) * cellSize;
    return snapped;
}
