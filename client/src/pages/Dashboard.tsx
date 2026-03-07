#!/usr/bin/env bash
# Usage: bash apply_patch.sh
set -e

BRANCH="feat/dashboard-restructure-7-cards"
FILE="client/src/pages/Dashboard.tsx"

git checkout -b "$BRANCH"

cat > "$FILE" <<'EOF'
import React from "react";
import CollapseAllToggle, { CollapsibleProvider } from "@/components/CollapseAllToggle";
import CollapsibleCard from "@/components/CollapsibleCard";

export default function Dashboard() {
  return (
    <CollapsibleProvider>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section - always visible */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Gaia Commons Council — Dashboard</h1>
          <p className="text-muted-foreground">Overview and interactive controls</p>

          {/* Hero stats: 4 animated counter cards (kept visible) */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded shadow">Stat A: 1,200</div>
            <div className="p-4 bg-white rounded shadow">Stat B: $5.0B</div>
            <div className="p-4 bg-white rounded shadow">Stat C: 9.2B</div>
            <div className="p-4 bg-white rounded shadow">Stat D: 2026</div>
          </div>
        </header>

        {/* Collapse all toggle immediately after hero stats */}
        <CollapseAllToggle className="mb-6" />

        {/* Seven CollapsibleCards (all defaultOpen={false}) */}

        <CollapsibleCard
          title="🌱 Pilot Program"
          accent="emerald"
          badge="Minnesota 2026"
          defaultOpen={false}
        >
          <div className="space-y-6 pt-2">
            <section>
              <h3 className="text-lg font-semibold">Minnesota Pilot School Clusters</h3>
              <p>Sites to be confirmed upon program launch</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">K-12 NGSS Curriculum</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded">Grade band: Early Elementary</div>
                <div className="p-4 bg-slate-50 rounded">Grade band: Upper Elementary</div>
                <div className="p-4 bg-slate-50 rounded">Grade band: Middle School</div>
                <div className="p-4 bg-slate-50 rounded">Grade band: High School</div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Growth Pathway</h3>
              <div className="flex gap-4 flex-wrap">
                <div className="p-3 bg-slate-100 rounded">Pilot</div>
                <div className="p-3 bg-slate-100 rounded">Statewide</div>
                <div className="p-3 bg-slate-100 rounded">National</div>
                <div className="p-3 bg-slate-100 rounded">Global</div>
              </div>
            </section>

            <section>
              <a
                href="/cluster-builder"
                className="inline-block px-4 py-2 bg-emerald-500 text-white rounded"
              >
                Build Your Own Greenhouse Cluster
              </a>
            </section>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title="🏗️ Greenhouse Initiative"
          accent="blue"
          badge="1,200 Greenhouses"
          defaultOpen={false}
        >
          <div className="space-y-6 pt-2">
            <section>
              <h3 className="text-lg font-semibold">Multi-Scale Deployment Dashboard</h3>
              <p>Tabs: Pilot / Statewide / National / Global</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Construction Phase Jobs</h3>
              <p>
                Northern MN Hubs grid + Statewide School Greenhouses grid + summary stats
              </p>
              <p className="text-sm text-amber-600">
                Key difference from mining: community-centered long-term jobs
              </p>
            </section>

            <section className="bg-amber-50 p-4 rounded">
              <h4 className="font-semibold">Specialty Crops for All 330 School Districts</h4>
            </section>

            <section className="bg-emerald-50 p-4 rounded">
              <h4 className="font-semibold">Environmental Protection Guarantee</h4>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Impact Calculator</h3>
              <p>Interactive sliders (carbon, jobs, revenue)</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Community Comparison Tool</h3>
              <p>Compare communities across metrics</p>
            </section>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title="🪶 Tribal Partnerships"
          accent="amber"
          badge="Leech Lake Nation"
          defaultOpen={false}
        >
          <div className="space-y-6 pt-2">
            <section>
              <h3 className="text-lg font-semibold">
                Tribal Partnerships — Leech Lake Band of Ojibwe
              </h3>
              <p>
                Includes Red Lake, Cass Lake-Bena, Nay Ah Shing community initiatives and food
                sovereignty work.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Excess Revenue Allocation</h3>
              <p>Leech Lake Tribal Programs allocation</p>
            </section>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title="💰 Endowment & Financials"
          accent="amber"
          badge="$5B Target"
          defaultOpen={false}
        >
          <div className="space-y-6 pt-2">
            <section>
              <h3 className="text-lg font-semibold">Endowment Funding Sources</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 list-none">
                <li>Top 20 Local Corps</li>
                <li>Pro Sports Franchises</li>
                <li>Local Med/Ins</li>
                <li>Out-State Corp/Med/Ins</li>
                <li>Data/Online Retail</li>
                <li>Out-of-Country Mining</li>
                <li>Federal Government</li>
                <li>Local Billionaires</li>
              </ul>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded">Total Potential Revenue $9.2B</div>
              <div className="p-4 bg-white rounded">Core Endowment Target $5.0B</div>
              <div className="p-4 bg-white rounded">Excess Allocation $4.2B</div>
              <div className="p-4 bg-white rounded">Year 1 Draw $225M</div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Excess Revenue Allocation</h3>
              <p>Boundary Waters Mining Alternative and Distribution Infrastructure allocations</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Interactive Funding Calculator</h3>
              <p>8 surcharge sliders + Projected Impact panel + Reset</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Perpetual Endowment</h3>
              <p>Total Principal $5.0B, Annual Draw 4.5% = $225M, Greenhouses Funded 1,200</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">50-Year Endowment Projections</h3>
              <p>Projection chart</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Financial Projection Engine v4.1</h3>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Financial Resilience / Stress Tests</h3>
              <p>99%+ Solvency badge</p>
            </section>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title="⛏️ Twin Metals Alternative"
          accent="rose"
          badge="Boundary Waters"
          defaultOpen={false}
        >
          <div className="space-y-6 pt-2">
            <section>
              <h3 className="text-lg font-semibold">Boundary Waters Alternative</h3>
              <p>Twin Metals Dilemma, Foreign Ownership, What Leaves MN vs What MN Gets</p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded">0.4% MN Tax Rate</div>
              <div className="p-4 bg-red-50 rounded">0% To State Fund</div>
              <div className="p-4 bg-red-50 rounded">50% Profits to Chile</div>
              <div className="p-4 bg-red-50 rounded">20-25 Years Then Gone</div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Town-by-town comparisons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-3 bg-slate-50 rounded">Ely</div>
                <div className="p-3 bg-slate-50 rounded">Babbitt</div>
                <div className="p-3 bg-slate-50 rounded">Hibbing</div>
                <div className="p-3 bg-slate-50 rounded">Tower</div>
                <div className="p-3 bg-slate-50 rounded">Virginia</div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Summary comparison stats</h3>
              <p>
                Twin Metals 1,500 temporary vs Greenhouse 1,248 permanent; 960K sqft; 38.4M lbs;
                $53.8M revenue; $81.6M construction; $42.2M net savings
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Gaia Commons Alternative (100% Minnesota-Owned)</h3>
              <p>Comparison table (11 rows)</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Labor Transition Program</h3>
              <p>Coal 43K, Oil & Gas 1.2M, Pipeline 125K, Auto ICE 180K</p>
            </section>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title="🌍 Climate Impact"
          accent="violet"
          badge="NASA/NOAA Validated"
          defaultOpen={false}
        >
          <div className="space-y-6 pt-2">
            <section>
              <h3 className="text-lg font-semibold">Job Creation & Economic Impact</h3>
              <p>Multi-scale tabs</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Global Regeneration Project</h3>
              <p>3.4M jobs, 130.9M coalition, 54.5% electorate, 1000:1 ratio</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Tiered Carbon Pricing</h3>
              <div className="flex gap-3">
                <div className="p-2 bg-slate-100 rounded">$25/ton</div>
                <div className="p-2 bg-slate-100 rounded">$75/ton</div>
                <div className="p-2 bg-slate-100 rounded">$150/ton</div>
                <div className="p-2 bg-slate-100 rounded">$200/ton</div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Political Coalition</h3>
              <p>7 group cards</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Environmental Impact</h3>
              <p>Multi-scale tabs</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Model Calibration & Validation</h3>
              <p>Calibration accuracy 5/5, planetary boundaries</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Historical Validation Data</h3>
              <p>2015-2024 dual-axis chart</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Advanced Modeling</h3>
              <p>Monte Carlo, Scenario Comparison, Optimization Targets, Sensitivity Analysis</p>
            </section>
          </div>
        </CollapsibleCard>

        <CollapsibleCard
          title="⚖️ Legal & Ballot Drive"
          accent="cyan"
          badge="2026 Ballot Initiative"
          defaultOpen={false}
        >
          <div className="space-y-6 pt-2">
            <section>
              <h3 className="text-lg font-semibold">Accountability & Transparency</h3>
              <p>Transparency features + Accountability mechanisms</p>
            </section>

            <section className="bg-amber-50 p-4 rounded">
              <h4 className="font-semibold">Why Traditional Systems Fail</h4>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Political Roadmap</h3>
              <p>Districts: MN-01 through MN-08</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Coalition Partners</h3>
              <p>Tier 1 Core + Tier 2 Strategic + Tier 3 Corporate</p>
            </section>

            <section>
              <a
                href="/ballot-presentation"
                className="inline-block px-4 py-2 bg-cyan-500 text-white rounded"
              >
                2026 Ballot Initiative Presentation
              </a>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Governance Principles</h3>
              <div className="flex gap-3">
                <div className="p-2 bg-slate-100 rounded">Democratic Governance</div>
                <div className="p-2 bg-slate-100 rounded">Planetary Boundaries</div>
                <div className="p-2 bg-slate-100 rounded">2026 Ballot Initiative</div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Share & Spread the Word</h3>
              <p>Social buttons, URL copy, QR code</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Stay Updated</h3>
              <p>Email subscribe form</p>
            </section>
          </div>
        </CollapsibleCard>

        {/* Footer - stays outside all CollapsibleCards */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          © Gaia Commons Council — 2026
        </footer>
      </div>
    </CollapsibleProvider>
  );
}
EOF

git add "$FILE"
git commit -m "feat(dashboard): restructure into 7 top-level CollapsibleCards"
git push -u origin "$BRANCH"

echo "Patch applied, committed, and pushed to branch: $BRANCH"
echo "Next: open a PR with the title and body provided separately."
EOF
