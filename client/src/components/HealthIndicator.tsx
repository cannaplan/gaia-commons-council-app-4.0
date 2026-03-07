import { useHealth } from "@/hooks/useHealth";

export default function HealthIndicator() {
  const { data: health, isLoading } = useHealth();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1E2433] bg-[#141820]">
      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
      <span className="text-xs text-[#94A3B8]">
        {isLoading ? "..." : health?.status || "ok"}
      </span>
    </div>
  );
}
```

**Step 3** — Commit message:
```
fix: remove error state from HealthIndicator
```

---

## ✅ TASK 4 of 4 — Run the Copilot Restructure Prompt

**Step 1** — Go to your repo's Copilot tab:
```
https://github.com/cannaplan/gaia-commons-council-app-4.0
```

Click the **Copilot** tab at the top → click **New session** → click inside the text box.

**Step 2** — Paste this entire prompt and hit Enter:
```
Restructure client/src/pages/Dashboard.tsx to organize all content into 7 top-level CollapsibleCard sections. CollapsibleCard is at @/components/CollapsibleCard. CollapseAllToggle and CollapsibleProvider are at @/components/CollapseAllToggle. The CollapsibleProvider already wraps the return statement.

STEP 1: Add <CollapseAllToggle className="mb-6" /> immediately after the hero stats section (the 4 animated counter cards at the top) and before the first CollapsibleCard.

STEP 2: The hero section (title, subtitle, 4 stat counters) stays OUTSIDE all CollapsibleCards — always visible.

STEP 3: The footer stays OUTSIDE all CollapsibleCards — always visible.

STEP 4: Create exactly these 7 CollapsibleCards, all defaultOpen={false}. Wrap each card's children in <div className="space-y-6">. Do NOT modify any existing component code — only reorganize.

---

CARD 1: title="🌱 Pilot Program" accent="emerald" badge="Minnesota 2026"
Contains in order:
- Minnesota Pilot School Clusters section. CRITICAL FIX: Replace any text reading "School 1", "School 2", "School 3" or any numbered school placeholder with "Sites to be confirmed upon program launch".
- K-12 NGSS Curriculum section (4 grade band cards)
- Growth Pathway section (Pilot to Statewide to National to Global phase cards)
- Build Your Own Greenhouse Cluster button or link to the ClusterBuilder page

---

CARD 2: title="🏗️ Greenhouse Initiative" accent="blue" badge="1,200 Greenhouses"
Contains in order:
- Multi-Scale Deployment Dashboard (tabbed: Pilot / Statewide / National / Global)
- Construction Phase Jobs section (Northern MN Hubs grid + Statewide School Greenhouses grid + summary stats bar + key difference from mining note)
- Specialty Crops for All 330 School Districts info card (amber/orange)
- Environmental Protection Guarantee info card (green)
- Impact Calculator (interactive sliders)
- Community Comparison Tool

---

CARD 3: title="🪶 Tribal Partnerships" accent="amber" badge="Leech Lake Nation"
Contains in order:
- Tribal Partnerships / Leech Lake Band of Ojibwe section (Red Lake, Cass Lake-Bena, Nay Ah Shing communities, food sovereignty initiatives)
- Excess Revenue Allocation section showing only the Leech Lake Tribal Programs allocation card

---

CARD 4: title="💰 Endowment & Financials" accent="amber" badge="$5B Target"
Contains in order:
- Endowment Funding Sources section (all 8 funding source cards: Top 20 Local Corps, Pro Sports Franchises, Local Med/Ins, Out-State Corp/Med/Ins, Data/Online Retail, Out-of-Country Mining, Federal Government, Local Billionaires)
- 4 summary stat cards (Total Potential Revenue $9.2B, Core Endowment Target $5.0B, Excess Allocation $4.2B, Year 1 Draw $225M)
- Excess Revenue Allocation showing Boundary Waters Mining Alternative and Distribution Infrastructure cards (NOT Leech Lake — that is Card 3)
- Interactive Funding Calculator (all 8 surcharge sliders + Projected Impact panel + Reset button)
- Perpetual Endowment card (Total Principal $5.0B, Annual Draw 4.5% = $225M, Greenhouses Funded 1,200, Stable badge)
- 50-Year Endowment Projections chart
- Financial Projection Engine v4.1
- Financial Resilience / Stress Tests section (99%+ Solvency badge)

---

CARD 5: title="⛏️ Twin Metals Alternative" accent="rose" badge="Boundary Waters"
Contains in order:
- Boundary Waters Alternative section (Twin Metals Dilemma card, Foreign Ownership card, What Leaves MN vs What MN Gets bullet lists)
- 4 red stat cards (0.4% MN Tax Rate, 0% To State Fund, 50% Profits to Chile, 20-25 Years Then Gone)
- 5 town-by-town community comparison cards (Ely, Babbitt, Hibbing, Tower, Virginia)
- Summary comparison stats row (Twin Metals 1,500 temporary vs Greenhouse 1,248 permanent; 960K sqft; 38.4M lbs; $53.8M revenue; $81.6M construction; $42.2M net savings)
- Gaia Commons Alternative 100% Minnesota-Owned comparison table (all 11 rows)
- Labor Transition Program section (Coal 43K, Oil & Gas 1.2M, Pipeline 125K, Auto ICE 180K)

---

CARD 6: title="🌍 Climate Impact" accent="violet" badge="NASA/NOAA Validated"
Contains in order:
- Job Creation & Economic Impact section (multi-scale tabs)
- Global Regeneration Project section (3.4M jobs, 130.9M coalition, 54.5% electorate, 1000:1 ratio)
- Tiered Carbon Pricing section ($25/ton, $75/ton, $150/ton, $200/ton tier cards)
- Political Coalition section (7 group cards)
- Environmental Impact section (multi-scale tabs)
- Model Calibration & Validation section (maturity cards, calibration accuracy 5/5, planetary boundaries)
- Historical Validation Data chart (2015-2024 dual-axis)
- Advanced Modeling section (Monte Carlo, Scenario Comparison, Optimization Targets, Sensitivity Analysis)

---

CARD 7: title="⚖️ Legal & Ballot Drive" accent="cyan" badge="2026 Ballot Initiative"
Contains in order:
- Accountability & Transparency section (Transparency Features + Accountability Mechanisms)
- Why Traditional Systems Fail amber warning card
- Political Roadmap section (all 8 district cards MN-01 through MN-08)
- Coalition Partners section (Tier 1 Core + Tier 2 Strategic + Tier 3 Corporate)
- 2026 Ballot Initiative Presentation button or link
- 3 governance principle cards (Democratic Governance, Planetary Boundaries, 2026 Ballot Initiative)
- Share & Spread the Word section (all social buttons, URL copy, QR code)
- Stay Updated email subscribe section

---

GLOBAL RULES:
1. Do not delete, rewrite, or modify any existing component code. Move only.
2. Keep all existing classNames, props, Framer Motion animations, Recharts, and Tailwind styling exactly as-is.
3. Each CollapsibleCard body: wrap children in <div className="space-y-6 pt-2">
4. Branch name: feat/dashboard-restructure-7-cards
5. Use a single PR with all changes.
