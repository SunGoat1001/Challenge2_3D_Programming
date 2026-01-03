import * as THREE from "three";

export function createTextureManager() {
    const textureCache = new Map(); // id -> { texture, imageURL, object }

    function generateTextureId() {
        return `texture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    function loadTextureFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target.result;
                const loader = new THREE.TextureLoader();
                loader.load(
                    url,
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        resolve({ url, texture });
                    },
                    undefined,
                    (err) => reject(err)
                );
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    function addTexture(textureId, imageURL, threeTexture) {
        if (textureCache.has(textureId)) {
            disposeTexture(textureId);
        }
        textureCache.set(textureId, {
            id: textureId,
            imageURL,
            texture: threeTexture,
            appliedTo: null
        });
        return textureId;
    }

    function getTexture(textureId) {
        return textureCache.get(textureId);
    }

    function applyTextureToMesh(textureId, mesh) {
        const entry = textureCache.get(textureId);
        if (!entry || !mesh) return false;

        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.map = entry.texture;
                child.material.needsUpdate = true;
                entry.appliedTo = mesh;
            }
        });
        return true;
    }

    function removeTextureFromMesh(mesh) {
        if (!mesh) return;
        mesh.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.map = null;
                child.material.needsUpdate = true;
            }
        });
    }

    function disposeTexture(textureId) {
        const entry = textureCache.get(textureId);
        if (!entry) return;

        if (entry.texture) {
            entry.texture.dispose?.();
        }

        textureCache.delete(textureId);
    }

    function getAllTextures() {
        return Array.from(textureCache.values());
    }

    function clearAllTextures() {
        textureCache.forEach((entry) => {
            if (entry.texture) entry.texture.dispose?.();
        });
        textureCache.clear();
    }

    return {
        generateTextureId,
        loadTextureFromFile,
        addTexture,
        getTexture,
        applyTextureToMesh,
        removeTextureFromMesh,
        disposeTexture,
        getAllTextures,
        clearAllTextures
    };
}
