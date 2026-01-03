const frequencies = {
    add: 520,
    select: 640,
    remove: 360,
    layout: 440
};

let ctx = null;
let muted = false;

function ensureContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
}

export function setMuted(value) {
    muted = value;
}

export function isMuted() {
    return muted;
}

export function play(event) {
    if (muted) return;
    const freq = frequencies[event];
    if (!freq) return;
    ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.03;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
}
