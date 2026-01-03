import * as THREE from "three";

const tweens = [];
const easeOut = (t) => 1 - Math.pow(1 - t, 2.4);

function addTween({ duration = 350, update, onComplete }) {
    const start = performance.now();
    tweens.push({ start, duration, update, onComplete });
}

export function animateScaleIn(object, duration = 350, targetScale = 1) {
    const startScale = new THREE.Vector3(0.01, 0.01, 0.01);
    const endScale = new THREE.Vector3(targetScale, targetScale, targetScale);
    object.scale.copy(startScale);
    addTween({
        duration,
        update: (t) => {
            object.scale.lerpVectors(startScale, endScale, easeOut(t));
        }
    });
}

export function animateColor(materials, targetColor, duration = 400) {
    const mats = Array.isArray(materials) ? materials : [materials];
    const target = new THREE.Color(targetColor);
    mats.forEach((mat) => {
        if (!mat || !mat.color) return;
        const start = mat.color.clone();
        addTween({
            duration,
            update: (t) => {
                mat.color.lerpColors(start, target, easeOut(t));
            }
        });
    });
}

export function animatePop(object, duration = 250, factor = 1.08) {
    const original = object.scale.clone();
    const peak = original.clone().multiplyScalar(factor);
    addTween({
        duration,
        update: (t) => {
            const phase = t < 0.5 ? easeOut(t * 2) : 1 - easeOut((t - 0.5) * 2);
            object.scale.lerpVectors(original, peak, phase);
        },
        onComplete: () => {
            object.scale.copy(original);
        }
    });
}

export function updateTweens() {
    const now = performance.now();
    for (let i = tweens.length - 1; i >= 0; i -= 1) {
        const tween = tweens[i];
        const t = Math.min(1, (now - tween.start) / tween.duration);
        tween.update(t);
        if (t >= 1) {
            tween.onComplete?.();
            tweens.splice(i, 1);
        }
    }
}
