import { useEffect, useState } from "react";
import createPulseOpsWasm from "../wasm/health.js";
import type { PulseOpsWasmModule } from "../wasm/health";

export type WasmLoadState = "loading" | "ready" | "failed";

export function usePulseOpsWasm() {
  const [wasm, setWasm] = useState<PulseOpsWasmModule | null>(null);
  const [state, setState] = useState<WasmLoadState>("loading");

  useEffect(() => {
    let mounted = true;

    createPulseOpsWasm()
      .then((module) => {
        if (!mounted) {
          return;
        }

        setWasm(module);
        setState("ready");
      })
      .catch((error: unknown) => {
        console.error("Failed to load PulseOps WASM module", error);

        if (mounted) {
          setState("failed");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { wasm, state };
}
