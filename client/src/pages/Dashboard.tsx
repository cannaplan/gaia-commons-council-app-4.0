import React from "react";
import ClusterBuilder from "./ClusterBuilder";
import CollapsibleCardProblem
- The Vite/esbuild error points to an unexpected "export" at client/src/pages/Dashboard.tsx:28. Inspecting the file shows a duplicate export/default function declaration and several malformed/mismatched from "../components/CollapsibleCard";
import {
  useHealth,
  usePilotStats,
  useEndowmentStats,
  useTimeline,
  useScaleProjections,
} from "../hooks/use-gaia";

function formatNumber(value: number | undefined | null) {
  if (value === undefined || value === null) return "—";
  return value.toLocaleString("en-US");
}

function formatCurrencyMillions(value: string | undefined | null) {
  if (!value) return " JSX tags. The duplicate export causes a syntax error and the broken JSX will likely cause further build failures.

Fix
- Remove the duplicate export/function and fix the JSX structure so the component has a single valid default export and well-formed JSX.

Suggested replacement for client/src/pages/Dashboard.tsx
- Replace the current file with this corrected, single-export component (keeps the same hooks and UI structure but with valid JSX and only one default export):

```tsx
import React from "react—";
  return `$${value}`;
}

export default function Dashboard(): JSX.Element {
  const { data: health } = useHealth();
  const { data: pilot } = usePilotStats();
  const { data: endowment } = useEndowmentStats();
  const { data: timeline } = useTimeline();
  const { data: scaleProjections } = useScaleProjections();

  const statewide = scaleProjections?.find((item) => item.scale === "statewide");

 ";
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

function formatCurrencyMillions(value: string | return (
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
          <button role="tab" aria-selected="true" style={{ padding: "8px 12px" }}>
            Overview
          </ undefined) {
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
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CollapsibleCard
            className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl hover:shadow-2button>
          <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
            Investor
          </button>
          <button role="tab" aria-selected="false" style={{ padding: "8px 12px" }}>
            Timeline
          </button>
        </div>

        <CollapsibleCard id="statewide" title="Statewide Scale">
          <div style={{ display: "grid", gap: 10 }}>
           xl <"
div           >
 title             =" StudentsExample:"
 <         strong />
>{       format </Numberdiv(state>
wide     ?. </studentsdiv)}</>

strong     >
 <           main </ classdivName>
="           dashboard <"div style>
={{              padding Green:houses :16 < }}>
strong       >{ <formathNumber1(state stylewide={{?. margingreenBottomhouses:)}</ strong12>
 }}>           Ga </iadiv Dashboard>
</           h <1div>

>
                     < Schoolsdiv:
 <         strong role>{="formattabNumberlist(state"
wide         ?. ariaschools-label)}</="strongDashboard>
 sections           "
 </         div style>
={{            display <:div ">
flex             ", Square gap feet::  <12strong,>{ marginformatBottomNumber:(state wide20?.,sq flexftWrap)}</:strong ">
wrap           " </ }}
div       >
 >
                     <button role=" <tabdiv">
 aria             -selected Meals=" pertrue day": style <={{strong padding>{:format "Number8(statepxwide ?.12mepxals"Per }}>
Day           )}</ Overviewstrong
>
                     </ </buttondiv>
>
                     < <buttondiv role>
="             tab CO"₂ aria avoided-selected annually=":false <"strong style>{={{format paddingNumber:(state "wide8?.pxco 212Tpxons"Annual }}>
)}</           strong Investor>

                     </ </divbutton>
>
                   </ <divbutton>
 role       =" </tabColl"apsible ariaCard-selected>

="       false <"Coll styleapsible={{Card padding id:=" "invest8orpx"  title12="pxInvestor" Dashboard }}>
">
                     Timeline <
div          style </={{button display>
:        " </griddiv",>

 gap       : < Coll10apsible }}>
Card            id="overview" title="Overview">
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

        < <Colldivapsible>CardEnd idowment=" sizestate:wide <"strong title>{="formatStateCurrencywideMillions Scale(end">
owment         ?. <sizediv)}</ stylestrong={{></ displaydiv:>
 "           grid <",div gap>:Annual  draw10: }}>
 <           strong <>{divformat>CurrencyStudentsMillions:(end <owmentstrong?.>{annualformat)}</Numberstrong(state></widediv?.>
students           )}</ <strongdiv></>Pdivilot>
 schools           : < <divstrong>>{GreenformathousesNumber:(p <ilotstrong?.>{schoolsformat)}</Numberstrong(state></widediv?.>
green           houses <)}</divstrong>P></ilotdiv students>
:            < <strongdiv>{>formatSchoolsNumber:(p <ilotstrong?.>{studentsformat)}</Numberstrong(state></widediv?.>
schools           )}</ <strongdiv></>Pdivilot>
 square            feet <:div <>strongSquare>{ feet: <strong>{formatNumber(statewide?.sqft)}</strong></div>
            <div>Meals per day: <strong>{formatNumber(statewide?.mealsPerDay)}</strong></div>
            <div>CO₂ avoided annually: <strong>{formatNumber(statewide?.co2TonsAnnual)}</strong></div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard id="investor" title="Investor Dashboard">
          <div style={{formatNumber(pilot?.sqft)}</strong></div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard id="timeline" title="Timeline">
          <div style={{ display: "grid", gap: 8 }}>
            {timeline && timeline.length > 0 ? (
              timeline.slice(0, 5).map((item: any) => (
                <div key={item.id ?? `${item.year}-${item.event}`}>
                  <strong>{item.year display: "grid", gap: 10 }}>
            <div>Endowment size: <strong>{formatCurrencyMillions(endowment?.size)}</strong></div>
            <div>Annual draw: <strong>{formatCurrencyMillions(endowment?.annual)}</strong></div>
            <div>Pilot schools: <strong>{formatNumber(pilot?.schools)}</strong></div>
            <div>Pilot students: <strong>{formatNumber(pilot?.students)}</strong></div>
}</strong> — {item.event}
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
    </main>
  );
}
``            <div>Pilot square feet: <strong>{formatNumber(pilot?.sqft)}</strong></div>
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
     `

Why this fixes it
- Removes the duplicate "export default" and ensures there is only one exported function.
- Fixes malformed JSX (mismatched/misplaced closing tags and nested returns), so TypeScript/ESBuild can parse the file.
- Keeps the same data hooks and formatting helpers used by the rest of the app.

How to apply and verify
1. Replace the file at:
   https://github.com/cannaplan/gaia-commons-council-app- </4main.>
0   /blob <//div892>
d 96 );
b}
054``f`

077Notesa and00 followeb-ups1
b-6 Primarye error7 wasfb the8 duplicatee export8 atd line7 ~e280.f Afterdf applying0 thef replacement02 above/client,/src the/pages syntax/D errorashboard should.ts bex resolved
.
  - with There the were corrected multiple content malformed above/m.
ism2atched. JSX Commit tags and in push the the original change file on; your the branch suggested / replacement PR fixes.
 those3 so. the Run file the is build synt locallyact toically confirm correct:
.
  - - After npm committing ci,
 run   the - build npm locally run or build in
 CI  :
 or  matching - scripts npm ( cipn &&pm npm/y runarn build) ( usedor in yarn your && CI yarn.
 build4)
.  Re --run the CI job.

 If TypeScript or lint errors appear, fix them as indicated by the compiler output.
- If you intended different content/children inside CollapsibleCard or different layout, reinsert those elements ensuring tags are balanced and only one default export exists.

If you want, I can prepare a git patch/PR with this file change (include the commit message) or point to the exact lines to edit.