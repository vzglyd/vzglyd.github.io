/* tslint:disable */
/* eslint-disable */

/**
 * Browser host entry point exported to JavaScript.
 */
export class WebHost {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Download the current trace snapshot as a Perfetto JSON artifact.
     */
    downloadTrace(filename?: string | null): boolean;
    /**
     * Export the current trace snapshot as a JS object.
     */
    exportTrace(): any;
    /**
     * Advance one frame.
     */
    frame(timestamp_ms: number): void;
    /**
     * Load a `.vzglyd` bundle from bytes.
     */
    loadBundle(bytes: Uint8Array, runtime_options?: any | null): Promise<void>;
    /**
     * Backward-compatible alias used by older page shells.
     */
    loadSlide(bytes: Uint8Array, runtime_options?: any | null): Promise<void>;
    /**
     * Create a new host bound to a canvas.
     *
     * `host_config` is an optional JS object consumed by the JS bridge.
     */
    constructor(canvas: HTMLCanvasElement, host_config?: any | null);
    /**
     * Configure the screensaver / burn-in protection.
     *
     * `timeout_secs` — display seconds before the screensaver activates.
     * `duration_secs` — how long the screensaver runs before the playlist resumes.
     * Call with `timeout_secs = 0.0` to disable.
     */
    setScreensaverConfig(timeout_secs: number, duration_secs: number): void;
    /**
     * Start capturing a browser trace in memory.
     */
    startTraceCapture(extra_metadata?: any | null): boolean;
    /**
     * Snapshot host/runtime stats as a JS object.
     */
    stats(): any;
    /**
     * Stop the active browser trace capture.
     */
    stopTraceCapture(extra_metadata?: any | null): boolean;
    /**
     * Dispose runtime resources.
     */
    teardown(): void;
}

/**
 * Encode a compiled scene mesh as a MeshAsset for the slide spec.
 */
export function encodeMeshAsset(mesh_json: string): any;

/**
 * Encode scene anchors as a SceneAnchorSet.
 */
export function encodeSceneAnchorSet(scene_json: string): any;

/**
 * Hydrate a playlist entry against its manifest and playlist defaults.
 *
 * All three arguments are JSON strings matching the Rust types:
 * - `entry_json`: serialized [`PlaylistEntry`]
 * - `manifest_json`: optional serialized [`SlideManifest`] (pass `undefined`/`null` if unavailable)
 * - `defaults_json`: serialized [`PlaylistDefaults`]
 *
 * Returns a serialized [`HydratedPlaylistEntry`] as a JS object, or throws on parse error.
 */
export function hydratePlaylistEntry(entry_json: string, manifest_json: string | null | undefined, defaults_json: string): any;

/**
 * Load and compile a GLB scene from bytes.
 *
 * # Arguments
 * * `glb_bytes` - The raw GLB file bytes
 * * `scene_path` - Path to the GLB file (for error messages)
 * * `scene_ref_json` - Optional JSON string with scene asset reference {path, id, label, entryCamera, compileProfile}
 *
 * # Returns
 * * `Ok(JsValue)` with the compiled scene as JSON
 * * `Err(JsValue)` if loading or compilation fails
 */
export function loadGlbScene(glb_bytes: Uint8Array, scene_path: string, scene_ref_json?: string | null): any;

/**
 * wasm entry hook.
 */
export function main(): void;

/**
 * Maximum display duration exposed to JS so it isn't hardcoded in multiple places.
 */
export function maxDisplayDurationSeconds(): number;

/**
 * Minimum display duration exposed to JS so it isn't hardcoded in multiple places.
 */
export function minDisplayDurationSeconds(): number;

/**
 * Parse a `secrets.json` string and return an object containing only the key names.
 *
 * Values are never exposed to the browser. Returns `{ keys: string[] }`.
 */
export function parseSecretsJson(json: string): any;

/**
 * Validate playlist entry params against a manifest's param schema.
 *
 * - `params_json`: serialized `serde_json::Value` (the params object), or `"null"`
 * - `schema_json`: serialized [`ManifestParamsSchema`]
 *
 * Returns an array of error strings (empty = valid). Throws on parse error.
 */
export function validateEntryParams(params_json: string, schema_json: string): any;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_webhost_free: (a: number, b: number) => void;
    readonly encodeMeshAsset: (a: number, b: number, c: number) => void;
    readonly encodeSceneAnchorSet: (a: number, b: number, c: number) => void;
    readonly hydratePlaylistEntry: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly loadGlbScene: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly main: () => void;
    readonly maxDisplayDurationSeconds: () => number;
    readonly minDisplayDurationSeconds: () => number;
    readonly parseSecretsJson: (a: number, b: number, c: number) => void;
    readonly validateEntryParams: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly webhost_downloadTrace: (a: number, b: number, c: number) => number;
    readonly webhost_exportTrace: (a: number) => number;
    readonly webhost_frame: (a: number, b: number, c: number) => void;
    readonly webhost_loadBundle: (a: number, b: number, c: number) => number;
    readonly webhost_loadSlide: (a: number, b: number, c: number) => number;
    readonly webhost_new: (a: number, b: number, c: number) => void;
    readonly webhost_setScreensaverConfig: (a: number, b: number, c: number) => void;
    readonly webhost_startTraceCapture: (a: number, b: number) => number;
    readonly webhost_stats: (a: number) => number;
    readonly webhost_stopTraceCapture: (a: number, b: number) => number;
    readonly webhost_teardown: (a: number) => void;
    readonly __wasm_bindgen_func_elem_3421: (a: number, b: number, c: number, d: number) => void;
    readonly __wasm_bindgen_func_elem_3428: (a: number, b: number, c: number, d: number) => void;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number) => void;
    readonly __wbindgen_export4: (a: number, b: number, c: number) => void;
    readonly __wbindgen_export5: (a: number, b: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
