export function createTextureGallery() {
    const gallery = new Map(); // objectId -> { textures: [...], activeTextureId: null }

    function getObjectGallery(objectId) {
        if (!gallery.has(objectId)) {
            gallery.set(objectId, { textures: [], activeTextureId: null });
        }
        return gallery.get(objectId);
    }

    function addTextureToObject(objectId, textureEntry) {
        const objectGallery = getObjectGallery(objectId);
        const existing = objectGallery.textures.find((t) => t.id === textureEntry.id);
        if (!existing) {
            objectGallery.textures.push(textureEntry);
        }
        return objectGallery;
    }

    function setActiveTexture(objectId, textureId) {
        const objectGallery = getObjectGallery(objectId);
        if (objectGallery.textures.some((t) => t.id === textureId)) {
            objectGallery.activeTextureId = textureId;
            return true;
        }
        return false;
    }

    function getActiveTexture(objectId) {
        const objectGallery = getObjectGallery(objectId);
        return objectGallery.activeTextureId;
    }

    function getTexturesForObject(objectId) {
        const objectGallery = getObjectGallery(objectId);
        return objectGallery.textures;
    }

    function removeTextureFromObject(objectId, textureId) {
        const objectGallery = getObjectGallery(objectId);
        const idx = objectGallery.textures.findIndex((t) => t.id === textureId);
        if (idx !== -1) {
            objectGallery.textures.splice(idx, 1);
            if (objectGallery.activeTextureId === textureId) {
                objectGallery.activeTextureId = null;
            }
        }
    }

    function clearObjectGallery(objectId) {
        if (gallery.has(objectId)) {
            gallery.delete(objectId);
        }
    }

    function clearAll() {
        gallery.clear();
    }

    return {
        addTextureToObject,
        setActiveTexture,
        getActiveTexture,
        getTexturesForObject,
        removeTextureFromObject,
        clearObjectGallery,
        clearAll
    };
}
