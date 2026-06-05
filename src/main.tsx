import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Hero } from "./components/Hero";
import { ServiceDetail } from "./components/ServiceDetail";
import { ServiceFilter, ServiceList } from "./components/ServiceList";
import { StatsGrid } from "./components/StatsGrid";
import { services as seedServices } from "./data/services";
import { usePulseOpsWasm } from "./hooks/usePulseOpsWasm";
import { getFleetScore, scoreService } from "./lib/scoring";
import type { ServiceMetrics } from "./types";
import "./styles.css";

const initialSelectedServiceId = "topology-sync";

function App() {
  const { wasm, state: wasmState } = usePulseOpsWasm();
  const [services, setServices] = useState<ServiceMetrics[]>(seedServices);
  const [selectedId, setSelectedId] = useState(initialSelectedServiceId);
  const [filter, setFilter] = useState<ServiceFilter>("all");

  const scoredServices = useMemo(
    () => services.map((service) => scoreService(service, wasm)).sort((a, b) => b.risk - a.risk),
    [services, wasm]
  );

  const visibleServices = useMemo(
    () => filter === "all" ? scoredServices : scoredServices.filter((service) => service.status === filter),
    [filter, scoredServices]
  );

  const selectedService = scoredServices.find((service) => service.id === selectedId) ?? scoredServices[0];
  const incidentCount = scoredServices.filter((service) => service.status === "incident").length;
  const watchCount = scoredServices.filter((service) => service.status === "watch").length;

  function updateSelectedService(patch: Partial<ServiceMetrics>) {
    setServices((current) =>
      current.map((service) => service.id === selectedService.id ? { ...service, ...patch } : service)
    );
  }

  function resetSample() {
    setServices(seedServices);
    setSelectedId(initialSelectedServiceId);
    setFilter("all");
  }

  return (
    <main className="app-shell">
      <Hero
        fleetScore={getFleetScore(scoredServices)}
        incidentCount={incidentCount}
        watchCount={watchCount}
        wasmState={wasmState}
        onReset={resetSample}
      />
      <StatsGrid incidentCount={incidentCount} />

      <section className="workspace">
        <ServiceList
          services={visibleServices}
          selectedId={selectedService.id}
          filter={filter}
          onFilterChange={setFilter}
          onSelect={setSelectedId}
        />
        <ServiceDetail service={selectedService} onChange={updateSelectedService} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
