import { useEffect, useMemo, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import { AccessRequestDialog } from "./components/AccessRequestDialog";
import { AppShell } from "./components/AppShell";
import { CommandMetrics } from "./components/CommandMetrics";
import { RunbookPanel } from "./components/RunbookPanel";
import { ServiceInspector } from "./components/ServiceInspector";
import { WorkspaceBoard } from "./components/WorkspaceBoard";
import { usePulseOpsWasm } from "./hooks/usePulseOpsWasm";
import { getFleetScore, scoreService } from "./lib/scoring";
import { exportWorkspace, loadWorkspace, persistWorkspace, readWorkspaceFile, workspaceReducer } from "./lib/workspace";
import type { ServiceMetrics, WorkspaceState } from "./types";
import "./styles.css";

function App() {
  const { wasm, state: wasmState } = usePulseOpsWasm();
  const [workspace, dispatch] = useReducer(workspaceReducer, undefined, loadWorkspace);
  const [note, setNote] = useState("");
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);

  useEffect(() => {
    persistWorkspace(workspace);
  }, [workspace]);

  const scoredServices = useMemo(
    () => workspace.services.map((service) => scoreService(service, wasm)).sort((a, b) => b.risk - a.risk),
    [workspace.services, wasm]
  );
  const selectedService = scoredServices.find((service) => service.id === workspace.selectedServiceId) ?? scoredServices[0];
  const selectedIncident = workspace.incidents.find((incident) => incident.id === workspace.selectedIncidentId);
  const activeServiceId = selectedIncident?.serviceId ?? selectedService.id;
  const activeRunbook = workspace.runbooks.find((runbook) => runbook.serviceId === activeServiceId);
  const relatedTimeline = workspace.timeline.filter((event) => !selectedIncident || event.incidentId === selectedIncident.id || event.serviceId === activeServiceId);

  function updateSelectedService(patch: Partial<ServiceMetrics>) {
    dispatch({ type: "update-service", serviceId: selectedService.id, patch });
  }

  async function importFile(file: File) {
    const imported = await readWorkspaceFile(file);
    dispatch({ type: "import", workspace: imported });
  }

  return (
    <AppShell
      workspace={workspace}
      onViewChange={(view) => dispatch({ type: "set-view", view })}
      onEnvironmentChange={(environment: WorkspaceState["environment"]) => dispatch({ type: "set-environment", environment })}
      onSave={() => dispatch({ type: "save" })}
      onReset={() => dispatch({ type: "reset" })}
      onExport={() => exportWorkspace(workspace)}
      onImport={importFile}
      onAccessRequest={() => setAccessDialogOpen(true)}
    >
      <CommandMetrics services={scoredServices} incidents={workspace.incidents} fleetScore={getFleetScore(scoredServices)} />
      <section className="command-grid">
        <WorkspaceBoard
          view={workspace.view}
          incidents={workspace.incidents}
          services={scoredServices}
          runbooks={workspace.runbooks}
          timeline={workspace.timeline}
          selectedIncidentId={workspace.selectedIncidentId}
          selectedServiceId={workspace.selectedServiceId}
          onIncidentSelect={(incidentId) => dispatch({ type: "select-incident", incidentId })}
          onServiceSelect={(serviceId) => dispatch({ type: "select-service", serviceId })}
        />
        <ServiceInspector service={selectedService} modelReady={wasmState === "ready"} onChange={updateSelectedService} />
        <RunbookPanel
          incident={selectedIncident}
          runbook={activeRunbook}
          timeline={relatedTimeline}
          note={note}
          onNoteChange={setNote}
          onNoteAdd={() => {
            dispatch({ type: "add-note", text: note });
            setNote("");
          }}
          onAcknowledge={() => selectedIncident && dispatch({ type: "set-incident-status", incidentId: selectedIncident.id, status: "acknowledged" })}
          onResolve={() => selectedIncident && dispatch({ type: "set-incident-status", incidentId: selectedIncident.id, status: "resolved" })}
          onStepToggle={(runbookId, stepId) => dispatch({ type: "toggle-runbook-step", runbookId, stepId })}
        />
      </section>
      <AccessRequestDialog open={accessDialogOpen} onClose={() => setAccessDialogOpen(false)} />
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
