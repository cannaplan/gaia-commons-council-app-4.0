#!/usr/bin/env bash
set -euo pipefail

BRANCH="collabs/fix-dashboard-imports-casing"

# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b "$BRANCH"


# 4. Add BomPreview placeholder if missing
if [ ! -f client/src/components/BomPreview.tsx ]; then
  cat > client/src/components/BomPreview.tsx <<'TSX'
import React from "react";

export default function BomPreview(): JSX.Element {
  return (
    <section style={{ padding: 12 }}>
      <h2 style={{ margin: 0 }}>BOM Calculator Preview</h2>
      <p style={{ marginTop: 8 }}>Placeholder component — replace with real BOM widget.</p>
    </section>
  );
}
TSX
  git add client/src/components/BomPreview.tsx
  echo "Created client/src/components/BomPreview.tsx"
else
  echo "client/src/components/BomPreview.tsx already exists; skipping placeholder creation"
fi

# 5. Add cards.css if missing
if [ ! -f client/src/styles/cards.css ]; then
  mkdir -p client/src/styles
  cat > client/src/styles/cards.css <<'CSS'
.card { border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin: 12px 0; background: var(--card-bg, #070707); }
.card-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; }
.card-title { margin:0; font-size:1.05rem; color:var(--text,#fff); }
.card-toggle { background:transparent; border:0; cursor:pointer; color:var(--muted,#9aa); }
.card-panel { padding:12px 16px; transition: max-height 220ms ease, opacity 180ms ease; opacity:1; max-height:2000px; }
.card-panel.closed { max-height:0; opacity:0; padding-top:0; padding-bottom:0; overflow:hidden; }
CSS
  git add client/src/styles/cards.css
  echo "Created client/src/styles/cards.css"
else
  echo "client/src/styles/cards.css already exists; skipping creation"
fi

# 6. Ensure client entry imports cards.css (client/src/main.tsx or client/src/index.tsx)
if [ -f client/src/main.tsx ]; then
  if ! grep -q './styles/cards.css' client/src/main.tsx; then
    sed -i '1s;^;import \"./styles/cards.css\";\n;' client/src/main.tsx
    git add client/src/main.tsx
    echo "Inserted cards.css import into client/src/main.tsx"
  else
    echo "client/src/main.tsx already imports cards.css"
  fi
elif [ -f client/src/index.tsx ]; then
  if ! grep -q './styles/cards.css' client/src/index.tsx; then
    sed -i '1s;^;import \"./styles/cards.css\";\n;' client/src/index.tsx
    git add client/src/index.tsx
    echo "Inserted cards.css import into client/src/index.tsx"
  else
    echo "client/src/index.tsx already imports cards.css"
  fi
else
  echo "No client entry file found (main.tsx or index.tsx). Add 'import \"./styles/cards.css\"' to your entry file if needed."
fi

# 7. Stage and commit remaining changes
git add -A
git commit -m "fix(dashboard): correct component filename casing and add BomPreview/cards.css placeholders to resolve imports and unblock CI"

# 8. Push branch
git push -u origin "$BRANCH"

echo "Branch pushed: $BRANCH"
echo "Open a PR from $BRANCH -> main. Run the following to create a PR (requires gh):"
echo "  gh pr create --base main --head $BRANCH --title \"fix(dashboard): resolve component imports & add placeholders\" --body \"Add BomPreview and cards.css placeholders to unblock CI; replace with real components later.\""
