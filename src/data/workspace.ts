import type { Incident, Runbook, TimelineEvent, WorkspaceState } from "../types";
import { services } from "./services";

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60_000).toISOString();
}

export const incidents: Incident[] = [
  {
    id: "inc-topology-sync-loss",
    serviceId: "topology-sync",
    title: "Topology Sync losing inventory freshness",
    summary: "SNMP sync is stale and packet loss is above baseline. Inventory views can drift from the real network state.",
    severity: "critical",
    status: "open",
    owner: "Platform",
    openedAt: minutesAgo(18),
    slaMinutes: 24,
    nextAction: "Verify packet loss, compare latest deploy and pause dependent topology refresh jobs."
  },
  {
    id: "inc-rule-engine-saturation",
    serviceId: "rule-engine",
    title: "Rule Engine close to saturation",
    summary: "CPU and memory are elevated after the last release. Automation queues are still processing but risk is rising.",
    severity: "high",
    status: "acknowledged",
    owner: "Automation",
    openedAt: minutesAgo(36),
    acknowledgedAt: minutesAgo(31),
    slaMinutes: 45,
    nextAction: "Inspect queue pressure and compare rule execution time before and after the deploy."
  },
  {
    id: "inc-event-bus-backpressure",
    serviceId: "event-bus",
    title: "Event Bus backpressure watch",
    summary: "Routing latency is above normal but error rate remains below incident threshold.",
    severity: "medium",
    status: "open",
    owner: "Infrastructure",
    openedAt: minutesAgo(55),
    slaMinutes: 90,
    nextAction: "Watch consumer lag and confirm routing layer has no retry storm."
  }
];

export const runbooks: Runbook[] = [
  {
    id: "rb-topology-sync-loss",
    serviceId: "topology-sync",
    title: "Topology freshness recovery",
    trigger: "Packet loss, stale SNMP inventory or missing topology deltas",
    updatedAt: daysAgo(6),
    steps: [
      {
        id: "verify-network-path",
        label: "Verify network path",
        detail: "Check TCP reachability, packet loss and SNMP response time from the collector segment.",
        done: false
      },
      {
        id: "compare-deploy",
        label: "Compare latest deploy",
        detail: "Review deploy diff and rollback criteria for the topology-sync service.",
        done: false
      },
      {
        id: "pause-dependent-refresh",
        label: "Pause dependent refresh jobs",
        detail: "Stop downstream topology refresh until inventory freshness is back below five minutes.",
        done: false
      }
    ]
  },
  {
    id: "rb-rule-engine-saturation",
    serviceId: "rule-engine",
    title: "Rule engine saturation triage",
    trigger: "CPU, memory or execution latency above baseline after release",
    updatedAt: daysAgo(8),
    steps: [
      {
        id: "inspect-queue",
        label: "Inspect queue pressure",
        detail: "Check pending jobs, retry rate and longest running rule set.",
        done: false
      },
      {
        id: "latency-regression",
        label: "Latency regression cohort",
        detail: "Open traces for top percentile execution time and compare with previous release.",
        done: false
      },
      {
        id: "scale-worker-pool",
        label: "Scale worker pool if needed",
        detail: "Increase worker capacity only after confirming the bottleneck is throughput, not a retry loop.",
        done: false
      }
    ]
  },
  {
    id: "rb-event-bus-backpressure",
    serviceId: "event-bus",
    title: "Event bus backpressure handling",
    trigger: "Routing latency, consumer lag or elevated retry volume",
    updatedAt: daysAgo(12),
    steps: [
      {
        id: "check-consumer-lag",
        label: "Check consumer lag",
        detail: "Compare lag by consumer group and identify the slowest downstream service.",
        done: false
      },
      {
        id: "review-retries",
        label: "Review retry volume",
        detail: "Confirm whether retries are caused by infrastructure pressure or a bad payload.",
        done: false
      },
      {
        id: "apply-routing-shed",
        label: "Apply routing shed",
        detail: "Temporarily reduce non-critical event classes if business-critical routing is affected.",
        done: false
      }
    ]
  }
];

export const timeline: TimelineEvent[] = [
  {
    id: "evt-001",
    at: minutesAgo(18),
    actor: "PulseOps",
    title: "Critical incident opened",
    detail: "Topology Sync crossed the incident threshold with stale inventory and packet loss.",
    serviceId: "topology-sync",
    incidentId: "inc-topology-sync-loss"
  },
  {
    id: "evt-002",
    at: minutesAgo(31),
    actor: "Nora Chen",
    title: "Rule Engine acknowledged",
    detail: "Automation team is comparing current release metrics with the previous deploy.",
    serviceId: "rule-engine",
    incidentId: "inc-rule-engine-saturation"
  },
  {
    id: "evt-003",
    at: minutesAgo(55),
    actor: "PulseOps",
    title: "Event Bus moved to watch",
    detail: "Latency rose above baseline while error rate remains within acceptable bounds.",
    serviceId: "event-bus",
    incidentId: "inc-event-bus-backpressure"
  }
];

export const initialWorkspace: WorkspaceState = {
  schemaVersion: 1,
  view: "dashboard",
  environment: "production",
  workspaceName: "Production Monitoring",
  selectedServiceId: "topology-sync",
  selectedIncidentId: "inc-topology-sync-loss",
  services,
  incidents,
  runbooks,
  timeline,
  lastSavedAt: new Date().toISOString()
};
