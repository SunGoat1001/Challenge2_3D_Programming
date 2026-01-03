const DEFAULTS = {
    scale: 1,
    rotationY: 0
};

const CONSTRAINTS = {
    minScale: 0.5,
    maxScale: 2.5,
    minRotation: 0,
    maxRotation: 360
};

export function createTransformManager() {
    const transforms = new Map(); // objectId -> { scale, rotationY, originalScale, originalRotation }

    function initializeTransform(objectId, mesh) {
        if (!transforms.has(objectId)) {
            transforms.set(objectId, {
                scale: mesh.scale.x || DEFAULTS.scale,
                rotationY: (mesh.rotation.y * 180) / Math.PI || DEFAULTS.rotationY,
                originalScale: mesh.scale.x || DEFAULTS.scale,
                originalRotation: (mesh.rotation.y * 180) / Math.PI || DEFAULTS.rotationY
            });
        }
        return transforms.get(objectId);
    }

    function getTransform(objectId) {
        return transforms.get(objectId) || initializeTransform(objectId, { scale: { x: DEFAULTS.scale }, rotation: { y: 0 } });
    }

    function setScale(objectId, mesh, value) {
        value = Math.max(CONSTRAINTS.minScale, Math.min(CONSTRAINTS.maxScale, value));
        if (mesh) {
            mesh.scale.set(value, value, value);
        }
        const transform = getTransform(objectId);
        transform.scale = value;
        return value;
    }

    function setRotationY(objectId, mesh, degrees) {
        degrees = degrees % 360;
        if (degrees < 0) degrees += 360;
        const radians = (degrees * Math.PI) / 180;
        if (mesh) {
            mesh.rotation.y = radians;
        }
        const transform = getTransform(objectId);
        transform.rotationY = degrees;
        return degrees;
    }

    function adjustScale(objectId, mesh, delta) {
        const transform = getTransform(objectId);
        return setScale(objectId, mesh, transform.scale + delta);
    }

    function adjustRotation(objectId, mesh, deltaDegs) {
        const transform = getTransform(objectId);
        return setRotationY(objectId, mesh, transform.rotationY + deltaDegs);
    }

    function resetTransform(objectId, mesh) {
        if (transforms.has(objectId)) {
            const t = transforms.get(objectId);
            setScale(objectId, mesh, t.originalScale);
            setRotationY(objectId, mesh, t.originalRotation);
        }
    }

    function applyTransformToMesh(objectId, mesh) {
        const transform = getTransform(objectId);
        if (mesh) {
            mesh.scale.set(transform.scale, transform.scale, transform.scale);
            mesh.rotation.y = (transform.rotationY * Math.PI) / 180;
        }
    }

    function serializeTransforms(items) {
        const data = {};
        items.forEach((item) => {
            const transform = transforms.get(item.id);
            if (transform) {
                data[item.id] = { scale: transform.scale, rotationY: transform.rotationY };
            }
        });
        return data;
    }

    function restoreTransforms(transformData, items) {
        if (!transformData || typeof transformData !== "object") return;
        items.forEach((item) => {
            if (transformData[item.id]) {
                const t = transformData[item.id];
                const transform = initializeTransform(item.id, item.mesh);
                if (t.scale) setScale(item.id, item.mesh, t.scale);
                if (t.rotationY) setRotationY(item.id, item.mesh, t.rotationY);
            }
        });
    }

    function clearTransform(objectId) {
        transforms.delete(objectId);
    }

    return {
        CONSTRAINTS,
        getTransform,
        setScale,
        setRotationY,
        adjustScale,
        adjustRotation,
        resetTransform,
        applyTransformToMesh,
        serializeTransforms,
        restoreTransforms,
        clearTransform,
        initializeTransform
    };
}
