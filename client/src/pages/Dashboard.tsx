Rewrite client/src/pages/Dashboard.tsx completely from scratch. The current file has JSX tag mismatch errors (mismatched Card, CardContent, and motion.div closing tags around line 989). 

Your job: produce a clean, valid, error-free version of Dashboard.tsx that:

1. Keeps ALL existing imports at the top exactly as they are
2. Keeps the CollapsibleProvider import: import CollapseAllToggle, { CollapsibleProvider } from "@/components/CollapseAllToggle";
3. Keeps the CollapsibleCard import: import CollapsibleCard from "@/components/CollapsibleCard";
4. Keeps the hero section (title + 4 animated stat counter cards) OUTSIDE and ABOVE all CollapsibleCards
5. Places <CollapseAllToggle className="mb-6" /> between the hero and the first card
6. Wraps the entire return body in <CollapsibleProvider>...</CollapsibleProvider>
7. Organizes ALL content into exactly 7 CollapsibleCards with defaultOpen={false}
8. Keeps the footer OUTSIDE and BELOW all CollapsibleCards
9. Every single JSX tag is properly opened and closed in the correct order — no mismatches
10. Does NOT delete or modify any existing component logic, hooks, state, or data — only restructures the JSX layout

The 7 cards in order:
- <CollapsibleCard title="🌱 Pilot Program" accent="emerald" badge="Minnesota 2026" defaultOpen={false}>
- <CollapsibleCard title="🏗️ Greenhouse Initiative" accent="blue" badge="1,200 Greenhouses" defaultOpen={false}>
- <CollapsibleCard title="🪶 Tribal Partnerships" accent="amber" badge="Leech Lake Nation" defaultOpen={false}>
- <CollapsibleCard title="💰 Endowment & Financials" accent="amber" badge="$5B Target" defaultOpen={false}>
- <CollapsibleCard title="⛏️ Twin Metals Alternative" accent="rose" badge="Boundary Waters" defaultOpen={false}>
- <CollapsibleCard title="🌍 Climate Impact" accent="violet" badge="NASA/NOAA Validated" defaultOpen={false}>
- <CollapsibleCard title="⚖️ Legal & Ballot Drive" accent="cyan" badge="2026 Ballot Initiative" defaultOpen={false}>

Each card's children wrapped in: <div className="space-y-6 pt-2">

Card contents — move existing sections into the correct card:
Card 1 (Pilot Program): School Clusters (replace "School 1/2/3" with "Sites to be confirmed upon program launch"), K-12 NGSS Curriculum, Growth Pathway, ClusterBuilder link
Card 2 (Greenhouse Initiative): Multi-Scale Deployment tabs, Construction Phase Jobs, Specialty Crops card, Environmental Protection card, Impact Calculator, Community Comparison Tool
Card 3 (Tribal Partnerships): Leech Lake / Tribal Partnerships section, Leech Lake Excess Revenue Allocation card only
Card 4 (Endowment & Financials): All 8 Funding Source cards, 4 summary stat cards, Boundary Waters + Distribution Infrastructure excess allocation cards, Interactive Funding Calculator sliders, Perpetual Endowment card, 50-Year chart, Financial Projection Engine, Stress Tests
Card 5 (Twin Metals): Boundary Waters Alternative section, 4 red stat cards, 5 town cards (Ely/Babbitt/Hibbing/Tower/Virginia), summary stats row, Gaia Commons comparison table, Labor Transition Program
Card 6 (Climate Impact): Job Creation tabs, Global Regeneration Project, Tiered Carbon Pricing, Political Coalition, Environmental Impact tabs, Model Calibration section, Historical Validation chart, Advanced Modeling / Monte Carlo
Card 7 (Legal & Ballot): Accountability & Transparency, Why Traditional Systems Fail card, Political Roadmap 8 districts, Coalition Partners tiers, Ballot Presentation link, 3 governance cards, Share section, Email subscribe

CRITICAL RULES:
- Validate every JSX tag pair before outputting — every opening tag must have a matching closing tag in correct order
- Do not introduce any new components or imports not already in the file
- Do not use Card, CardContent, or any shadcn Card components to wrap CollapsibleCard sections — use plain <div> only
- Each CollapsibleCard must close with </CollapsibleCard> immediately after its closing </div>
- Push to branch feat/dashboard-restructure-7-cards and update the existing open PR
