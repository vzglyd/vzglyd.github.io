# VZGLYD Web Host

Browser host and repo tools for shared `.vzglyd` slide repositories.

This repository exports runnable pages from `web-preview/`:
- `index.html` previews bundles from a shared repo or a local `.vzglyd` file
- `editor.html` edits and exports `playlist.json` for a shared repo
- Runtime API remains Rust/WASM (`WebHost`)
- Bundle extraction + WASM/sidecar/renderer bridge lives in `web-preview/js/`

## Build

```bash
# one-time
cargo install wasm-pack

# build wasm glue directly into the preview folder
wasm-pack build --target web --out-dir web-preview/pkg
```

## Run

Serve the repository root over HTTP and open `http://localhost:8080/web-preview/`.

```bash
python3 -m http.server 8080
```

To preview a shared slide repo in the browser, serve that repo separately as well:

```bash
python3 -m http.server 8081 --directory /path/to/slides-repo
```

Then paste `http://localhost:8081/` into the preview/editor UI.

For the local reference repo already used in this workspace, run:

```bash
./serve-reference-slides.sh
```

That serves the shared slides repo at `http://localhost:8081/` by default.

## WebHost API

```js
import init, { WebHost } from './pkg/vzglyd_web.js';

await init();
const host = new WebHost(canvas, { networkPolicy: 'any_https' });

await host.loadBundle(bundleBytes, { logLoadSummary: true });
host.frame(performance.now());
const stats = host.stats();
host.teardown();
```

## Shared Repo Contract

The shared slide source is a user-managed Git repo with:

- required `playlist.json` at repo root
- repo-root-relative `.vzglyd` bundle paths in `playlist.json`

The full contract and example layout live in [`docs/shared-slide-repo.md`](docs/shared-slide-repo.md).

## Notes

- Current browser backend is WebGPU only.
- `.vzglyd` archives are expected to contain `manifest.json` and `slide.wasm`.
- Optional `sidecar.wasm` is loaded when present.
