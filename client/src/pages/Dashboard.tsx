import React from "react";
import CollapsibleCard from "../components/CollapsibleCard";

export default function Dashboard(): JSX.Element {
  return (
    <main className="dashboard" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Gaia Dashboard</h1>

      <CollapsibleCard id="overview" title="Overview">
        <div>
          <p>Gaia Commons Council deployment is live.</p>
          <p>
            This dashboard is connected to the production database and ready for
            the next round of UI restoration.
          </p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="investor" title="Investor Dashboard">
        <div>
          <p>Investor metrics and scenario tools are being restored.</p>
          <p>
            The backend and database are online; the remaining work is wiring
            the real frontend components back into this page.
          </p>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="status" title="Deployment Status">
        <div>
          <ul>
            <li>Web app deployed on Render</li>
            <li>PostgreSQL connected</li>
            <li>Database schema created</li>
            <li>Seed data loaded</li>
          </ul>
        </div>
      </CollapsibleCard>
    </main>
  );
}
