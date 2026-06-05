import { Code2, Gauge, Network, Shield } from "lucide-react";

interface StatsGridProps {
  incidentCount: number;
}

export function StatsGrid({ incidentCount }: StatsGridProps) {
  return (
    <section className="stats-grid" aria-label="Monitoring summary">
      <article>
        <Gauge />
        <span>Scoring model</span>
        <strong>C++ / WASM</strong>
      </article>
      <article>
        <Code2 />
        <span>Frontend</span>
        <strong>React + TypeScript</strong>
      </article>
      <article>
        <Network />
        <span>Signals</span>
        <strong>TCP · SNMP · API</strong>
      </article>
      <article>
        <Shield />
        <span>Ops posture</span>
        <strong>{incidentCount === 0 ? "Stable" : "Needs attention"}</strong>
      </article>
    </section>
  );
}
