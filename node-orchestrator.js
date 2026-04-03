// Minimal Node.js orchestrator example (template) showing validation between two models.
// This is a local script you run; it does NOT call anything by itself without keys.
// Replace MODEL_A_ENDPOINT, MODEL_B_ENDPOINT, and add API keys in environment.

const fetch = require("node-fetch");

async function callModelA(prompt) {
  // Example: call model A (summary/generation)
  const res = await fetch(process.env.MODEL_A_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MODEL_A_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}

async function callModelB(payload) {
  // Example: call model B with structured output from A
  const res = await fetch(process.env.MODEL_B_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MODEL_B_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function validateAOutput(out) {
  // Enforce a schema: example requires `summary` string and `tags` array
  if (!out || typeof out.summary !== "string" || !Array.isArray(out.tags)) {
    throw new Error("Model A output validation failed");
  }
  return { summary: out.summary, tags: out.tags };
}

(async () => {
  try {
    const a = await callModelA("Summarize the following build logs and extract key error lines...");
    const validated = validateAOutput(a);
    const b = await callModelB({ summary: validated.summary, tags: validated.tags });
    console.log("Final result:", b);
  } catch (err) {
    console.error("Orchestration failed:", err);
    process.exit(1);
  }
})();
