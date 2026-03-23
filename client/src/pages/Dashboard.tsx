import React from "react";
import CollapsibleCard from "../components/CollapsibleCard";

// TODO: update these imports to the actual component paths in your gaia4.0 repo:
/*
 Dashboard page using CollapsibleCard for grouped widgets.
 Replace the preview components with your real components or inline content.
*/

export default function Dashboard(): JSX.Element {
  return (
    <main className="dashboard" style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Gaia Dashboard</h1>

      <CollapsibleCard id="investor" title="Investor Dashboard">
        <div>
          {/* Example content — replace with the real component/markup */}
          <p>
            Investor LCOF/BCR sensitivity charts and controls go here. Replace
            this content with the real component or markup from your project.
          </p>
        </div>
      </CollapsibleCard>

      {/* Add/replace more cards as needed */}
    </main>
  );
}
