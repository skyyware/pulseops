import type { ServiceMetrics } from "../types";

export const services: ServiceMetrics[] = [
  {
    id: "collector-api",
    name: "Collector API",
    owner: "Monitoring Core",
    role: "C++ backend collector",
    latencyMs: 188,
    errorRate: 1.8,
    cpuPercent: 61,
    memoryPercent: 66,
    packetLossPercent: 0.5,
    staleMinutes: 1,
    previousScore: 91,
    incidents24h: 0,
    deployAgeHours: 38
  },
  {
    id: "rule-engine",
    name: "Rule Engine",
    owner: "Automation",
    role: "Threshold and anomaly service",
    latencyMs: 312,
    errorRate: 3.2,
    cpuPercent: 76,
    memoryPercent: 82,
    packetLossPercent: 1.1,
    staleMinutes: 3,
    previousScore: 84,
    incidents24h: 1,
    deployAgeHours: 9
  },
  {
    id: "topology-sync",
    name: "Topology Sync",
    owner: "Platform",
    role: "SNMP/IP inventory sync",
    latencyMs: 470,
    errorRate: 7.6,
    cpuPercent: 89,
    memoryPercent: 91,
    packetLossPercent: 3.4,
    staleMinutes: 8,
    previousScore: 74,
    incidents24h: 3,
    deployAgeHours: 5
  },
  {
    id: "admin-console",
    name: "Admin Console",
    owner: "Frontend",
    role: "React operations UI",
    latencyMs: 148,
    errorRate: 0.7,
    cpuPercent: 42,
    memoryPercent: 51,
    packetLossPercent: 0.1,
    staleMinutes: 0,
    previousScore: 96,
    incidents24h: 0,
    deployAgeHours: 71
  },
  {
    id: "event-bus",
    name: "Event Bus",
    owner: "Infrastructure",
    role: "Microservice routing layer",
    latencyMs: 260,
    errorRate: 2.6,
    cpuPercent: 67,
    memoryPercent: 73,
    packetLossPercent: 0.9,
    staleMinutes: 2,
    previousScore: 88,
    incidents24h: 0,
    deployAgeHours: 14
  }
];
