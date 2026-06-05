import { describe, expect, it } from "vitest";
import { getFleetScore, scoreService } from "./scoring";
import type { PulseOpsWasmModule } from "../wasm/health";
import type { ServiceMetrics } from "../types";

const service: ServiceMetrics = {
  id: "collector-api",
  name: "Collector API",
  owner: "Monitoring Core",
  role: "C++ backend collector",
  latencyMs: 188,
  errorRate: 1.8,
  cpuPercent: 61,
  memoryPercent: 66,
  packetLossPercent: 0.5,
  staleMinutes: 1,
  previousScore: 91,
  incidents24h: 0,
  deployAgeHours: 38
};

describe("scoreService", () => {
  it("uses the WASM model output to derive service state", () => {
    const wasm: PulseOpsWasmModule = {
      _score_service: () => 54,
      _incident_level: () => 2,
      _risk_index: () => 73
    };

    expect(scoreService(service, wasm)).toMatchObject({
      score: 54,
      risk: 73,
      incidentLevel: 2,
      status: "incident",
      action: "Open incident lane, inspect packet loss and prepare rollback."
    });
  });

  it("falls back to the previous score while the model loads", () => {
    expect(scoreService(service, null)).toMatchObject({
      score: 91,
      risk: 0,
      status: "healthy",
      action: "Loading C++ health model..."
    });
  });
});

describe("getFleetScore", () => {
  it("averages service scores into a rounded fleet score", () => {
    expect(getFleetScore([
      { ...service, score: 90, risk: 0, incidentLevel: 0, status: "healthy", action: "" },
      { ...service, id: "event-bus", score: 73, risk: 0, incidentLevel: 1, status: "watch", action: "" }
    ])).toBe(82);
  });
});
