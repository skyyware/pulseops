import { AlertCircle, CheckCircle2, ClipboardList, ServerCog } from "lucide-react";
import type { Incident, Runbook, ScoredService, TimelineEvent, WorkspaceView } from "../types";
import { formatSla, formatTimestamp } from "../lib/time";
import { StatusBadge } from "./status/StatusBadge";

interface WorkspaceBoardProps {
  view: WorkspaceView;
  incidents: Incident[];
  services: ScoredService[];
  runbooks: Runbook[];
  timeline: TimelineEvent[];
  selectedIncidentId: string;
  selectedServiceId: string;
  onIncidentSelect: (id: string) => void;
  onServiceSelect: (id: string) => void;
}

export function WorkspaceBoard({
  view,
  incidents,
  services,
  runbooks,
  timeline,
  selectedIncidentId,
  selectedServiceId,
  onIncidentSelect,
  onServiceSelect
}: WorkspaceBoardProps) {
  if (view === "services") {
    return (
      <section className="board-panel">
        <PanelHeader icon={<ServerCog />} title="Service catalog" meta={`${services.length} services`} />
        <div className="service-table">
          {services.map((service) => (
            <button
              type="button"
              key={service.id}
              className={service.id === selectedServiceId ? "selected" : ""}
              onClick={() => onServiceSelect(service.id)}
            >
              <span>
                <strong>{service.name}</strong>
                <small>{service.owner} · {service.role}</small>
              </span>
              <StatusBadge status={service.status} />
              <b>{Math.round(service.score)}</b>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (view === "runbooks") {
    return (
      <section className="board-panel">
        <PanelHeader icon={<ClipboardList />} title="Runbook library" meta={`${runbooks.length} active playbooks`} />
        <div className="runbook-list">
          {runbooks.map((runbook) => (
            <button type="button" key={runbook.id} onClick={() => onServiceSelect(runbook.serviceId)}>
              <strong>{runbook.title}</strong>
              <span>{runbook.trigger}</span>
              <small>{runbook.steps.filter((step) => step.done).length}/{runbook.steps.length} steps completed</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (view === "audit") {
    return (
      <section className="board-panel">
        <PanelHeader icon={<CheckCircle2 />} title="Audit log" meta={`${timeline.length} events`} />
        <div className="audit-list">
          {timeline.map((event) => (
            <article key={event.id}>
              <time>{formatTimestamp(event.at)}</time>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
              <span>{event.actor}</span>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="board-panel">
      <PanelHeader icon={<AlertCircle />} title={view === "dashboard" ? "Incident board" : "Incident queue"} meta={`${incidents.filter((incident) => incident.status !== "resolved").length} active`} />
      <div className="incident-list">
        {incidents.map((incident) => {
          const service = services.find((item) => item.id === incident.serviceId);
          return (
            <button
              type="button"
              key={incident.id}
              className={`${incident.id === selectedIncidentId ? "selected" : ""} ${incident.severity}`}
              onClick={() => onIncidentSelect(incident.id)}
            >
              <span className="severity-marker" />
              <span>
                <strong>{incident.title}</strong>
                <small>{service?.name} · {incident.owner}</small>
              </span>
              <span className="incident-meta">
                <StatusBadge status={incident.status} />
                <em>{incident.status === "resolved" ? "closed" : formatSla(incident.openedAt, incident.slaMinutes)}</em>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PanelHeader({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return (
    <div className="panel-header">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{meta}</p>
      </div>
    </div>
  );
}
