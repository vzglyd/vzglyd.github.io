/* @ts-self-types="./vzglyd_web.d.ts" */
import { JsEngineBridge } from '../js/slide_runtime.js';

/**
 * Browser host entry point exported to JavaScript.
 */
export class WebHost {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WebHostFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_webhost_free(ptr, 0);
    }
    /**
     * Download the current trace snapshot as a Perfetto JSON artifact.
     * @param {string | null} [filename]
     * @returns {boolean}
     */
    downloadTrace(filename) {
        var ptr0 = isLikeNone(filename) ? 0 : passStringToWasm0(filename, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.webhost_downloadTrace(this.__wbg_ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
     * Export the current trace snapshot as a JS object.
     * @returns {any}
     */
    exportTrace() {
        const ret = wasm.webhost_exportTrace(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Advance one frame.
     * @param {number} timestamp_ms
     */
    frame(timestamp_ms) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.webhost_frame(retptr, this.__wbg_ptr, timestamp_ms);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Load a `.vzglyd` bundle from bytes.
     * @param {Uint8Array} bytes
     * @param {any | null} [runtime_options]
     * @returns {Promise<void>}
     */
    loadBundle(bytes, runtime_options) {
        const ret = wasm.webhost_loadBundle(this.__wbg_ptr, addHeapObject(bytes), isLikeNone(runtime_options) ? 0 : addHeapObject(runtime_options));
        return takeObject(ret);
    }
    /**
     * Backward-compatible alias used by older page shells.
     * @param {Uint8Array} bytes
     * @param {any | null} [runtime_options]
     * @returns {Promise<void>}
     */
    loadSlide(bytes, runtime_options) {
        const ret = wasm.webhost_loadSlide(this.__wbg_ptr, addHeapObject(bytes), isLikeNone(runtime_options) ? 0 : addHeapObject(runtime_options));
        return takeObject(ret);
    }
    /**
     * Create a new host bound to a canvas.
     *
     * `host_config` is an optional JS object consumed by the JS bridge.
     * @param {HTMLCanvasElement} canvas
     * @param {any | null} [host_config]
     */
    constructor(canvas, host_config) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.webhost_new(retptr, addHeapObject(canvas), isLikeNone(host_config) ? 0 : addHeapObject(host_config));
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
            if (r2) {
                throw takeObject(r1);
            }
            this.__wbg_ptr = r0 >>> 0;
            WebHostFinalization.register(this, this.__wbg_ptr, this);
            return this;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
     * Configure the screensaver / burn-in protection.
     *
     * `timeout_secs` — display seconds before the screensaver activates.
     * `duration_secs` — how long the screensaver runs before the playlist resumes.
     * Call with `timeout_secs = 0.0` to disable.
     * @param {number} timeout_secs
     * @param {number} duration_secs
     */
    setScreensaverConfig(timeout_secs, duration_secs) {
        wasm.webhost_setScreensaverConfig(this.__wbg_ptr, timeout_secs, duration_secs);
    }
    /**
     * Start capturing a browser trace in memory.
     * @param {any | null} [extra_metadata]
     * @returns {boolean}
     */
    startTraceCapture(extra_metadata) {
        const ret = wasm.webhost_startTraceCapture(this.__wbg_ptr, isLikeNone(extra_metadata) ? 0 : addHeapObject(extra_metadata));
        return ret !== 0;
    }
    /**
     * Snapshot host/runtime stats as a JS object.
     * @returns {any}
     */
    stats() {
        const ret = wasm.webhost_stats(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
     * Stop the active browser trace capture.
     * @param {any | null} [extra_metadata]
     * @returns {boolean}
     */
    stopTraceCapture(extra_metadata) {
        const ret = wasm.webhost_stopTraceCapture(this.__wbg_ptr, isLikeNone(extra_metadata) ? 0 : addHeapObject(extra_metadata));
        return ret !== 0;
    }
    /**
     * Dispose runtime resources.
     */
    teardown() {
        wasm.webhost_teardown(this.__wbg_ptr);
    }
}
if (Symbol.dispose) WebHost.prototype[Symbol.dispose] = WebHost.prototype.free;

/**
 * Encode a compiled scene mesh as a MeshAsset for the slide spec.
 * @param {string} mesh_json
 * @returns {any}
 */
export function encodeMeshAsset(mesh_json) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(mesh_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.encodeMeshAsset(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Encode scene anchors as a SceneAnchorSet.
 * @param {string} scene_json
 * @returns {any}
 */
export function encodeSceneAnchorSet(scene_json) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(scene_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.encodeSceneAnchorSet(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Hydrate a playlist entry against its manifest and playlist defaults.
 *
 * All three arguments are JSON strings matching the Rust types:
 * - `entry_json`: serialized [`PlaylistEntry`]
 * - `manifest_json`: optional serialized [`SlideManifest`] (pass `undefined`/`null` if unavailable)
 * - `defaults_json`: serialized [`PlaylistDefaults`]
 *
 * Returns a serialized [`HydratedPlaylistEntry`] as a JS object, or throws on parse error.
 * @param {string} entry_json
 * @param {string | null | undefined} manifest_json
 * @param {string} defaults_json
 * @returns {any}
 */
export function hydratePlaylistEntry(entry_json, manifest_json, defaults_json) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(entry_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(manifest_json) ? 0 : passStringToWasm0(manifest_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(defaults_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len2 = WASM_VECTOR_LEN;
        wasm.hydratePlaylistEntry(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

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
 * @param {Uint8Array} glb_bytes
 * @param {string} scene_path
 * @param {string | null} [scene_ref_json]
 * @returns {any}
 */
export function loadGlbScene(glb_bytes, scene_path, scene_ref_json) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(glb_bytes, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(scene_path, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(scene_ref_json) ? 0 : passStringToWasm0(scene_ref_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        var len2 = WASM_VECTOR_LEN;
        wasm.loadGlbScene(retptr, ptr0, len0, ptr1, len1, ptr2, len2);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * wasm entry hook.
 */
export function main() {
    wasm.main();
}

/**
 * Maximum display duration exposed to JS so it isn't hardcoded in multiple places.
 * @returns {number}
 */
export function maxDisplayDurationSeconds() {
    const ret = wasm.maxDisplayDurationSeconds();
    return ret >>> 0;
}

/**
 * Minimum display duration exposed to JS so it isn't hardcoded in multiple places.
 * @returns {number}
 */
export function minDisplayDurationSeconds() {
    const ret = wasm.minDisplayDurationSeconds();
    return ret >>> 0;
}

/**
 * Parse a `secrets.json` string and return an object containing only the key names.
 *
 * Values are never exposed to the browser. Returns `{ keys: string[] }`.
 * @param {string} json
 * @returns {any}
 */
export function parseSecretsJson(json) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        wasm.parseSecretsJson(retptr, ptr0, len0);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * Validate playlist entry params against a manifest's param schema.
 *
 * - `params_json`: serialized `serde_json::Value` (the params object), or `"null"`
 * - `schema_json`: serialized [`ManifestParamsSchema`]
 *
 * Returns an array of error strings (empty = valid). Throws on parse error.
 * @param {string} params_json
 * @param {string} schema_json
 * @returns {any}
 */
export function validateEntryParams(params_json, schema_json) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(params_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(schema_json, wasm.__wbindgen_export, wasm.__wbindgen_export2);
        const len1 = WASM_VECTOR_LEN;
        wasm.validateEntryParams(retptr, ptr0, len0, ptr1, len1);
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        if (r2) {
            throw takeObject(r1);
        }
        return takeObject(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_is_function_49868bde5eb1e745: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_undefined_c0cca72b82b86f4d: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_number_get_7579aab02a8a620c: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_914df97fcfa788f2: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_81fc77679af83bc6: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_3c3b4f651835fbcb: function(arg0) {
            getObject(arg0)._wbg_cb_unref();
        },
        __wbg_applyHudGeometry_555598ce1afe4c61: function(arg0, arg1, arg2) {
            getObject(arg0).applyHudGeometry(takeObject(arg1), takeObject(arg2));
        },
        __wbg_call_d578befcc3145dee: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_debug_58754cc8dbfec7ec: function(arg0, arg1, arg2, arg3) {
            console.debug(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));
        },
        __wbg_downloadTrace_2131658def111971: function(arg0, arg1) {
            const ret = getObject(arg0).downloadTrace(takeObject(arg1));
            return ret;
        },
        __wbg_error_38bec0a78dd8ded8: function(arg0) {
            console.error(getObject(arg0));
        },
        __wbg_error_a6fa202b58aa1cd3: function(arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_export4(deferred0_0, deferred0_1, 1);
            }
        },
        __wbg_error_f8d1622cb1d8c53c: function(arg0, arg1, arg2, arg3) {
            console.error(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));
        },
        __wbg_exportTrace_ac4ab912616e7c10: function(arg0) {
            const ret = getObject(arg0).exportTrace();
            return addHeapObject(ret);
        },
        __wbg_frame_21e2ba12b4761677: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).frame(arg1);
            return addHeapObject(ret);
        }, arguments); },
        __wbg_getHours_81348c8e800060e7: function(arg0) {
            const ret = getObject(arg0).getHours();
            return ret;
        },
        __wbg_getLastUpdatedText_dd371ac30298f528: function(arg0) {
            const ret = getObject(arg0).getLastUpdatedText();
            return addHeapObject(ret);
        },
        __wbg_getMinutes_bd1ccf17dab913bf: function(arg0) {
            const ret = getObject(arg0).getMinutes();
            return ret;
        },
        __wbg_getSeconds_edef7266627a185f: function(arg0) {
            const ret = getObject(arg0).getSeconds();
            return ret;
        },
        __wbg_getSlideName_0fce536ae3a74442: function(arg0) {
            const ret = getObject(arg0).getSlideName();
            return addHeapObject(ret);
        },
        __wbg_getSurfaceSize_477dc36c0f0f1b87: function(arg0) {
            const ret = getObject(arg0).getSurfaceSize();
            return addHeapObject(ret);
        },
        __wbg_get_f96702c6245e4ef9: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_info_8e80eb6c0f1d9449: function(arg0, arg1, arg2, arg3) {
            console.info(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));
        },
        __wbg_initHud_286f3f1f8d6ee24a: function(arg0, arg1, arg2, arg3) {
            getObject(arg0).initHud(takeObject(arg1), arg2 >>> 0, arg3 >>> 0);
        },
        __wbg_loadBundle_3f7e2f186d174c85: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).loadBundle(takeObject(arg1), takeObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_log_dafe9ed5100e3a8c: function(arg0, arg1, arg2, arg3) {
            console.log(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));
        },
        __wbg_new_015431d6476bddc0: function(arg0, arg1) {
            const ret = new JsEngineBridge(takeObject(arg0), takeObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_new_0_bfa2ef4bc447daa2: function() {
            const ret = new Date();
            return addHeapObject(ret);
        },
        __wbg_new_227d7c05414eb861: function() {
            const ret = new Error();
            return addHeapObject(ret);
        },
        __wbg_new_from_slice_2580ff33d0d10520: function(arg0, arg1) {
            const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_new_typed_14d7cc391ce53d2c: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return __wasm_bindgen_func_elem_3428(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return addHeapObject(ret);
            } finally {
                state0.a = 0;
            }
        },
        __wbg_parse_545d11396395fbbd: function() { return handleError(function (arg0, arg1) {
            const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_queueMicrotask_abaf92f0bd4e80a4: function(arg0) {
            const ret = getObject(arg0).queueMicrotask;
            return addHeapObject(ret);
        },
        __wbg_queueMicrotask_df5a6dac26d818f3: function(arg0) {
            queueMicrotask(getObject(arg0));
        },
        __wbg_resolve_0a79de24e9d2267b: function(arg0) {
            const ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_stack_3b0d974bbf31e44f: function(arg0, arg1) {
            const ret = getObject(arg1).stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_startTraceCapture_1e807a977b8d036f: function(arg0, arg1) {
            const ret = getObject(arg0).startTraceCapture(takeObject(arg1));
            return ret;
        },
        __wbg_static_accessor_GLOBAL_THIS_a1248013d790bf5f: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_GLOBAL_f2e0f995a21329ff: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_SELF_24f78b6d23f286ea: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_WINDOW_59fd959c540fe405: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_stats_f0f4abe8a42741bf: function(arg0) {
            const ret = getObject(arg0).stats();
            return addHeapObject(ret);
        },
        __wbg_stopTraceCapture_d90460b70c350b38: function(arg0, arg1) {
            const ret = getObject(arg0).stopTraceCapture(takeObject(arg1));
            return ret;
        },
        __wbg_teardown_7e750adcfc24c976: function(arg0) {
            getObject(arg0).teardown();
        },
        __wbg_then_00eed3ac0b8e82cb: function(arg0, arg1, arg2) {
            const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_then_a0c8db0381c8994c: function(arg0, arg1) {
            const ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_warn_b5013c1036317367: function(arg0, arg1, arg2, arg3) {
            console.warn(getObject(arg0), getObject(arg1), getObject(arg2), getObject(arg3));
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 320, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, __wasm_bindgen_func_elem_3421);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./vzglyd_web_bg.js": import0,
    };
}

function __wasm_bindgen_func_elem_3421(arg0, arg1, arg2) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        wasm.__wasm_bindgen_func_elem_3421(retptr, arg0, arg1, addHeapObject(arg2));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        if (r1) {
            throw takeObject(r0);
        }
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function __wasm_bindgen_func_elem_3428(arg0, arg1, arg2, arg3) {
    wasm.__wasm_bindgen_func_elem_3428(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const WebHostFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_webhost_free(ptr >>> 0, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => wasm.__wbindgen_export5(state.a, state.b));

function dropObject(idx) {
    if (idx < 1028) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, f) {
    const state = { a: arg0, b: arg1, cnt: 1 };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_export5(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('vzglyd_web_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
