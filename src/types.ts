export type ServiceStatus = "healthy" | "watch" | "incident";

export interface ServiceMetrics {
  id: string;
  name: string;
  owner: string;
  role: string;
  latencyMs: number;
  errorRate: number;
  cpuPercent: number;
  memoryPercent: number;
  packetLossPercent: number;
  staleMinutes: number;
  previousScore: number;
  incidents24h: number;
  deployAgeHours: number;
}

export interface ScoredService extends ServiceMetrics {
  score: number;
  risk: number;
  incidentLevel: number;
  status: ServiceStatus;
  action: string;
}
