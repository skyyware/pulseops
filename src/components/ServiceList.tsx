import type { ScoredService, ServiceStatus } from "../types";

export type ServiceFilter = ServiceStatus | "all";

interface ServiceListProps {
  services: ScoredService[];
  selectedId: string;
  filter: ServiceFilter;
  onFilterChange: (filter: ServiceFilter) => void;
  onSelect: (id: string) => void;
}

export function ServiceList({ services, selectedId, filter, onFilterChange, onSelect }: ServiceListProps) {
  return (
    <aside className="service-list">
      <div className="section-heading">
        <span>Services</span>
        <select value={filter} onChange={(event) => onFilterChange(event.target.value as ServiceFilter)}>
          <option value="all">All</option>
          <option value="incident">Incident</option>
          <option value="watch">Watch</option>
          <option value="healthy">Healthy</option>
        </select>
      </div>

      {services.length === 0 ? (
        <p className="empty-state">No services match this filter.</p>
      ) : (
        services.map((service) => (
          <button
            type="button"
            key={service.id}
            className={`service-row ${service.status} ${service.id === selectedId ? "selected" : ""}`}
            onClick={() => onSelect(service.id)}
          >
            <span className="status-dot" />
            <span>
              <strong>{service.name}</strong>
              <small>{service.owner}</small>
            </span>
            <b>{Math.round(service.score)}</b>
          </button>
        ))
      )}
    </aside>
  );
}
