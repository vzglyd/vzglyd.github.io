/* tslint:disable */
/* eslint-disable */

/**
 * Web host that implements the kernel Host trait.
 */
export class WebHost {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Updates the engine for a new frame.
     */
    frame(timestamp: number): void;
    /**
     * Loads a .vzglyd slide bundle.
     */
    load_slide(bytes: Uint8Array): void;
    /**
     * Creates a new web host.
     */
    constructor(canvas: HTMLCanvasElement, device: any);
}

/**
 * Initializes the web host and starts the render loop.
 */
export function main(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_webhost_free: (a: number, b: number) => void;
    readonly main: () => void;
    readonly webhost_frame: (a: number, b: number) => [number, number];
    readonly webhost_load_slide: (a: number, b: any) => [number, number];
    readonly webhost_new: (a: any, b: any) => [number, number, number];
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
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
