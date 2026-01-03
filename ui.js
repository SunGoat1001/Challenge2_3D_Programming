const STATUS_IDLE = "Select or add furniture";

export function initUI({
    types,
    layouts,
    onTypeChange,
    onLayoutChange,
    onColorChange,
    onAdd,
    onRemove,
    onReset,
    onPersistToggle,
    onSnapToggle,
    onGridToggle,
    onMuteToggle
}) {
    const typeButtonsContainer = document.getElementById("type-buttons");
    const layoutButtonsContainer = document.getElementById("layout-buttons");
    const colorPicker = document.getElementById("color-picker");
    const addBtn = document.getElementById("add-btn");
    const removeBtn = document.getElementById("remove-btn");
    const resetBtn = document.getElementById("reset-btn");
    const persistToggle = document.getElementById("persist-toggle");
    const snapToggle = document.getElementById("snap-toggle");
    const gridToggle = document.getElementById("grid-toggle");
    const muteToggle = document.getElementById("mute-toggle");
    const status = document.getElementById("status");

    let activeType = types[0];
    let activeLayout = layouts?.[0] ?? "medium";

    function renderTypeButtons() {
        typeButtonsContainer.innerHTML = "";
        types.forEach((type) => {
            const btn = document.createElement("button");
            btn.textContent = type;
            if (type === activeType) btn.classList.add("active");
            btn.addEventListener("click", () => {
                activeType = type;
                [...typeButtonsContainer.children].forEach((c) => c.classList.remove("active"));
                btn.classList.add("active");
                onTypeChange?.(type);
            });
            typeButtonsContainer.appendChild(btn);
        });
    }

    function renderLayoutButtons() {
        layoutButtonsContainer.innerHTML = "";
        layouts.forEach((layoutKey) => {
            const btn = document.createElement("button");
            const label = layoutKey.charAt(0).toUpperCase() + layoutKey.slice(1);
            btn.textContent = label;
            if (layoutKey === activeLayout) btn.classList.add("active");
            btn.addEventListener("click", () => {
                activeLayout = layoutKey;
                [...layoutButtonsContainer.children].forEach((c) => c.classList.remove("active"));
                btn.classList.add("active");
                onLayoutChange?.(layoutKey);
            });
            layoutButtonsContainer.appendChild(btn);
        });
    }

    renderTypeButtons();
    renderLayoutButtons();

    colorPicker.addEventListener("input", (e) => {
        onColorChange?.(e.target.value);
    });

    addBtn.addEventListener("click", () => onAdd?.());
    removeBtn.addEventListener("click", () => onRemove?.());
    resetBtn.addEventListener("click", () => onReset?.());
    persistToggle.addEventListener("change", (e) => onPersistToggle?.(e.target.checked));
    snapToggle.addEventListener("change", (e) => onSnapToggle?.(e.target.checked));
    gridToggle.addEventListener("change", (e) => onGridToggle?.(e.target.checked));
    muteToggle.addEventListener("change", (e) => onMuteToggle?.(e.target.checked));

    status.textContent = STATUS_IDLE;

    return {
        getActiveType: () => activeType,
        getColor: () => colorPicker.value,
        getActiveLayout: () => activeLayout,
        setStatus: (text) => {
            status.textContent = text || STATUS_IDLE;
        },
        setRemoveEnabled: (enabled) => {
            removeBtn.disabled = !enabled;
            removeBtn.style.opacity = enabled ? 1 : 0.5;
        },
        setTypeActive: (type) => {
            activeType = type;
            [...typeButtonsContainer.children].forEach((btn) => {
                if (btn.textContent === type) btn.classList.add("active");
                else btn.classList.remove("active");
            });
        },
        setLayoutActive: (layoutKey) => {
            activeLayout = layoutKey;
            [...layoutButtonsContainer.children].forEach((btn) => {
                const label = btn.textContent.toLowerCase();
                if (label === layoutKey.toLowerCase()) btn.classList.add("active");
                else btn.classList.remove("active");
            });
        },
        setSnapChecked: (value) => {
            snapToggle.checked = value;
        },
        setGridChecked: (value) => {
            gridToggle.checked = value;
        },
        setMuteChecked: (value) => {
            muteToggle.checked = value;
        }
    };
}
