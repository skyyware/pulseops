import { CheckCircle2, Circle, MessageSquarePlus } from "lucide-react";
import type { Incident, Runbook, TimelineEvent } from "../types";
import { formatTimestamp } from "../lib/time";
import { StatusBadge } from "./status/StatusBadge";

interface RunbookPanelProps {
  incident?: Incident;
  runbook?: Runbook;
  timeline: TimelineEvent[];
  note: string;
  onNoteChange: (value: string) => void;
  onNoteAdd: () => void;
  onAcknowledge: () => void;
  onResolve: () => void;
  onStepToggle: (runbookId: string, stepId: string) => void;
}

export function RunbookPanel({
  incident,
  runbook,
  timeline,
  note,
  onNoteChange,
  onNoteAdd,
  onAcknowledge,
  onResolve,
  onStepToggle
}: RunbookPanelProps) {
  return (
    <aside className="runbook-panel">
      <section className="incident-card">
        <div className="incident-card-header">
          <span>Selected incident</span>
          {incident ? <StatusBadge status={incident.severity} /> : null}
        </div>
        {incident ? (
          <>
            <h2>{incident.title}</h2>
            <p>{incident.summary}</p>
            <strong>{incident.nextAction}</strong>
            <div className="incident-actions">
              <button type="button" onClick={onAcknowledge} disabled={incident.status !== "open"}>Acknowledge</button>
              <button type="button" onClick={onResolve} disabled={incident.status === "resolved"}>Resolve</button>
            </div>
          </>
        ) : (
          <p>No incident selected.</p>
        )}
      </section>

      <section className="runbook-card">
        <div className="panel-header compact">
          <div>
            <h2>{runbook?.title ?? "No runbook selected"}</h2>
            <p>{runbook?.trigger ?? "Select an incident or service to load runbook steps."}</p>
          </div>
        </div>
        {runbook ? (
          <div className="step-list">
            {runbook.steps.map((step) => (
              <button type="button" key={step.id} className={step.done ? "done" : ""} onClick={() => onStepToggle(runbook.id, step.id)}>
                {step.done ? <CheckCircle2 /> : <Circle />}
                <span>
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="note-card">
        <label htmlFor="decision-note">Decision note</label>
        <textarea id="decision-note" value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="Capture the decision, rollback reason or next owner..." />
        <button type="button" onClick={onNoteAdd}>
          <MessageSquarePlus size={15} />
          Add to timeline
        </button>
      </section>

      <section className="timeline-card">
        <div className="panel-header compact">
          <div>
            <h2>Timeline</h2>
            <p>{timeline.length} recent events</p>
          </div>
        </div>
        <div className="mini-timeline">
          {timeline.slice(0, 6).map((event) => (
            <article key={event.id}>
              <time>{formatTimestamp(event.at)}</time>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}
