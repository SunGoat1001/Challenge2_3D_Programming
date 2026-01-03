export function initTexturePanel({ onTextureSelect, onTextureRemove, onTextureUpload }) {
    const panelContainer = document.getElementById("texture-panel-container");
    const uploadInput = document.getElementById("texture-upload-input");
    const uploadBtn = document.getElementById("texture-upload-btn");
    const thumbnailsContainer = document.getElementById("texture-thumbnails");
    const disabledMessage = document.getElementById("texture-disabled-message");

    let selectedObjectId = null;

    function show() {
        panelContainer.style.display = "grid";
    }

    function hide() {
        panelContainer.style.display = "none";
    }

    function disable(show = true) {
        uploadBtn.disabled = true;
        uploadBtn.style.opacity = 0.5;
        thumbnailsContainer.style.opacity = 0.5;
        thumbnailsContainer.style.pointerEvents = "none";
        if (show) {
            disabledMessage.style.display = "block";
        }
    }

    function enable() {
        uploadBtn.disabled = false;
        uploadBtn.style.opacity = 1;
        thumbnailsContainer.style.opacity = 1;
        thumbnailsContainer.style.pointerEvents = "auto";
        disabledMessage.style.display = "none";
    }

    function setSelectedObject(objectId) {
        selectedObjectId = objectId;
        if (objectId) {
            show();
            enable();
        } else {
            disable(true);
        }
    }

    function renderThumbnails(textures, activeTextureId) {
        thumbnailsContainer.innerHTML = "";
        textures.forEach((textureEntry) => {
            const thumb = document.createElement("div");
            thumb.className = "texture-thumbnail";
            if (textureEntry.id === activeTextureId) {
                thumb.classList.add("active");
            }
            thumb.style.backgroundImage = `url('${textureEntry.imageURL}')`;
            thumb.title = textureEntry.id;

            const checkmark = document.createElement("div");
            checkmark.className = "texture-checkmark";
            checkmark.textContent = "✓";

            const removeBtn = document.createElement("button");
            removeBtn.className = "texture-thumbnail-remove";
            removeBtn.title = "Remove texture";
            removeBtn.textContent = "×";
            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                onTextureRemove?.(selectedObjectId, textureEntry.id);
            });

            thumb.appendChild(checkmark);
            thumb.appendChild(removeBtn);

            thumb.addEventListener("click", () => {
                onTextureSelect?.(selectedObjectId, textureEntry.id);
            });

            thumbnailsContainer.appendChild(thumb);
        });
    }

    uploadBtn.addEventListener("click", () => {
        uploadInput.click();
    });

    uploadInput.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (file && selectedObjectId) {
            await onTextureUpload?.(selectedObjectId, file);
            uploadInput.value = "";
        }
    });

    return {
        show,
        hide,
        disable,
        enable,
        setSelectedObject,
        renderThumbnails
    };
}
