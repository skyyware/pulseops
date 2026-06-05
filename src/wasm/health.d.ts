export interface PulseOpsWasmModule {
  _score_service(
    latencyMs: number,
    errorRate: number,
    cpuPercent: number,
    memoryPercent: number,
    packetLossPercent: number,
    staleMinutes: number
  ): number;
  _incident_level(
    latencyMs: number,
    errorRate: number,
    cpuPercent: number,
    memoryPercent: number,
    packetLossPercent: number,
    staleMinutes: number
  ): number;
  _risk_index(currentScore: number, previousScore: number, incidents24h: number, deployAgeHours: number): number;
}

export default function createPulseOpsWasm(): Promise<PulseOpsWasmModule>;
