#!/usr/bin/env bash
# Example script to trigger Render deploy via API.
# Usage in CI: RENDER_API_KEY and RENDER_SERVICE_ID must be set as environment variables.

set -euo pipefail

if [ -z "${RENDER_API_KEY:-}" ] || [ -z "${RENDER_SERVICE_ID:-}" ]; then
  echo "RENDER_API_KEY and RENDER_SERVICE_ID required."
  exit 1
fi

API_BASE="https://api.render.com/v1"
echo "Triggering deploy for ${RENDER_SERVICE_ID}"
curl -s -X POST "${API_BASE}/services/${RENDER_SERVICE_ID}/deploys" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"clearCache":false}' \
  -o /tmp/render-deploy.json -w "\nHTTP_CODE:%{http_code}\n"

HTTP=$(tail -n1 /tmp/render-deploy.json | sed -E 's/.*HTTP_CODE:([0-9]+).*/\1/')
if [ "$HTTP" -ge 200 ] && [ "$HTTP" -lt 300 ]; then
  echo "Render deploy created."
  cat /tmp/render-deploy.json | sed '$d'
else
  echo "Render API error (HTTP $HTTP)"
  cat /tmp/render-deploy.json
  exit 1
fi
