import {
  fetchBundleFromRepo,
  loadPlaylistFromRepo,
} from './js/playlist_repo.js';
import {
  DEFAULT_TRANSITION,
  TRANSITION_DURATION_MS,
  buildPlayableSchedule,
  nextScheduleIndex,
  normalizeStartIndex,
  resolveTransitionKind,
  smoothstep,
} from './js/view_player.js';

const REPO_STORAGE_KEY = 'vzglyd.shared_repo_url';
const MIN_RENDER_SIZE = 512;
const MAX_RENDER_SIZE = 1600;
const DISSOLVE_MASK_SIZE = 128;

const displayCanvas = document.getElementById('view-canvas');
const overlay = document.getElementById('view-overlay');
const overlayKicker = document.getElementById('view-overlay-kicker');
const overlayTitle = document.getElementById('view-overlay-title');
const overlayText = document.getElementById('view-overlay-text');
const displayContext = displayCanvas.getContext('2d', { alpha: false });

let runtimeModulePromise = null;
let WebHostCtor = null;
let rafId = null;

const state = {
  repo: null,
  schedule: [],
  currentIndex: 0,
  currentSlotKey: 'a',
  slideStartedAtMs: 0,
  transition: null,
  preload: null,
  bundleCache: new Map(),
};

const renderSize = computeRenderSize();
const dissolve = createDissolveBuffers(renderSize);

class HostSlot {
  constructor(key, size) {
    this.key = key;
    this.canvas = document.createElement('canvas');
    sizeCanvas(this.canvas, size);
    this.host = null;
    this.entry = null;
    this.bundleUrl = '';
    this.loadToken = 0;
  }

  async ensureHost() {
    await ensureRuntime();
    if (!this.host) {
      this.host = new WebHostCtor(this.canvas, {
        networkPolicy: 'any_https',
      });
    }
  }

  async load(entry, bundle) {
    const token = ++this.loadToken;
    await this.ensureHost();
    await this.host.loadBundle(bundle.bytes, {
      params: entry.params ?? null,
    });

    if (token !== this.loadToken) {
      return;
    }

    this.entry = entry;
    this.bundleUrl = bundle.bundleUrl;
  }

  frame(timestampMs) {
    if (!this.host) {
      return;
    }

    this.host.frame(timestampMs);
  }

  teardown() {
    this.loadToken += 1;
    this.entry = null;
    this.bundleUrl = '';

    if (!this.host) {
      return;
    }

    try {
      this.host.teardown();
    } catch (error) {
      console.warn('[vzglyd] slot teardown failed', error);
    }

    this.host = null;
  }
}

const slots = {
  a: new HostSlot('a', renderSize),
  b: new HostSlot('b', renderSize),
};

sizeCanvas(displayCanvas, renderSize);
displayContext.imageSmoothingEnabled = true;
clearDisplay();

function computeRenderSize() {
  const viewportExtent = Math.max(
    1,
    Math.min(window.innerWidth || 1024, window.innerHeight || 1024),
  );
  const scale = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const desired = Math.round(viewportExtent * scale);
  return Math.max(MIN_RENDER_SIZE, Math.min(MAX_RENDER_SIZE, desired));
}

function sizeCanvas(canvas, size) {
  canvas.width = size;
  canvas.height = size;
}

function createDissolveBuffers(size) {
  const maskCanvas = document.createElement('canvas');
  const maskContext = maskCanvas.getContext('2d');
  sizeCanvas(maskCanvas, DISSOLVE_MASK_SIZE);
  maskContext.imageSmoothingEnabled = false;

  const workCanvas = document.createElement('canvas');
  const workContext = workCanvas.getContext('2d');
  sizeCanvas(workCanvas, size);
  workContext.imageSmoothingEnabled = false;

  const maskImage = maskContext.createImageData(DISSOLVE_MASK_SIZE, DISSOLVE_MASK_SIZE);
  const noise = new Float32Array(DISSOLVE_MASK_SIZE * DISSOLVE_MASK_SIZE);
  let seed = 0x12345678;

  for (let index = 0; index < noise.length; index += 1) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    noise[index] = seed / 0xffffffff;
  }

  return {
    maskCanvas,
    maskContext,
    maskImage,
    noise,
    workCanvas,
    workContext,
  };
}

function setOverlay(kicker, title, text, tone = 'info') {
  overlay.hidden = false;
  overlay.dataset.tone = tone;
  overlayKicker.textContent = kicker;
  overlayTitle.textContent = title;
  overlayText.textContent = text;
}

function hideOverlay() {
  overlay.hidden = true;
  delete overlay.dataset.tone;
}

function clearDisplay() {
  displayContext.save();
  displayContext.globalAlpha = 1;
  displayContext.globalCompositeOperation = 'source-over';
  displayContext.fillStyle = '#000';
  displayContext.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
  displayContext.restore();
}

function drawFullFrame(sourceCanvas) {
  clearDisplay();
  displayContext.drawImage(
    sourceCanvas,
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height,
    0,
    0,
    displayCanvas.width,
    displayCanvas.height,
  );
}

function drawCrossfade(outgoingCanvas, incomingCanvas, blend) {
  clearDisplay();
  displayContext.globalAlpha = 1;
  displayContext.drawImage(outgoingCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
  displayContext.globalAlpha = blend;
  displayContext.drawImage(incomingCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
  displayContext.globalAlpha = 1;
}

function drawWipe(outgoingCanvas, incomingCanvas, blend, direction) {
  clearDisplay();
  displayContext.drawImage(outgoingCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
  displayContext.save();
  displayContext.beginPath();
  if (direction === 'horizontal') {
    displayContext.rect(0, 0, displayCanvas.width * blend, displayCanvas.height);
  } else {
    displayContext.rect(0, 0, displayCanvas.width, displayCanvas.height * blend);
  }
  displayContext.clip();
  displayContext.drawImage(incomingCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
  displayContext.restore();
}

function drawDissolve(outgoingCanvas, incomingCanvas, blend) {
  clearDisplay();
  displayContext.drawImage(outgoingCanvas, 0, 0, displayCanvas.width, displayCanvas.height);

  const maskData = dissolve.maskImage.data;
  for (let index = 0; index < dissolve.noise.length; index += 1) {
    const channel = index * 4;
    const alpha = dissolve.noise[index] <= blend ? 255 : 0;
    maskData[channel] = 255;
    maskData[channel + 1] = 255;
    maskData[channel + 2] = 255;
    maskData[channel + 3] = alpha;
  }

  dissolve.maskContext.putImageData(dissolve.maskImage, 0, 0);

  dissolve.workContext.save();
  dissolve.workContext.globalCompositeOperation = 'source-over';
  dissolve.workContext.clearRect(0, 0, dissolve.workCanvas.width, dissolve.workCanvas.height);
  dissolve.workContext.drawImage(
    incomingCanvas,
    0,
    0,
    incomingCanvas.width,
    incomingCanvas.height,
    0,
    0,
    dissolve.workCanvas.width,
    dissolve.workCanvas.height,
  );
  dissolve.workContext.globalCompositeOperation = 'destination-in';
  dissolve.workContext.drawImage(
    dissolve.maskCanvas,
    0,
    0,
    dissolve.maskCanvas.width,
    dissolve.maskCanvas.height,
    0,
    0,
    dissolve.workCanvas.width,
    dissolve.workCanvas.height,
  );
  dissolve.workContext.restore();

  displayContext.drawImage(
    dissolve.workCanvas,
    0,
    0,
    dissolve.workCanvas.width,
    dissolve.workCanvas.height,
    0,
    0,
    displayCanvas.width,
    displayCanvas.height,
  );
}

function compositeTransition(kind, blend, outgoingCanvas, incomingCanvas) {
  switch (kind) {
    case 'cut':
      drawFullFrame(incomingCanvas);
      break;
    case 'wipe_left':
      drawWipe(outgoingCanvas, incomingCanvas, blend, 'horizontal');
      break;
    case 'wipe_down':
      drawWipe(outgoingCanvas, incomingCanvas, blend, 'vertical');
      break;
    case 'dissolve':
      drawDissolve(outgoingCanvas, incomingCanvas, blend);
      break;
    case 'crossfade':
    default:
      drawCrossfade(outgoingCanvas, incomingCanvas, blend);
      break;
  }
}

function stopLoop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function activeSlot() {
  return slots[state.currentSlotKey];
}

function inactiveSlotKey() {
  return state.currentSlotKey === 'a' ? 'b' : 'a';
}

function resetPlaybackState() {
  stopLoop();
  state.repo = null;
  state.schedule = [];
  state.currentIndex = 0;
  state.currentSlotKey = 'a';
  state.slideStartedAtMs = 0;
  state.transition = null;
  state.preload = null;
  state.bundleCache.clear();
  slots.a.teardown();
  slots.b.teardown();
  clearDisplay();
}

async function ensureRuntime() {
  if (!runtimeModulePromise) {
    runtimeModulePromise = (async () => {
      const runtime = await import('./pkg/vzglyd_web.js');
      await runtime.default();
      WebHostCtor = runtime.WebHost;
    })();
  }

  await runtimeModulePromise;
}

async function fetchBundleCached(entry) {
  const cacheKey = entry.path;
  let bundlePromise = state.bundleCache.get(cacheKey);
  if (!bundlePromise) {
    bundlePromise = fetchBundleFromRepo(state.repo.repoBaseUrl, entry.path).catch((error) => {
      state.bundleCache.delete(cacheKey);
      throw error;
    });
    state.bundleCache.set(cacheKey, bundlePromise);
  }

  return bundlePromise;
}

function beginPreload(entryIndex) {
  if (state.schedule.length <= 1) {
    state.preload = null;
    return;
  }

  const slotKey = inactiveSlotKey();
  const preload = {
    entryIndex,
    slotKey,
    ready: false,
    error: null,
    promise: null,
  };

  state.preload = preload;
  preload.promise = (async () => {
    const entry = state.schedule[entryIndex];
    const bundle = await fetchBundleCached(entry);
    await slots[slotKey].load(entry, bundle);
    if (state.preload !== preload) {
      return;
    }
    preload.ready = true;
  })().catch((error) => {
    if (state.preload !== preload) {
      return;
    }
    preload.error = error;
    console.error('[vzglyd] preload failed', error);
  });
}

function failPlayback(error) {
  console.error('[vzglyd] playback error', error);
  setOverlay(
    'Browser player',
    'Playback error',
    error instanceof Error ? error.message : String(error),
    'error',
  );
  stopLoop();
}

function finishTransition(timestampMs) {
  if (!state.transition) {
    return;
  }

  state.currentIndex = state.transition.incomingIndex;
  state.currentSlotKey = state.transition.incomingSlotKey;
  state.slideStartedAtMs = timestampMs;
  state.transition = null;

  if (state.schedule.length > 1) {
    beginPreload(nextScheduleIndex(state.currentIndex, state.schedule.length));
  }
}

function maybeStartTransition(timestampMs) {
  if (state.transition || state.schedule.length <= 1) {
    return;
  }

  const currentEntry = state.schedule[state.currentIndex];
  const elapsedMs = timestampMs - state.slideStartedAtMs;
  if (elapsedMs < currentEntry.durationSeconds * 1000) {
    return;
  }

  const incomingIndex = nextScheduleIndex(state.currentIndex, state.schedule.length);
  if (!state.preload || state.preload.entryIndex !== incomingIndex) {
    beginPreload(incomingIndex);
    return;
  }

  if (state.preload.error) {
    throw state.preload.error;
  }

  if (!state.preload.ready) {
    return;
  }

  const incomingEntry = state.schedule[incomingIndex];
  const kind = resolveTransitionKind(currentEntry, incomingEntry, DEFAULT_TRANSITION);

  if (kind === 'cut') {
    state.currentIndex = incomingIndex;
    state.currentSlotKey = state.preload.slotKey;
    state.slideStartedAtMs = timestampMs;
    state.preload = null;
    beginPreload(nextScheduleIndex(state.currentIndex, state.schedule.length));
    return;
  }

  state.transition = {
    outgoingSlotKey: state.currentSlotKey,
    incomingSlotKey: state.preload.slotKey,
    incomingIndex,
    kind,
    startedAtMs: timestampMs,
  };
  state.preload = null;
}

function tick(timestampMs) {
  try {
    if (state.transition) {
      const outgoingSlot = slots[state.transition.outgoingSlotKey];
      const incomingSlot = slots[state.transition.incomingSlotKey];

      outgoingSlot.frame(timestampMs);
      incomingSlot.frame(timestampMs);

      const progress = Math.min(
        1,
        Math.max(0, (timestampMs - state.transition.startedAtMs) / TRANSITION_DURATION_MS),
      );
      compositeTransition(
        state.transition.kind,
        smoothstep(progress),
        outgoingSlot.canvas,
        incomingSlot.canvas,
      );

      if (progress >= 1) {
        finishTransition(timestampMs);
      }
    } else {
      const slot = activeSlot();
      slot.frame(timestampMs);
      drawFullFrame(slot.canvas);
      maybeStartTransition(timestampMs);
    }
  } catch (error) {
    failPlayback(error);
    return;
  }

  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  stopLoop();
  rafId = requestAnimationFrame(tick);
}

async function bootPlayer(repoBaseUrl, requestedStartIndex) {
  resetPlaybackState();
  setOverlay('Browser player', 'Loading player', 'Fetching playlist.json...', 'info');

  try {
    await ensureRuntime();
    const repo = await loadPlaylistFromRepo(repoBaseUrl);
    const schedule = buildPlayableSchedule(repo.playlist);
    if (schedule.length === 0) {
      throw new Error('playlist.json does not contain any enabled slides');
    }

    state.repo = repo;
    state.schedule = schedule;
    state.currentIndex = normalizeStartIndex(requestedStartIndex, schedule.length);
    state.currentSlotKey = 'a';

    try {
      window.localStorage.setItem(REPO_STORAGE_KEY, repo.repoBaseUrl);
    } catch {
      // Ignore storage failures in private or locked-down browser contexts.
    }

    const currentEntry = schedule[state.currentIndex];
    const currentBundle = await fetchBundleCached(currentEntry);
    await slots.a.load(currentEntry, currentBundle);

    const now = performance.now();
    slots.a.frame(now);
    drawFullFrame(slots.a.canvas);
    state.slideStartedAtMs = now;

    if (schedule.length > 1) {
      beginPreload(nextScheduleIndex(state.currentIndex, schedule.length));
    }

    hideOverlay();
    startLoop();
  } catch (error) {
    failPlayback(error);
  }
}

function boot() {
  const url = new URL(window.location.href);
  let savedRepo = null;
  try {
    savedRepo = window.localStorage.getItem(REPO_STORAGE_KEY);
  } catch {
    savedRepo = null;
  }
  const repo = url.searchParams.get('repo') ?? savedRepo;
  const startIndex = url.searchParams.get('slide');

  if (!repo) {
    setOverlay(
      'Browser player',
      'Missing repo',
      'Open this page with ?repo=<slide-root-url> or load a repo in the editor first.',
      'warning',
    );
    return;
  }

  void bootPlayer(repo, startIndex);
}

boot();
