import type { PulseOpsWasmModule } from "../wasm/health";
import type { ScoredService, ServiceMetrics, ServiceStatus } from "../types";

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  healthy: "Healthy",
  watch: "Watch",
  incident: "Incident"
};

const STATUS_ACTION: Record<ServiceStatus, string> = {
  healthy: "Keep baseline and continue normal observation.",
  watch: "Review traces, compare recent deploys and watch saturation.",
  incident: "Open incident lane, inspect packet loss and prepare rollback."
};

export function scoreService(service: ServiceMetrics, wasm: PulseOpsWasmModule | null): ScoredService {
  if (!wasm) {
    return {
      ...service,
      score: service.previousScore,
      risk: 0,
      incidentLevel: 0,
      status: "healthy",
      action: "Loading C++ health model..."
    };
  }

  const score = wasm._score_service(
    service.latencyMs,
    service.errorRate,
    service.cpuPercent,
    service.memoryPercent,
    service.packetLossPercent,
    service.staleMinutes
  );

  const incidentLevel = wasm._incident_level(
    service.latencyMs,
    service.errorRate,
    service.cpuPercent,
    service.memoryPercent,
    service.packetLossPercent,
    service.staleMinutes
  );

  const risk = wasm._risk_index(score, service.previousScore, service.incidents24h, service.deployAgeHours);
  const status: ServiceStatus = incidentLevel === 2 ? "incident" : incidentLevel === 1 ? "watch" : "healthy";

  return {
    ...service,
    score,
    risk,
    incidentLevel,
    status,
    action: STATUS_ACTION[status]
  };
}

export function getFleetScore(services: ScoredService[]) {
  if (services.length === 0) {
    return 0;
  }

  return Math.round(services.reduce((sum, service) => sum + service.score, 0) / services.length);
}
