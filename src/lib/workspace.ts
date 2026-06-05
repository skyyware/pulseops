import { initialWorkspace } from "../data/workspace";
import type { IncidentStatus, RunbookStep, ServiceMetrics, WorkspaceState, WorkspaceView } from "../types";
import { nowIso } from "./time";

export const WORKSPACE_STORAGE_KEY = "pulseops.workspace.v1";

export type WorkspaceAction =
  | { type: "set-view"; view: WorkspaceView }
  | { type: "set-environment"; environment: WorkspaceState["environment"] }
  | { type: "select-service"; serviceId: string }
  | { type: "select-incident"; incidentId: string }
  | { type: "update-service"; serviceId: string; patch: Partial<ServiceMetrics> }
  | { type: "set-incident-status"; incidentId: string; status: IncidentStatus }
  | { type: "toggle-runbook-step"; runbookId: string; stepId: string }
  | { type: "add-note"; text: string }
  | { type: "save" }
  | { type: "reset" }
  | { type: "import"; workspace: WorkspaceState };

export function isWorkspaceState(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<WorkspaceState>;

  return candidate.schemaVersion === 1
    && Array.isArray(candidate.services)
    && Array.isArray(candidate.incidents)
    && Array.isArray(candidate.runbooks)
    && Array.isArray(candidate.timeline)
    && typeof candidate.selectedServiceId === "string"
    && typeof candidate.selectedIncidentId === "string";
}

export function normalizeWorkspace(value: unknown): WorkspaceState {
  return isWorkspaceState(value) ? value : initialWorkspace;
}

function eventId() {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function selectedIncident(state: WorkspaceState) {
  return state.incidents.find((incident) => incident.id === state.selectedIncidentId);
}

function selectedService(state: WorkspaceState) {
  return state.services.find((service) => service.id === state.selectedServiceId);
}

function withTimeline(state: WorkspaceState, title: string, detail: string, actor = "Sascha") {
  const incident = selectedIncident(state);
  const service = selectedService(state);

  return {
    ...state,
    timeline: [
      {
        id: eventId(),
        at: nowIso(),
        actor,
        title,
        detail,
        serviceId: service?.id,
        incidentId: incident?.id
      },
      ...state.timeline
    ].slice(0, 60)
  };
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  if (action.type === "reset") {
    return { ...initialWorkspace, lastSavedAt: nowIso() };
  }

  if (action.type === "import") {
    return { ...action.workspace, lastSavedAt: nowIso() };
  }

  if (action.type === "save") {
    return { ...state, lastSavedAt: nowIso() };
  }

  if (action.type === "set-view") {
    return { ...state, view: action.view };
  }

  if (action.type === "set-environment") {
    return { ...state, environment: action.environment };
  }

  if (action.type === "select-service") {
    const incident = state.incidents.find((item) => item.serviceId === action.serviceId && item.status !== "resolved");

    return {
      ...state,
      selectedServiceId: action.serviceId,
      selectedIncidentId: incident?.id ?? state.selectedIncidentId
    };
  }

  if (action.type === "select-incident") {
    const incident = state.incidents.find((item) => item.id === action.incidentId);

    return {
      ...state,
      selectedIncidentId: action.incidentId,
      selectedServiceId: incident?.serviceId ?? state.selectedServiceId,
      view: state.view === "services" ? state.view : "incidents"
    };
  }

  if (action.type === "update-service") {
    const nextState = {
      ...state,
      services: state.services.map((service) =>
        service.id === action.serviceId ? { ...service, ...action.patch } : service
      ),
      selectedServiceId: action.serviceId
    };

    const fields = Object.keys(action.patch).join(", ");
    return withTimeline(nextState, "Service signals updated", `${fields} changed for ${selectedService(nextState)?.name ?? "service"}.`);
  }

  if (action.type === "set-incident-status") {
    const timestamp = nowIso();
    const nextState = {
      ...state,
      incidents: state.incidents.map((incident) => {
        if (incident.id !== action.incidentId) {
          return incident;
        }

        return {
          ...incident,
          status: action.status,
          acknowledgedAt: action.status === "acknowledged" ? timestamp : incident.acknowledgedAt,
          resolvedAt: action.status === "resolved" ? timestamp : incident.resolvedAt
        };
      })
    };
    const incident = nextState.incidents.find((item) => item.id === action.incidentId);
    return withTimeline(nextState, `Incident ${action.status}`, incident?.title ?? "Incident state changed");
  }

  if (action.type === "toggle-runbook-step") {
    let toggledStep: RunbookStep | undefined;
    const nextState = {
      ...state,
      runbooks: state.runbooks.map((runbook) => {
        if (runbook.id !== action.runbookId) {
          return runbook;
        }

        return {
          ...runbook,
          steps: runbook.steps.map((step) => {
            if (step.id !== action.stepId) {
              return step;
            }

            toggledStep = { ...step, done: !step.done };
            return toggledStep;
          })
        };
      })
    };

    return withTimeline(
      nextState,
      toggledStep?.done ? "Runbook step completed" : "Runbook step reopened",
      toggledStep?.label ?? "Runbook step changed"
    );
  }

  if (action.type === "add-note") {
    const text = action.text.trim();

    if (!text) {
      return state;
    }

    return withTimeline(state, "Decision note added", text);
  }

  return state;
}

export function loadWorkspace() {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);

    if (!raw) {
      return initialWorkspace;
    }

    return normalizeWorkspace(JSON.parse(raw));
  } catch {
    return initialWorkspace;
  }
}

export function persistWorkspace(state: WorkspaceState) {
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state, null, 2));
}

export function exportWorkspace(state: WorkspaceState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pulseops-${state.environment}-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readWorkspaceFile(file: File) {
  const text = await file.text();
  return normalizeWorkspace(JSON.parse(text));
}
