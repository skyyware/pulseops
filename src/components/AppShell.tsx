import { Activity, ClipboardList, FileJson, Gauge, ListChecks, RotateCcw, ServerCog, Upload } from "lucide-react";
import type { WorkspaceState, WorkspaceView } from "../types";
import { formatTimestamp } from "../lib/time";

const navigation: Array<{ view: WorkspaceView; label: string; icon: typeof Gauge }> = [
  { view: "dashboard", label: "Dashboard", icon: Gauge },
  { view: "incidents", label: "Incidents", icon: ClipboardList },
  { view: "services", label: "Services", icon: ServerCog },
  { view: "runbooks", label: "Runbooks", icon: ListChecks }
];

interface AppShellProps {
  workspace: WorkspaceState;
  onViewChange: (view: WorkspaceView) => void;
  onEnvironmentChange: (environment: WorkspaceState["environment"]) => void;
  onSave: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  children: React.ReactNode;
}

export function AppShell({
  workspace,
  onViewChange,
  onEnvironmentChange,
  onSave,
  onReset,
  onExport,
  onImport,
  children
}: AppShellProps) {
  return (
    <main className="product-shell">
      <aside className="sidebar">
        <div className="brand">
          <Activity size={22} />
          <span>PulseOps</span>
        </div>
        <div className="workspace-switcher">
          <span>Workspace</span>
          <strong>{workspace.workspaceName}</strong>
        </div>
        <nav aria-label="Workspace navigation">
          {navigation.map(({ view, label, icon: Icon }) => (
            <button
              type="button"
              key={view}
              className={workspace.view === view ? "active" : ""}
              onClick={() => onViewChange(view)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className={workspace.view === "audit" ? "active audit-button" : "audit-button"} onClick={() => onViewChange("audit")}>
          <FileJson size={16} />
          Audit Log
        </button>
      </aside>

      <section className="app-area">
        <header className="topbar">
          <div>
            <h1>Incident command workspace</h1>
            <p>Local-first triage for service health, runbooks and operational decisions.</p>
          </div>
          <div className="topbar-actions">
            <select value={workspace.environment} onChange={(event) => onEnvironmentChange(event.target.value as WorkspaceState["environment"])}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
            </select>
            <button type="button" onClick={onSave}>Save</button>
            <button type="button" onClick={onExport}>
              <FileJson size={15} />
              Export
            </button>
            <label className="import-button">
              <Upload size={15} />
              Import
              <input type="file" accept="application/json" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onImport(file);
                  event.target.value = "";
                }
              }} />
            </label>
            <button type="button" className="ghost-button" onClick={onReset}>
              <RotateCcw size={15} />
            </button>
          </div>
        </header>
        <div className="save-state">
          Local workspace saved {workspace.lastSavedAt ? formatTimestamp(workspace.lastSavedAt) : "not yet"} · Git-based stage deploy ready
        </div>
        {children}
      </section>
    </main>
  );
}
