export function initTransformPanel({ onScaleChange, onRotationChange, onReset }) {
    const panelContainer = document.getElementById("transform-panel-container");
    const scaleSlider = document.getElementById("transform-scale-slider");
    const scaleValue = document.getElementById("transform-scale-value");
    const scaleDecBtn = document.getElementById("transform-scale-dec");
    const scaleIncBtn = document.getElementById("transform-scale-inc");
    const rotationSlider = document.getElementById("transform-rotation-slider");
    const rotationValue = document.getElementById("transform-rotation-value");
    const rotationDecBtn = document.getElementById("transform-rotation-dec");
    const rotationIncBtn = document.getElementById("transform-rotation-inc");
    const resetBtn = document.getElementById("transform-reset-btn");
    const disabledMessage = document.getElementById("transform-disabled-message");

    let selectedObjectId = null;

    function show() {
        if (panelContainer) panelContainer.style.display = "grid";
    }

    function hide() {
        if (panelContainer) panelContainer.style.display = "none";
    }

    function disable(show = true) {
        [scaleSlider, rotationSlider, scaleDecBtn, scaleIncBtn, rotationDecBtn, rotationIncBtn, resetBtn].forEach((el) => {
            if (el) {
                el.disabled = true;
                el.style.opacity = "0.5";
            }
        });
        if (disabledMessage) {
            disabledMessage.style.display = show ? "block" : "none";
        }
    }

    function enable() {
        [scaleSlider, rotationSlider, scaleDecBtn, scaleIncBtn, rotationDecBtn, rotationIncBtn, resetBtn].forEach((el) => {
            if (el) {
                el.disabled = false;
                el.style.opacity = "1";
            }
        });
        if (disabledMessage) {
            disabledMessage.style.display = "none";
        }
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

    function updateScaleDisplay(value) {
        if (scaleValue) scaleValue.textContent = value.toFixed(2);
        if (scaleSlider) scaleSlider.value = value;
    }

    function updateRotationDisplay(degrees) {
        if (rotationValue) rotationValue.textContent = Math.round(degrees) + "°";
        if (rotationSlider) rotationSlider.value = degrees;
    }

    // Scale slider
    if (scaleSlider) {
        scaleSlider.addEventListener("input", (e) => {
            const value = parseFloat(e.target.value);
            updateScaleDisplay(value);
            onScaleChange?.(selectedObjectId, value);
        });
    }

    // Scale buttons
    if (scaleDecBtn) {
        scaleDecBtn.addEventListener("click", () => {
            const current = parseFloat(scaleSlider?.value || 1);
            const next = Math.max(0.5, current - 0.1);
            updateScaleDisplay(next);
            onScaleChange?.(selectedObjectId, next);
        });
    }

    if (scaleIncBtn) {
        scaleIncBtn.addEventListener("click", () => {
            const current = parseFloat(scaleSlider?.value || 1);
            const next = Math.min(2.5, current + 0.1);
            updateScaleDisplay(next);
            onScaleChange?.(selectedObjectId, next);
        });
    }

    // Rotation slider
    if (rotationSlider) {
        rotationSlider.addEventListener("input", (e) => {
            const value = parseFloat(e.target.value);
            updateRotationDisplay(value);
            onRotationChange?.(selectedObjectId, value);
        });
    }

    // Rotation buttons
    if (rotationDecBtn) {
        rotationDecBtn.addEventListener("click", () => {
            const current = parseFloat(rotationSlider?.value || 0);
            const next = (current - 15 + 360) % 360;
            updateRotationDisplay(next);
            onRotationChange?.(selectedObjectId, next);
        });
    }

    if (rotationIncBtn) {
        rotationIncBtn.addEventListener("click", () => {
            const current = parseFloat(rotationSlider?.value || 0);
            const next = (current + 15) % 360;
            updateRotationDisplay(next);
            onRotationChange?.(selectedObjectId, next);
        });
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            updateScaleDisplay(1);
            updateRotationDisplay(0);
            onReset?.(selectedObjectId);
        });
    }

    return {
        show,
        hide,
        disable,
        enable,
        setSelectedObject,
        updateScaleDisplay,
        updateRotationDisplay
    };
}
