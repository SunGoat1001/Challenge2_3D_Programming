import * as THREE from "three";
import { snapToGrid } from "./gridSnapping.js";

function clampToRoom(position, roomSize, margin = 0.25) {
    position.x = THREE.MathUtils.clamp(position.x, -roomSize.width / 2 + margin, roomSize.width / 2 - margin);
    position.z = THREE.MathUtils.clamp(position.z, -roomSize.depth / 2 + margin, roomSize.depth / 2 - margin);
    return position;
}

export function setupInteraction({ renderer, camera, controls, scene, furnitureState, roomSize, onSelect, onMove, snap = { enabled: false, cellSize: 0.5 } }) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const dragOffset = new THREE.Vector3();
    const snapState = { enabled: snap?.enabled ?? false, cellSize: snap?.cellSize ?? 0.5 };
    let selected = null;
    let helper = null;
    let dragging = false;

    const dom = renderer.domElement;

    function setStatusSelection(item) {
        selected = item;
        if (helper) {
            scene.remove(helper);
            helper = null;
        }
        if (item) {
            helper = new THREE.BoxHelper(item.mesh, 0x3a7afe);
            scene.add(helper);
        }
        if (controls) {
            controls.enabled = !item; // disable orbiting while an object is selected
        }
        onSelect?.(item);
    }

    function updateHelper() {
        if (helper && selected) {
            helper.update();
        }
    }

    function getIntersects(event, objects) {
        const rect = dom.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObjects(objects, true);
    }

    function pickFurniture(event) {
        const meshes = furnitureState.items.map((f) => f.mesh);
        const hits = getIntersects(event, meshes);
        if (hits.length === 0) return null;
        const hit = hits[0].object;
        let root = hit;
        while (root.parent && !meshes.includes(root)) {
            root = root.parent;
        }
        return furnitureState.items.find((f) => f.mesh === root) || null;
    }

    function updatePositionFromPointer(event) {
        const rect = dom.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hitPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, hitPoint);
        if (!selected) return;
        const target = hitPoint.clone().sub(dragOffset);
        if (snapState.enabled) target.copy(snapToGrid(target, snapState.cellSize));
        clampToRoom(target, roomSize);
        target.y = selected.mesh.position.y;
        selected.mesh.position.copy(target);
        updateHelper();
        onMove?.(selected);
    }

    function onPointerDown(event) {
        const hitItem = pickFurniture(event);
        if (hitItem) {
            setStatusSelection(hitItem);
            const rect = dom.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const planeHit = new THREE.Vector3();
            raycaster.ray.intersectPlane(plane, planeHit);
            dragOffset.copy(planeHit).sub(hitItem.mesh.position);
            dragging = true;
        } else {
            setStatusSelection(null);
        }
    }

    function onPointerMove(event) {
        if (!dragging) return;
        updatePositionFromPointer(event);
    }

    function onPointerUp() {
        dragging = false;
    }

    function onKeyDown(event) {
        if (!selected) return;
        const step = event.shiftKey ? 0.25 : 0.1;
        const pos = selected.mesh.position.clone();
        if (event.key === "ArrowUp" || event.key === "w") pos.z -= step;
        if (event.key === "ArrowDown" || event.key === "s") pos.z += step;
        if (event.key === "ArrowLeft" || event.key === "a") pos.x -= step;
        if (event.key === "ArrowRight" || event.key === "d") pos.x += step;
        if (snapState.enabled) pos.copy(snapToGrid(pos, snapState.cellSize));
        clampToRoom(pos, roomSize);
        pos.y = selected.mesh.position.y;
        selected.mesh.position.copy(pos);
        updateHelper();
        onMove?.(selected);
    }

    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);

    return {
        getSelected: () => selected,
        setSelectionById: (id) => {
            const item = furnitureState.items.find((f) => f.id === id) || null;
            setStatusSelection(item);
        },
        clearSelection: () => setStatusSelection(null),
        updateHelper,
        setSnapEnabled: (enabled) => {
            snapState.enabled = enabled;
        },
        setCellSize: (value) => {
            snapState.cellSize = value;
        },
        dispose: () => {
            dom.removeEventListener("pointerdown", onPointerDown);
            dom.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("keydown", onKeyDown);
        }
    };
}
