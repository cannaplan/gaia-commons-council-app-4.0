import React from "react";
import ClusterBuilder from "./ClusterBuilder";
import CollapsibleCard from "../components/CollapsibleCard";
import {
  useHealth,
  usePilotStats,
  useEndowmentStats,
  useTimeline,
  useScaleProjections,
} from "../hooks/use-gaia";

function formatNumber(value?: number | null) {
  if (value === undefined || value === null) return "—";
  return value.toLocaleString("en-US");
}

function formatCurrencyMillions(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return `$${(n / 1_000_000).toLocaleString("en-US")}M`;
}

export default function Dashboard(): JSX.Element {
  const { data: health } = useHealth();
  const { data: pilot } = usePilotStats();
  const { data: endowment } = useEndowmentStats();
  const { data: timeline } = useTimeline();
  const { data: scaleProjections } = useScaleProjections();

  const statewide = (scaleProjections || []).find((item: any) => item?.scale === "statewide");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50" style={{ padding: 16 }}>
      <div className="container mx-auto px-6 py-12">
        <h1 className="mb-6">Gaia Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CollapsibleCard
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl hover:shadow-2xl"
            title="Overview"
            id="overview"
          >
            <div style={{ display: "grid", gap: 12 }}>
              <p>
                Status: <strong>{health?.status ?? "unknown"}</strong>
              </p>

              <div>
                <strong>900,000 Students Fed</strong>
              </div>
              <div>
                <strong>1,200 Greenhouses</strong>
              </div>
            </div>
          </CollapsibleCard>
        </div>

        <div
          role="tablist"
          aria-label="Dashboard sections"
          style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}
        >
          <button role="tab" aria-selected={true} style={{ padding: "8px 12px" }}>
            Overview
          </button>
          <button role="tab" aria-selected={false} style={{ padding: "8px 12px" }}>
            Investor
          </button>
          <button role="tab" aria-selected={false} style={{ padding: "8px 12px" }}>
            Timeline
          </button>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ marginTop: 12 }}
        >
          <CollapsibleCard id="statewide" title="Statewide Scale">
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                Endowment size: <strong>{formatCurrencyMillions(endowment?.size)}</strong>
              </div>
              <div>
                Annual draw: <strong>{formatCurrencyMillions(endowment?.annual)}</strong>
              </div>
              <div>
                Pilot schools: <strong>{formatNumber(pilot?.schools)}</strong>
              </div>
              <div>
                Pilot students: <strong>{formatNumber(pilot?.students)}</strong>
              </div>
              <div>
                Pilot square feet: <strong>{formatNumber(pilot?.sqft)}</strong>
              </div>
              <div>
                Square feet statewide: <strong>{formatNumber(statewide?.sqft)}</strong>
              </div>
              <div>
                Meals per day: <strong>{formatNumber(statewide?.mealsPerDay)}</strong>
              </div>
              <div>
                CO₂ avoided annually: <strong>{formatNumber(statewide?.co2TonsAnnual)}</strong>
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard id="investor" title="Investor Dashboard">
            <div>
              <div>
                Pilot square feet: <strong>{formatNumber(pilot?.sqft)}</strong>
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard id="timeline" title="Timeline">
            <div style={{ display: "grid", gap: 8 }}>
              {timeline && timeline.length > 0 ? (
                timeline.slice(0, 5).map((item: any) => (
                  <div key={item.id ?? `${item.year}-${item.event}`}>
                    <strong>{item.year}</strong> — {item.event}
                  </div>
                ))
              ) : (
                <div>No timeline events available.</div>
              )}
            </div>
          </CollapsibleCard>

          <CollapsibleCard id="cluster-builder" title="Build Your Own Greenhouse Cluster">
            <div style={{ marginTop: 8 }}>
              <ClusterBuilder />
            </div>
          </CollapsibleCard>
        </div>
      </div>
    </main>
  );
}
