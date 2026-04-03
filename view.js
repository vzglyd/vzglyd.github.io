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

const overlay = document.getElementById('view-overlay');
const overlayKicker = document.getElementById('view-overlay-kicker');
const overlayTitle = document.getElementById('view-overlay-title');
const overlayText = document.getElementById('view-overlay-text');

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
};

const renderSize = computeRenderSize();

class HostSlot {
  constructor(key, canvas, size) {
    this.key = key;
    this.canvas = canvas;
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
  a: new HostSlot('a', document.getElementById('view-canvas-a'), renderSize),
  b: new HostSlot('b', document.getElementById('view-canvas-b'), renderSize),
};

showOnlySlot('a');

function computeRenderSize() {
  const viewportExtent = Math.max(
    1,
    Math.min(window.innerWidth || 1024, window.innerHeight || 1024),
  );
  const scale = Math.max(1, Math.min(window.devicePixelRatio || 1, 1.5));
  const desired = Math.round(viewportExtent * scale);
  return Math.max(MIN_RENDER_SIZE, Math.min(MAX_RENDER_SIZE, desired));
}

function sizeCanvas(canvas, size) {
  canvas.width = size;
  canvas.height = size;
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

function resetLayerStyle(slot) {
  slot.canvas.style.opacity = '0';
  slot.canvas.style.clipPath = 'none';
  slot.canvas.style.visibility = 'hidden';
  slot.canvas.style.zIndex = '0';
}

function showOnlySlot(slotKey) {
  for (const [key, slot] of Object.entries(slots)) {
    resetLayerStyle(slot);
    if (key === slotKey) {
      slot.canvas.style.opacity = '1';
      slot.canvas.style.visibility = 'visible';
      slot.canvas.style.zIndex = '1';
    }
  }
}

function applyTransition(kind, blend, outgoingSlot, incomingSlot) {
  resetLayerStyle(outgoingSlot);
  resetLayerStyle(incomingSlot);

  outgoingSlot.canvas.style.visibility = 'visible';
  outgoingSlot.canvas.style.zIndex = '1';
  incomingSlot.canvas.style.visibility = 'visible';
  incomingSlot.canvas.style.zIndex = '2';

  switch (kind) {
    case 'cut':
      outgoingSlot.canvas.style.opacity = '0';
      incomingSlot.canvas.style.opacity = '1';
      break;
    case 'wipe_left':
      outgoingSlot.canvas.style.opacity = '1';
      incomingSlot.canvas.style.opacity = '1';
      incomingSlot.canvas.style.clipPath = `inset(0 ${Math.max(0, 100 - blend * 100)}% 0 0)`;
      break;
    case 'wipe_down':
      outgoingSlot.canvas.style.opacity = '1';
      incomingSlot.canvas.style.opacity = '1';
      incomingSlot.canvas.style.clipPath = `inset(0 0 ${Math.max(0, 100 - blend * 100)}% 0)`;
      break;
    case 'dissolve':
    case 'crossfade':
    default:
      outgoingSlot.canvas.style.opacity = String(Math.max(0, 1 - blend));
      incomingSlot.canvas.style.opacity = String(blend);
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
  slots.a.teardown();
  slots.b.teardown();
  showOnlySlot('a');
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

async function fetchBundle(entry) {
  return fetchBundleFromRepo(state.repo.repoBaseUrl, entry.path);
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
    const bundle = await fetchBundle(entry);
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
  showOnlySlot(state.currentSlotKey);

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
    showOnlySlot(state.currentSlotKey);
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
      applyTransition(
        state.transition.kind,
        smoothstep(progress),
        outgoingSlot,
        incomingSlot,
      );

      if (progress >= 1) {
        finishTransition(timestampMs);
      }
    } else {
      activeSlot().frame(timestampMs);
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
    const currentBundle = await fetchBundle(currentEntry);
    await slots.a.load(currentEntry, currentBundle);

    const now = performance.now();
    slots.a.frame(now);
    state.slideStartedAtMs = now;
    showOnlySlot('a');

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
