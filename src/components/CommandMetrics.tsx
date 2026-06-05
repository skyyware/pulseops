import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import type { Incident, ScoredService } from "../types";

interface CommandMetricsProps {
  services: ScoredService[];
  incidents: Incident[];
  fleetScore: number;
}

export function CommandMetrics({ services, incidents, fleetScore }: CommandMetricsProps) {
  const activeIncidents = incidents.filter((incident) => incident.status !== "resolved");
  const criticalCount = activeIncidents.filter((incident) => incident.severity === "critical").length;
  const watchServices = services.filter((service) => service.status === "watch").length;
  const healthyServices = services.filter((service) => service.status === "healthy").length;

  return (
    <section className="command-metrics" aria-label="Command summary">
      <article>
        <ShieldAlert />
        <span>Fleet health</span>
        <strong>{fleetScore}</strong>
      </article>
      <article>
        <AlertTriangle />
        <span>Active incidents</span>
        <strong>{activeIncidents.length}</strong>
      </article>
      <article>
        <Clock />
        <span>Critical queue</span>
        <strong>{criticalCount}</strong>
      </article>
      <article>
        <CheckCircle2 />
        <span>Stable services</span>
        <strong>{healthyServices}/{services.length}</strong>
      </article>
      <article>
        <Clock />
        <span>Watch services</span>
        <strong>{watchServices}</strong>
      </article>
    </section>
  );
}
