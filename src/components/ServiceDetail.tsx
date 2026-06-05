import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { STATUS_LABEL } from "../lib/scoring";
import type { ScoredService, ServiceMetrics } from "../types";
import { MetricInput } from "./MetricInput";

interface ServiceDetailProps {
  service: ScoredService;
  onChange: (patch: Partial<ServiceMetrics>) => void;
}

export function ServiceDetail({ service, onChange }: ServiceDetailProps) {
  return (
    <section className="detail-panel">
      <div className="detail-header">
        <div>
          <span className={`status-pill ${service.status}`}>{STATUS_LABEL[service.status]}</span>
          <h2>{service.name}</h2>
          <p>{service.role}</p>
        </div>
        <div className="risk-meter">
          <span>Risk</span>
          <strong>{Math.round(service.risk)}</strong>
        </div>
      </div>

      <div className="metric-grid">
        <MetricInput label="Latency" value={service.latencyMs} unit="ms" min={60} max={720} step={1} onChange={(latencyMs) => onChange({ latencyMs })} />
        <MetricInput label="Errors" value={service.errorRate} unit="%" min={0} max={16} step={0.1} onChange={(errorRate) => onChange({ errorRate })} />
        <MetricInput label="CPU" value={service.cpuPercent} unit="%" min={10} max={98} step={1} onChange={(cpuPercent) => onChange({ cpuPercent })} />
        <MetricInput label="Memory" value={service.memoryPercent} unit="%" min={20} max={98} step={1} onChange={(memoryPercent) => onChange({ memoryPercent })} />
        <MetricInput label="Packet loss" value={service.packetLossPercent} unit="%" min={0} max={9} step={0.1} onChange={(packetLossPercent) => onChange({ packetLossPercent })} />
        <MetricInput label="Stale data" value={service.staleMinutes} unit="m" min={0} max={18} step={1} onChange={(staleMinutes) => onChange({ staleMinutes })} />
      </div>

      <div className="action-lane">
        {service.status === "healthy" ? <CheckCircle2 /> : <AlertTriangle />}
        <div>
          <span>Recommended next action</span>
          <p>{service.action}</p>
        </div>
      </div>
    </section>
  );
}
