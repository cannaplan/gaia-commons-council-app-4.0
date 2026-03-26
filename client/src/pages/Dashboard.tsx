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

function formatNumber(value: number | undefined) {
  if (value === undefined || value === null) return "—";
  return value.toLocaleString("en-US");
}

function formatCurrencyMillions(value: string | undefined) {
  if (!value) return "—";
  return `$${value}`;
}

export default function Dashboard(): JSX.Element {
  const { data: health } = useHealth();
  const { data: pilot } = usePilotStats();
  const { data: endowment } = useEndowmentStats();
  const { data: timeline } = useTimeline();
  const { data: scaleProjections } = useScaleProjections();

  const statewide = scaleProjections?.find((item) => item.scale === "statewide");

  return (
    <main className="dashboard" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Gaia Dashboard</h1>

      <div
        role="tablist"
        aria-label="Dashboard sections"
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <button role="tab" aria-selected="true" style={{ padding: "8px 12px" }}>
          Overview
        </button>
        <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
          Statewide
        </button>
        <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
          Investor
        </button>
        <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
          Timeline
        </button>
      </div>
     <CollapsibleCard id="overview" title="Overview">
         <div style={{ display: "grid", gap: 12 }}>
          <p>
            Status: <strong>{health?.status ?? "unknown"}</strong>
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <strong>900,000 Students Fed</strong>
            </div>
            <div>
              <strong>1,200 Greenhouses</strong>
            </div>
            <div>
              <strong>statewide</strong>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="statewide" title="Statewide Scale">
        <div style={{ display: "grid", gap: 10 }}>
          <div>Scale: <strong>{statewide?.scale ?? "statewide"}</strong></div>
          <div>Students: <strong>{formatNumber(statewide?.students)}</strong></div>
          <div>Greenhouses: <strong>{formatNumber(statewide?.greenhouses)}</strong></div>
          <div>Schools: <strong>{formatNumber(statewide?.schools)}</strong></div>
          <div>Square feet: <strong>{formatNumber(statewide?.sqft)}</strong></div>
          <div>Meals per day: <strong>{formatNumber(statewide?.mealsPerDay)}</strong></div>
          <div>CO₂ avoided annually: <strong>{formatNumber(statewide?.co2TonsAnnual)}</strong></div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="investor" title="Investor Dashboard">
        <div style={{ display: "grid", gap: 10 }}>
          <div>Endowment size: <strong>{formatCurrencyMillions(endowment?.size)}</strong></div>
          <div>Annual draw: <strong>{formatCurrencyMillions(endowment?.annual)}</strong></div>
          <div>Pilot schools: <strong>{formatNumber(pilot?.schools)}</strong></div>
          <div>Pilot students: <strong>{formatNumber(pilot?.students)}</strong></div>
          <div>Pilot square feet: <strong>{formatNumber(pilot?.sqft)}</strong></div>
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
    </main>
  );
}
