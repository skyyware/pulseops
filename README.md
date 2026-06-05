# PulseOps

PulseOps is a local-first incident command workspace for engineering teams that need a small, reliable place to triage service health, runbook progress and operational decisions.

It is intentionally useful without a backend: the workspace persists in browser storage, can be exported as JSON, imported again, and deployed as a static application. The health model is a real C++ module compiled to WebAssembly and used by the React interface at runtime.

## Product workflow

PulseOps supports the core loop of incident response:

1. Review active incidents, severity, owner, SLA pressure and next action.
2. Inspect the affected service and adjust current operational signals.
3. Let the C++/WASM health model calculate service score, status and risk.
4. Work through the relevant runbook and record decisions in the timeline.
5. Save the local workspace or export/import it as JSON for handoff.

The app is designed as a real operations surface, not as a marketing demo. Every visible control changes application state: navigation, service selection, signal editing, runbook step completion, incident acknowledgement/resolution, decision notes, reset, save, import and export.

## Architecture

```text
src/
  components/       Product UI: shell, board, inspector, runbook panel
  data/             Seed workspace, services, incidents, runbooks, timeline
  hooks/            WebAssembly loading
  lib/              Scoring, workspace reducer, persistence, time helpers
  wasm/             C++ health model and TypeScript declaration
```

Key decisions:

- Local-first state is owned by `workspaceReducer` in `src/lib/workspace.ts`.
- Persisted state is schema-versioned as `pulseops.workspace.v1`.
- Export/import uses the same workspace shape, so a triage session can be handed off as JSON.
- Service health is derived, not stored, by combining service signals with the WASM model.
- UI components stay focused: the app shell, board, service inspector and runbook panel have separate ownership.

## What is worth reviewing

- `src/wasm/health.cpp`: C++17 health scoring compiled through Emscripten.
- `src/lib/workspace.ts`: reducer-driven application state, persistence and import/export.
- `src/lib/workspace.test.ts`: incident, signal and runbook state tests.
- `src/components/WorkspaceBoard.tsx`: real navigation between incident, service, runbook and audit surfaces.
- `src/components/RunbookPanel.tsx`: acknowledge/resolve flow, runbook completion and decision notes.

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

Run the full quality check:

```bash
npm run check
```

`npm run check` compiles the C++ module, type-checks the React application, creates the production build and runs the unit tests.

## Deployment

The production build is static:

```bash
npm run build
```

The current stage target is:

```text
https://pulseops.stage.dev
```

See `docs/deployment.md` for the Git based stage deployment.

## Stack

- C++17 compiled via Emscripten
- WebAssembly
- React 19
- TypeScript 6
- Vite 8
- Vitest
- LocalStorage with schema-versioned workspace state
- Static Linux / Apache stage hosting
