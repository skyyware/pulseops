# PulseOps

PulseOps is a compact proof application for a C++ / JavaScript / React project context. It is a small monitoring cockpit that turns microservice signals into health scores, incident levels and recommended next actions.

## What is worth reviewing

- A real C++ scoring module in `src/wasm/health.cpp`, compiled to WebAssembly with Emscripten.
- A React 19 + TypeScript UI with isolated domain logic, hooks and focused components.
- Interactive monitoring inputs for latency, error rate, CPU, memory, packet loss and stale data.
- Operational vocabulary that fits client-server monitoring, microservices, Linux and network troubleshooting.
- Static production output that can be deployed cleanly to Apache, Nginx or any CDN.

## Local setup

Install the local toolchain:

```bash
brew install node emscripten python@3.12
```

Install packages and run the app:

```bash
npm install
npm run dev
```

Run a production build:

```bash
npm run check
```

`npm run check` compiles the C++ module, type-checks the React application, creates the production build and runs the unit tests for the scoring domain.

The `build:wasm` script is intentionally implemented in Node instead of as a hardcoded shell one-liner. It works with Homebrew Emscripten on macOS and falls back to `emcc` on Linux.

## Deployment

The build result is static:

```bash
npm run build
```

The current stage target is:

```text
/srv/www/pulseops.stage.dev/current/public
```

See `docs/deployment.md` for the Git based stage deployment.

## Stack

- C++ compiled via Emscripten
- WebAssembly
- React 19
- TypeScript / JavaScript
- Vite
- Linux / Apache stage hosting
