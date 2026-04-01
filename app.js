/**
 * app.js — vzglyd web host orchestrator.
 *
 * This is the stripped-down UI layer that:
 * 1. Loads the vzglyd_web WASM module
 * 2. Sets up WebGPU context
 * 3. Handles file drop for loading .vzglyd bundles
 * 4. Runs the requestAnimationFrame loop
 *
 * All kernel logic (scheduling, transitions, spec decoding) is in Rust.
 */

// ── DOM refs ──────────────────────────────────────────────────────────────────

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById('render-canvas');
const slideName = document.getElementById('slide-name');
const slideFps = document.getElementById('slide-fps');
const backBtn = document.getElementById('back-btn');
const statusBar = document.getElementById('status-bar');
const statusSpinner = document.getElementById('status-spinner');
const statusText = document.getElementById('status-text');
const errorBox = document.getElementById('error-box');
const errorText = document.getElementById('error-text');
const errorDismiss = document.getElementById('error-dismiss');
const noWebgpu = document.getElementById('no-webgpu');
const fileOriginWarning = document.getElementById('file-origin-warning');

// ── State ─────────────────────────────────────────────────────────────────────

/** @type {import('./pkg/vzglyd_web.js').WebHost|null} */
let webHost = null;

let rafId = null;
let lastTimestamp = 0;

// ── Startup checks ────────────────────────────────────────────────────────────

async function checkWebGPU() {
    if (!navigator.gpu) {
        dropZone.hidden = true;
        noWebgpu.hidden = false;
        return;
    }

    if (location.protocol === 'file:') {
        dropZone.hidden = true;
        fileOriginWarning.hidden = false;
        return;
    }

    // Probe the adapter
    const adapter =
        await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' }) ??
        await navigator.gpu.requestAdapter() ??
        await navigator.gpu.requestAdapter({ forceFallbackAdapter: true });

    if (!adapter) {
        dropZone.hidden = true;
        noWebgpu.hidden = false;
    }
}

checkWebGPU();

// ── Copy-command buttons ───────────────────────────────────────────────────────

document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const text = document.getElementById(targetId)?.textContent ?? '';
        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
        });
    });
});

// ── UI helpers ────────────────────────────────────────────────────────────────

function setStatus(msg, spinning = false) {
    statusBar.hidden = false;
    statusText.textContent = msg;
    statusSpinner.hidden = !spinning;
}

function clearStatus() {
    statusBar.hidden = true;
    statusText.textContent = '';
    statusSpinner.hidden = true;
}

function showError(msg) {
    errorBox.hidden = false;
    errorText.textContent = msg;
    console.error(msg);
}

function hideError() {
    errorBox.hidden = true;
}

// ── WASM initialization ───────────────────────────────────────────────────────

async function initWasmHost() {
    try {
        setStatus('Loading engine...', true);
        
        // Import the WASM module
        const { default: init, WebHost } = await import('./pkg/vzglyd_web.js');
        
        await init();
        
        // Get WebGPU device
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (!adapter) {
            throw new Error('Failed to get GPU adapter');
        }
        
        const device = await adapter.requestDevice();
        
        // Create the WebHost
        webHost = new WebHost(canvas, device);
        
        setStatus('Ready. Drop a .vzglyd file.', false);
        
        return true;
    } catch (e) {
        showError(`Failed to initialize: ${e.message}`);
        return false;
    }
}

// ── File loading ──────────────────────────────────────────────────────────────

async function loadVzglydFile(file) {
    if (!webHost) {
        showError('Engine not initialized');
        return;
    }

    try {
        setStatus(`Loading ${file.name}...`, true);
        
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Call into WASM to load the slide
        webHost.load_slide(bytes);
        
        slideName.textContent = file.name;
        dropZone.hidden = true;
        canvasContainer.hidden = false;
        
        clearStatus();
        startRenderLoop();
        
    } catch (e) {
        showError(`Failed to load slide: ${e.message}`);
    }
}

// ── Render loop ───────────────────────────────────────────────────────────────

function startRenderLoop() {
    if (rafId) {
        cancelAnimationFrame(rafId);
    }
    
    function frame(timestamp) {
        if (!webHost) return;
        
        if (lastTimestamp === 0) {
            lastTimestamp = timestamp;
        }
        
        // Calculate FPS
        const dt = (timestamp - lastTimestamp) / 1000;
        const fps = dt > 0 ? Math.round(1 / dt) : 60;
        slideFps.textContent = `${fps} FPS`;
        
        // Update the engine
        try {
            webHost.frame(timestamp);
        } catch (e) {
            console.error('Frame error:', e);
        }
        
        lastTimestamp = timestamp;
        rafId = requestAnimationFrame(frame);
    }
    
    rafId = requestAnimationFrame(frame);
}

function stopRenderLoop() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    lastTimestamp = 0;
}

// ── Event handlers ────────────────────────────────────────────────────────────

// Drag and drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.vzglyd')) {
        loadVzglydFile(file);
    } else {
        showError('Please drop a .vzglyd file');
    }
});

// File input
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadVzglydFile(file);
    }
});

// Browse button
dropZone.querySelector('.file-label').addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
});

// Back button
backBtn.addEventListener('click', () => {
    stopRenderLoop();
    canvasContainer.hidden = true;
    dropZone.hidden = false;
    slideName.textContent = '';
    slideFps.textContent = '';
    webHost = null;
    initWasmHost();
});

// Error dismiss
errorDismiss.addEventListener('click', hideError);

// Keyboard accessibility for drop zone
dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
    }
});

// ── Initialize ────────────────────────────────────────────────────────────────

initWasmHost();
