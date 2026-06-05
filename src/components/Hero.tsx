import { Activity, GitBranch, RotateCcw } from "lucide-react";
import type { WasmLoadState } from "../hooks/usePulseOpsWasm";

interface HeroProps {
  fleetScore: number;
  incidentCount: number;
  watchCount: number;
  wasmState: WasmLoadState;
  onReset: () => void;
}

function modelStatusLabel(state: WasmLoadState) {
  if (state === "ready") {
    return "C++ model loaded";
  }

  if (state === "failed") {
    return "C++ model unavailable";
  }

  return "Loading model";
}

export function Hero({ fleetScore, incidentCount, watchCount, wasmState, onReset }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="brand-mark">
          <Activity size={22} />
          PulseOps
        </div>
        <h1>Microservice health cockpit powered by React and C++ WebAssembly.</h1>
        <p>
          Tune live service metrics, let the compiled C++ model score operational risk, and turn noisy monitoring signals into a clear action lane.
        </p>
        <div className="hero-actions">
          <button type="button" onClick={onReset}>
            <RotateCcw size={16} />
            Reset sample
          </button>
          <a href="https://github.com/skyyware/pulseops" target="_blank" rel="noreferrer">
            <GitBranch size={16} />
            View repository
          </a>
        </div>
      </div>

      <div className="score-card">
        <span>Fleet health</span>
        <strong>{fleetScore}</strong>
        <div className="score-bar" aria-hidden="true">
          <i style={{ width: `${fleetScore}%` }} />
        </div>
        <p>
          {incidentCount} incidents · {watchCount} services on watch · {modelStatusLabel(wasmState)}
        </p>
      </div>
    </section>
  );
}
