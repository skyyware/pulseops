import { Cpu, Database, RadioTower, Timer } from "lucide-react";
import type { ScoredService, ServiceMetrics } from "../types";
import { STATUS_LABEL } from "../lib/scoring";
import { SignalControl } from "./SignalControl";
import { StatusBadge } from "./status/StatusBadge";

interface ServiceInspectorProps {
  service: ScoredService;
  modelReady: boolean;
  onChange: (patch: Partial<ServiceMetrics>) => void;
}

export function ServiceInspector({ service, modelReady, onChange }: ServiceInspectorProps) {
  return (
    <section className="service-inspector">
      <div className="inspector-header">
        <div>
          <StatusBadge status={service.status} />
          <h2>{service.name}</h2>
          <p>{service.owner} · {service.role}</p>
        </div>
        <div className="score-ring">
          <span>{modelReady ? "C++ WASM" : "Loading"}</span>
          <strong>{Math.round(service.score)}</strong>
        </div>
      </div>

      <div className="signal-grid">
        <SignalControl label="Latency" value={service.latencyMs} unit="ms" min={60} max={720} step={1} onChange={(latencyMs) => onChange({ latencyMs })} />
        <SignalControl label="Errors" value={service.errorRate} unit="%" min={0} max={16} step={0.1} onChange={(errorRate) => onChange({ errorRate })} />
        <SignalControl label="CPU" value={service.cpuPercent} unit="%" min={10} max={98} step={1} onChange={(cpuPercent) => onChange({ cpuPercent })} />
        <SignalControl label="Memory" value={service.memoryPercent} unit="%" min={20} max={98} step={1} onChange={(memoryPercent) => onChange({ memoryPercent })} />
        <SignalControl label="Packet loss" value={service.packetLossPercent} unit="%" min={0} max={9} step={0.1} onChange={(packetLossPercent) => onChange({ packetLossPercent })} />
        <SignalControl label="Stale data" value={service.staleMinutes} unit="m" min={0} max={18} step={1} onChange={(staleMinutes) => onChange({ staleMinutes })} />
      </div>

      <div className="health-evidence">
        <article>
          <Timer />
          <span>State</span>
          <strong>{STATUS_LABEL[service.status]}</strong>
        </article>
        <article>
          <Cpu />
          <span>Risk</span>
          <strong>{Math.round(service.risk)}</strong>
        </article>
        <article>
          <Database />
          <span>Deploy age</span>
          <strong>{service.deployAgeHours}h</strong>
        </article>
        <article>
          <RadioTower />
          <span>Incidents</span>
          <strong>{service.incidents24h}/24h</strong>
        </article>
      </div>
    </section>
  );
}
