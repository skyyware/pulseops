import { describe, expect, it } from "vitest";
import { initialWorkspace } from "../data/workspace";
import { isWorkspaceState, normalizeWorkspace, workspaceReducer } from "./workspace";

describe("workspaceReducer", () => {
  it("acknowledges and resolves incidents while appending timeline events", () => {
    const acknowledged = workspaceReducer(initialWorkspace, {
      type: "set-incident-status",
      incidentId: "inc-topology-sync-loss",
      status: "acknowledged"
    });

    expect(acknowledged.incidents.find((incident) => incident.id === "inc-topology-sync-loss")).toMatchObject({
      status: "acknowledged"
    });
    expect(acknowledged.timeline[0]).toMatchObject({
      title: "Incident acknowledged",
      incidentId: "inc-topology-sync-loss"
    });

    const resolved = workspaceReducer(acknowledged, {
      type: "set-incident-status",
      incidentId: "inc-topology-sync-loss",
      status: "resolved"
    });

    expect(resolved.incidents.find((incident) => incident.id === "inc-topology-sync-loss")).toMatchObject({
      status: "resolved"
    });
    expect(resolved.timeline[0]).toMatchObject({
      title: "Incident resolved"
    });
  });

  it("tracks service signal edits as operational audit events", () => {
    const next = workspaceReducer(initialWorkspace, {
      type: "update-service",
      serviceId: "topology-sync",
      patch: { latencyMs: 510 }
    });

    expect(next.services.find((service) => service.id === "topology-sync")?.latencyMs).toBe(510);
    expect(next.timeline[0]).toMatchObject({
      title: "Service signals updated",
      serviceId: "topology-sync"
    });
  });

  it("toggles runbook steps without mutating the seed workspace", () => {
    const next = workspaceReducer(initialWorkspace, {
      type: "toggle-runbook-step",
      runbookId: "rb-topology-sync-loss",
      stepId: "verify-network-path"
    });

    const originalStep = initialWorkspace.runbooks[0].steps[0];
    const nextStep = next.runbooks[0].steps[0];

    expect(originalStep.done).toBe(false);
    expect(nextStep.done).toBe(true);
    expect(next.timeline[0]).toMatchObject({
      title: "Runbook step completed"
    });
  });
});

describe("workspace schema", () => {
  it("accepts current workspace schema and rejects unknown persisted state", () => {
    expect(isWorkspaceState(initialWorkspace)).toBe(true);
    expect(normalizeWorkspace({ services: [] })).toBe(initialWorkspace);
  });
});
