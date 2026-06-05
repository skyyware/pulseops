export type ServiceStatus = "healthy" | "watch" | "incident";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "acknowledged" | "resolved";
export type WorkspaceView = "dashboard" | "incidents" | "services" | "runbooks" | "audit";

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

export interface Incident {
  id: string;
  serviceId: string;
  title: string;
  summary: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  owner: string;
  openedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  slaMinutes: number;
  nextAction: string;
}

export interface RunbookStep {
  id: string;
  label: string;
  detail: string;
  done: boolean;
}

export interface Runbook {
  id: string;
  serviceId: string;
  title: string;
  trigger: string;
  updatedAt: string;
  steps: RunbookStep[];
}

export interface TimelineEvent {
  id: string;
  at: string;
  actor: string;
  title: string;
  detail: string;
  serviceId?: string;
  incidentId?: string;
}

export interface WorkspaceState {
  schemaVersion: 1;
  view: WorkspaceView;
  environment: "production" | "staging";
  workspaceName: string;
  selectedServiceId: string;
  selectedIncidentId: string;
  services: ServiceMetrics[];
  incidents: Incident[];
  runbooks: Runbook[];
  timeline: TimelineEvent[];
  lastSavedAt?: string;
}
