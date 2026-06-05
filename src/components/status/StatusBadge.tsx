import type { IncidentStatus, ServiceStatus } from "../../types";

type BadgeStatus = ServiceStatus | IncidentStatus | "critical" | "high" | "medium" | "low";

const label: Record<BadgeStatus, string> = {
  healthy: "Healthy",
  watch: "Watch",
  incident: "Incident",
  open: "Open",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return <span className={`status-badge ${status}`}>{label[status]}</span>;
}
