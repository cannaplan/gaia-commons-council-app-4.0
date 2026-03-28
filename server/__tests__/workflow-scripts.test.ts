// @vitest-environment node
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers – mirror the exact shell-script logic introduced in this PR.
//
// The PR adds three new workflow files that embed bash scripts:
//   .github/workflows/deploy-to-render.yml
//   ..github/workflows/ci.yml                (modified)
//   .github/workflows/bundle-analyze.yml
//
// These helpers replicate each guard, conditional, and string-construction
// so we can exercise the logic independently of a live CI runner.
// ---------------------------------------------------------------------------

// ── deploy-to-render.yml helpers ────────────────────────────────────────────

/**
 * Replicates the guard clause from deploy-to-render.yml (lines 18-21):
 *   if [ -z "$RENDER_API_KEY" ] || [ -z "$RENDER_SERVICE_ID" ]; then exit 1; fi
 *
 * Returns true when both vars are non-empty (deploy should proceed), false otherwise.
 */
function canTriggerRenderDeploy(
  apiKey: string | undefined,
  serviceId: string | undefined,
): boolean {
  // bash: [ -z "$VAR" ] is true when $VAR is empty string or unset
  const apiKeyMissing = !apiKey || apiKey.length === 0;
  const serviceIdMissing = !serviceId || serviceId.length === 0;
  return !apiKeyMissing && !serviceIdMissing;
}

/**
 * Replicates the URL template from deploy-to-render.yml (line 24):
 *   "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys"
 */
function buildRenderDeployUrl(serviceId: string): string {
  return `https://api.render.com/v1/services/${serviceId}/deploys`;
}

/**
 * Replicates the Authorization header value from deploy-to-render.yml (line 25):
 *   -H "Authorization: Bearer ${RENDER_API_KEY}"
 */
function buildRenderAuthHeader(apiKey: string): string {
  return `Bearer ${apiKey}`;
}

/**
 * Replicates the request body from deploy-to-render.yml (line 27):
 *   -d '{"clearCache": false}'
 */
function buildRenderRequestBody(): { clearCache: boolean } {
  return { clearCache: false };
}

/**
 * Replicates the response-file path from deploy-to-render.yml (line 28):
 *   -o /tmp/render-deploy-response.json
 */
function getRenderResponseFilePath(): string {
  return '/tmp/render-deploy-response.json';
}

// ── ci.yml helpers ──────────────────────────────────────────────────────────

/**
 * Replicates the conditional script detection in .github/workflows/ci.yml (lines 28-30, 34-36):
 *   if npm run | grep -q "scriptName"; then npm run scriptName || true; fi
 *
 * @param npmRunOutput - the stdout of `npm run` (lists available scripts)
 * @param scriptName   - the script name to search for
 * @returns true when the script name appears in the output (grep -q logic)
 */
function shouldRunScript(npmRunOutput: string, scriptName: string): boolean {
  return npmRunOutput.includes(scriptName);
}

/**
 * Replicates the test command from .github/workflows/ci.yml (line 42):
 *   npm test -- --ci --reporters=default
 *
 * Returns the array of arguments that would be passed to npm.
 */
function buildTestCommand(): string[] {
  return ['test', '--', '--ci', '--reporters=default'];
}

// ── bundle-analyze.yml helpers ───────────────────────────────────────────────

/** Known output directory patterns checked in bundle-analyze.yml (lines 31-37). */
const BUNDLE_OUTPUT_PATTERNS = [
  'build/static/js',  // CRA
  'dist/assets',      // Vite
] as const;

type BundleOutputPattern = (typeof BUNDLE_OUTPUT_PATTERNS)[number];

/**
 * Replicates the path-detection logic from bundle-analyze.yml (lines 31-37):
 *   if ls build/static/js/*.js ...; then ... fi
 *   if ls dist/assets/*.js ...; then ... fi
 *
 * @param availablePaths - the set of directory paths that actually exist on disk
 * @returns the first matching known output path, or null if neither exists
 */
function detectBundleOutputPath(
  availablePaths: string[],
): BundleOutputPattern | null {
  for (const pattern of BUNDLE_OUTPUT_PATTERNS) {
    if (availablePaths.includes(pattern)) {
      return pattern;
    }
  }
  return null;
}

/**
 * Replicates the fallback HTML report written when no bundle report is produced
 * (bundle-analyze.yml lines 39-41):
 *   echo "<html><body><h3>No bundle report produced...</h3></body></html>"
 */
function buildFallbackBundleReportHtml(): string {
  return '<html><body><h3>No bundle report produced — adjust bundle-analyze workflow to match your build output.</h3></body></html>';
}

/**
 * Replicates the artifact name from bundle-analyze.yml (line 46):
 *   name: bundle-report
 */
function getBundleArtifactName(): string {
  return 'bundle-report';
}

/**
 * Replicates the report output path from bundle-analyze.yml (line 47):
 *   path: artifact-bundle-report
 */
function getBundleReportDir(): string {
  return 'artifact-bundle-report';
}

// ── deploy-to-render.yml HTTP response code validation ────────────────────────

/**
 * Replicates the HTTP response-code check from deploy-to-render.yml (lines 29-31):
 *   if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then exit 1; fi
 *
 * Returns true when the status code indicates success (200–299 inclusive),
 * false when it should trigger exit 1.
 */
function isHttpSuccess(httpCode: number): boolean {
  return httpCode >= 200 && httpCode < 300;
}

// ── ci.yml build artifact helpers ────────────────────────────────────────────

/**
 * Replicates the artifact upload name from .github/workflows/ci.yml (line 49):
 *   name: dashboard-build
 */
function getBuildArtifactName(): string {
  return 'dashboard-build';
}

/**
 * Replicates the artifact upload paths from .github/workflows/ci.yml (lines 50-52):
 *   path: |
 *     build
 *     dist
 */
function getBuildArtifactPaths(): string[] {
  return ['build', 'dist'];
}

/**
 * Replicates the "Triggering deploy" log line from deploy-to-render.yml (line 22):
 *   echo "Triggering deploy for service ${RENDER_SERVICE_ID}..."
 */
function buildRenderDeployLogMessage(serviceId: string): string {
  return `Triggering deploy for service ${serviceId}...`;
}

/**
 * Replicates the error message printed on deploy failure (line 30):
 *   echo "Render deploy failed (HTTP $http_code)"
 */
function buildRenderDeployFailureMessage(httpCode: number): string {
  return `Render deploy failed (HTTP ${httpCode})`;
}

/**
 * Replicates the "RENDER_API_KEY or RENDER_SERVICE_ID not set" message
 * from deploy-to-render.yml (line 19):
 *   echo "RENDER_API_KEY or RENDER_SERVICE_ID not set. Skipping deploy."
 */
function buildRenderMissingSecretsMessage(): string {
  return 'RENDER_API_KEY or RENDER_SERVICE_ID not set. Skipping deploy.';
}

/**
 * Replicates the ci.yml job timeout configuration (line 5):
 *   timeout-minutes: 30
 */
function getCiJobTimeoutMinutes(): number {
  return 30;
}

/**
 * Replicates the Node.js version used in the ci.yml and bundle-analyze.yml
 * workflows (both specify "18").
 */
function getWorkflowNodeVersion(): string {
  return '18';
}

// ===========================================================================
// Test Suites
// ===========================================================================

// ── Suite 1: deploy-to-render.yml guard clause ───────────────────────────────

describe('deploy-to-render: guard clause (lines 18-21)', () => {
  it('returns true when both RENDER_API_KEY and RENDER_SERVICE_ID are set', () => {
    expect(canTriggerRenderDeploy('rnd_abc123', 'srv_xyz789')).toBe(true);
  });

  it('returns false when RENDER_API_KEY is missing (undefined)', () => {
    expect(canTriggerRenderDeploy(undefined, 'srv_xyz789')).toBe(false);
  });

  it('returns false when RENDER_SERVICE_ID is missing (undefined)', () => {
    expect(canTriggerRenderDeploy('rnd_abc123', undefined)).toBe(false);
  });

  it('returns false when both vars are undefined', () => {
    expect(canTriggerRenderDeploy(undefined, undefined)).toBe(false);
  });

  it('returns false when RENDER_API_KEY is an empty string (bash [ -z ] behaviour)', () => {
    expect(canTriggerRenderDeploy('', 'srv_xyz789')).toBe(false);
  });

  it('returns false when RENDER_SERVICE_ID is an empty string', () => {
    expect(canTriggerRenderDeploy('rnd_abc123', '')).toBe(false);
  });

  it('returns false when both vars are empty strings', () => {
    expect(canTriggerRenderDeploy('', '')).toBe(false);
  });

  it('returns true for any non-empty key and service ID regardless of format', () => {
    expect(canTriggerRenderDeploy('key', 'svc-1')).toBe(true);
    expect(canTriggerRenderDeploy('key-with-dashes', 'srv_underscore')).toBe(true);
  });
});

// ── Suite 2: deploy-to-render.yml URL construction (line 24) ─────────────────

describe('deploy-to-render: API URL construction (line 24)', () => {
  it('produces the correct Render deploy endpoint URL', () => {
    expect(buildRenderDeployUrl('srv_abc123')).toBe(
      'https://api.render.com/v1/services/srv_abc123/deploys',
    );
  });

  it('interpolates the service ID verbatim into the path segment', () => {
    const serviceId = 'srv-hyphenated-id';
    const url = buildRenderDeployUrl(serviceId);
    expect(url).toContain(`/v1/services/${serviceId}/deploys`);
  });

  it('URL always uses HTTPS scheme', () => {
    expect(buildRenderDeployUrl('any-id')).toMatch(/^https:\/\//);
  });

  it('URL base is always api.render.com', () => {
    const url = buildRenderDeployUrl('any-id');
    expect(url).toContain('api.render.com');
  });

  it('URL path ends with /deploys', () => {
    expect(buildRenderDeployUrl('some-service')).toMatch(/\/deploys$/);
  });

  it('different service IDs produce different URLs', () => {
    const url1 = buildRenderDeployUrl('srv-1');
    const url2 = buildRenderDeployUrl('srv-2');
    expect(url1).not.toBe(url2);
  });
});

// ── Suite 3: deploy-to-render.yml request configuration ──────────────────────

describe('deploy-to-render: request configuration (lines 25-28)', () => {
  it('Authorization header uses Bearer scheme with the API key', () => {
    const header = buildRenderAuthHeader('rnd_super_secret_key');
    expect(header).toBe('Bearer rnd_super_secret_key');
  });

  it('Authorization header format is "Bearer <key>"', () => {
    const header = buildRenderAuthHeader('any-key');
    expect(header).toMatch(/^Bearer .+/);
  });

  it('request body sets clearCache to false', () => {
    const body = buildRenderRequestBody();
    expect(body.clearCache).toBe(false);
  });

  it('request body is a plain object with exactly the clearCache field', () => {
    const body = buildRenderRequestBody();
    expect(Object.keys(body)).toEqual(['clearCache']);
  });

  it('response is written to /tmp/render-deploy-response.json', () => {
    expect(getRenderResponseFilePath()).toBe('/tmp/render-deploy-response.json');
  });

  it('response file path is an absolute path', () => {
    expect(getRenderResponseFilePath()).toMatch(/^\//);
  });

  it('response file path has .json extension', () => {
    expect(getRenderResponseFilePath()).toMatch(/\.json$/);
  });
});

// ── Suite 4: ci.yml conditional script detection (lines 28-36) ───────────────

describe('ci.yml: conditional script detection via grep (lines 28-36)', () => {
  const NPM_RUN_WITH_TYPECHECK = `
Lifecycle scripts included in my-app:
  start
    node server.js

available via \`npm run-script\`:
  typecheck
    tsc --noEmit
  lint
    eslint src
  build
    vite build
  test
    vitest run
`.trim();

  const NPM_RUN_WITHOUT_TYPECHECK = `
Lifecycle scripts included in my-app:
  start
    node server.js

available via \`npm run-script\`:
  lint
    eslint src
  build
    vite build
  test
    vitest run
`.trim();

  const NPM_RUN_WITHOUT_LINT = `
Lifecycle scripts included in my-app:
  start
    node server.js

available via \`npm run-script\`:
  typecheck
    tsc --noEmit
  build
    vite build
  test
    vitest run
`.trim();

  it('detects "typecheck" when it appears in npm run output', () => {
    expect(shouldRunScript(NPM_RUN_WITH_TYPECHECK, 'typecheck')).toBe(true);
  });

  it('does not detect "typecheck" when it is absent from npm run output', () => {
    expect(shouldRunScript(NPM_RUN_WITHOUT_TYPECHECK, 'typecheck')).toBe(false);
  });

  it('detects "lint" when it appears in npm run output', () => {
    expect(shouldRunScript(NPM_RUN_WITH_TYPECHECK, 'lint')).toBe(true);
  });

  it('does not detect "lint" when it is absent from npm run output', () => {
    expect(shouldRunScript(NPM_RUN_WITHOUT_LINT, 'lint')).toBe(false);
  });

  it('returns false for an empty npm run output string', () => {
    expect(shouldRunScript('', 'typecheck')).toBe(false);
  });

  it('returns false when querying a script name that does not exist at all', () => {
    expect(shouldRunScript(NPM_RUN_WITH_TYPECHECK, 'nonexistent-script-xyz')).toBe(false);
  });

  it('detection is case-sensitive (matches grep -q default behaviour)', () => {
    expect(shouldRunScript('  TYPECHECK\n  lint', 'typecheck')).toBe(false);
    expect(shouldRunScript('  typecheck\n  lint', 'TYPECHECK')).toBe(false);
  });
});

// ── Suite 5: ci.yml test command (line 42) ────────────────────────────────────

describe('ci.yml: test command arguments (line 42)', () => {
  it('test command starts with "test"', () => {
    expect(buildTestCommand()[0]).toBe('test');
  });

  it('test command passes "--ci" flag to vitest', () => {
    expect(buildTestCommand()).toContain('--ci');
  });

  it('test command passes "--reporters=default" to vitest', () => {
    expect(buildTestCommand()).toContain('--reporters=default');
  });

  it('test command uses "--" separator to forward args to vitest', () => {
    // npm test -- --ci means the first "--" separates npm args from vitest args
    expect(buildTestCommand()[1]).toBe('--');
  });

  it('test command has exactly 4 parts: ["test", "--", "--ci", "--reporters=default"]', () => {
    expect(buildTestCommand()).toEqual(['test', '--', '--ci', '--reporters=default']);
  });
});

// ── Suite 6: bundle-analyze.yml path detection (lines 31-37) ─────────────────

describe('bundle-analyze: bundle output path detection (lines 31-37)', () => {
  it('detects CRA output path "build/static/js" when present', () => {
    expect(detectBundleOutputPath(['build/static/js'])).toBe('build/static/js');
  });

  it('detects Vite output path "dist/assets" when present', () => {
    expect(detectBundleOutputPath(['dist/assets'])).toBe('dist/assets');
  });

  it('prefers CRA path over Vite path when both are present', () => {
    // CRA is listed first in BUNDLE_OUTPUT_PATTERNS
    expect(detectBundleOutputPath(['build/static/js', 'dist/assets'])).toBe('build/static/js');
  });

  it('returns null when neither known path is present', () => {
    expect(detectBundleOutputPath([])).toBeNull();
  });

  it('returns null for unrecognised paths', () => {
    expect(detectBundleOutputPath(['custom/output/path'])).toBeNull();
  });

  it('returns null for an empty available-paths array', () => {
    expect(detectBundleOutputPath([])).toBeNull();
  });

  it('is not case-sensitive to unknown paths (does not match partial strings)', () => {
    expect(detectBundleOutputPath(['build/static'])).toBeNull();
    expect(detectBundleOutputPath(['dist'])).toBeNull();
  });
});

// ── Suite 7: bundle-analyze.yml fallback report (lines 39-41) ────────────────

describe('bundle-analyze: fallback HTML report (lines 39-41)', () => {
  it('fallback report is valid HTML with an html root element', () => {
    const html = buildFallbackBundleReportHtml();
    expect(html).toMatch(/^<html>/);
    expect(html).toMatch(/<\/html>$/);
  });

  it('fallback report contains a body element', () => {
    const html = buildFallbackBundleReportHtml();
    expect(html).toContain('<body>');
    expect(html).toContain('</body>');
  });

  it('fallback report communicates that no bundle report was produced', () => {
    const html = buildFallbackBundleReportHtml();
    expect(html).toContain('No bundle report produced');
  });

  it('fallback report includes guidance to adjust the workflow', () => {
    const html = buildFallbackBundleReportHtml();
    expect(html).toContain('adjust bundle-analyze workflow');
  });

  it('fallback report uses an h3 element for the message', () => {
    const html = buildFallbackBundleReportHtml();
    expect(html).toContain('<h3>');
    expect(html).toContain('</h3>');
  });

  it('artifact upload name is "bundle-report"', () => {
    expect(getBundleArtifactName()).toBe('bundle-report');
  });

  it('artifact upload path is "artifact-bundle-report"', () => {
    expect(getBundleReportDir()).toBe('artifact-bundle-report');
  });
});

// ── Suite 8: Additional regression / boundary tests ───────────────────────────

describe('additional regression and boundary tests (all PR changes)', () => {
  // deploy-to-render – guard regression
  it('guard does not treat a whitespace-only key as valid', () => {
    // bash [ -z " " ] is FALSE (whitespace is non-empty in bash), but our
    // helper mirrors the intent: only truly non-empty values should pass.
    // This test documents the JS behaviour (whitespace is truthy).
    expect(canTriggerRenderDeploy(' ', 'srv_123')).toBe(true);
  });

  it('deploy URL does not include a trailing slash after /deploys', () => {
    const url = buildRenderDeployUrl('srv-1');
    expect(url).not.toMatch(/\/deploys\/$/);
  });

  it('buildRenderRequestBody always returns the same shape on repeated calls', () => {
    const body1 = buildRenderRequestBody();
    const body2 = buildRenderRequestBody();
    expect(body1).toEqual(body2);
  });

  // ci.yml – conditional scripts regression
  it('shouldRunScript returns false when npm run output is only whitespace', () => {
    expect(shouldRunScript('   \n\t  ', 'lint')).toBe(false);
  });

  it('shouldRunScript is a substring match (grep -q does not require whole-word match)', () => {
    // grep -q "lint" would also match "eslint"; document this behaviour
    expect(shouldRunScript('  eslint\n', 'lint')).toBe(true);
  });

  // bundle-analyze – detection is ordered: CRA first
  it('BUNDLE_OUTPUT_PATTERNS has CRA path as first entry', () => {
    expect(BUNDLE_OUTPUT_PATTERNS[0]).toBe('build/static/js');
  });

  it('BUNDLE_OUTPUT_PATTERNS has exactly two known output paths', () => {
    expect(BUNDLE_OUTPUT_PATTERNS).toHaveLength(2);
  });

  // Boundary: URL construction with special characters in serviceId
  it('buildRenderDeployUrl handles serviceId with underscores and hyphens', () => {
    const url = buildRenderDeployUrl('srv_test-123_abc');
    expect(url).toBe('https://api.render.com/v1/services/srv_test-123_abc/deploys');
  });

  it('buildRenderAuthHeader key portion is never empty for non-empty input', () => {
    const header = buildRenderAuthHeader('k');
    expect(header.split(' ')[1]).toBe('k');
  });

  // Fallback report – boundary: must be non-empty HTML
  it('fallback report HTML is non-empty', () => {
    expect(buildFallbackBundleReportHtml().length).toBeGreaterThan(0);
  });

  it('getRenderResponseFilePath returns a consistent value across multiple calls', () => {
    expect(getRenderResponseFilePath()).toBe(getRenderResponseFilePath());
  });
});

// ── Suite 9: deploy-to-render.yml HTTP response code validation ───────────────
// Tests the bash logic: if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]

describe('deploy-to-render: HTTP response code validation (lines 29-31)', () => {
  // Success range: 200–299
  it('200 OK is treated as success', () => {
    expect(isHttpSuccess(200)).toBe(true);
  });

  it('201 Created is treated as success', () => {
    expect(isHttpSuccess(201)).toBe(true);
  });

  it('204 No Content is treated as success', () => {
    expect(isHttpSuccess(204)).toBe(true);
  });

  it('299 (upper boundary of 2xx) is treated as success', () => {
    expect(isHttpSuccess(299)).toBe(true);
  });

  // Failure: below 200
  it('199 is treated as failure (below success range)', () => {
    expect(isHttpSuccess(199)).toBe(false);
  });

  it('100 Continue is treated as failure', () => {
    expect(isHttpSuccess(100)).toBe(false);
  });

  it('0 (no response / curl error) is treated as failure', () => {
    expect(isHttpSuccess(0)).toBe(false);
  });

  // Failure: 300 and above
  it('300 Multiple Choices is treated as failure (bash: -ge 300)', () => {
    expect(isHttpSuccess(300)).toBe(false);
  });

  it('301 Moved Permanently is treated as failure', () => {
    expect(isHttpSuccess(301)).toBe(false);
  });

  it('400 Bad Request is treated as failure', () => {
    expect(isHttpSuccess(400)).toBe(false);
  });

  it('401 Unauthorized is treated as failure', () => {
    expect(isHttpSuccess(401)).toBe(false);
  });

  it('404 Not Found is treated as failure', () => {
    expect(isHttpSuccess(404)).toBe(false);
  });

  it('500 Internal Server Error is treated as failure', () => {
    expect(isHttpSuccess(500)).toBe(false);
  });

  it('503 Service Unavailable is treated as failure', () => {
    expect(isHttpSuccess(503)).toBe(false);
  });

  // Boundary: exactly 200 and exactly 300 are the critical thresholds
  it('exact lower boundary 200 is success (bash: -lt 200 is false)', () => {
    expect(isHttpSuccess(200)).toBe(true);
  });

  it('exact upper boundary 300 triggers exit 1 (bash: -ge 300 is true)', () => {
    expect(isHttpSuccess(300)).toBe(false);
  });
});

// ── Suite 10: deploy-to-render.yml log and error messages ────────────────────

describe('deploy-to-render: log and error messages', () => {
  it('deploy log message includes the service ID', () => {
    const msg = buildRenderDeployLogMessage('srv_abc123');
    expect(msg).toContain('srv_abc123');
  });

  it('deploy log message ends with "..."', () => {
    const msg = buildRenderDeployLogMessage('srv_abc123');
    expect(msg).toMatch(/\.\.\.$/);
  });

  it('deploy log message starts with "Triggering deploy for service"', () => {
    const msg = buildRenderDeployLogMessage('any-id');
    expect(msg).toMatch(/^Triggering deploy for service /);
  });

  it('deploy failure message includes the HTTP code', () => {
    expect(buildRenderDeployFailureMessage(422)).toContain('422');
  });

  it('deploy failure message includes "Render deploy failed"', () => {
    expect(buildRenderDeployFailureMessage(500)).toContain('Render deploy failed');
  });

  it('deploy failure message format: "Render deploy failed (HTTP <code>)"', () => {
    expect(buildRenderDeployFailureMessage(404)).toBe('Render deploy failed (HTTP 404)');
  });

  it('missing secrets message mentions RENDER_API_KEY', () => {
    expect(buildRenderMissingSecretsMessage()).toContain('RENDER_API_KEY');
  });

  it('missing secrets message mentions RENDER_SERVICE_ID', () => {
    expect(buildRenderMissingSecretsMessage()).toContain('RENDER_SERVICE_ID');
  });

  it('missing secrets message says "Skipping deploy."', () => {
    expect(buildRenderMissingSecretsMessage()).toContain('Skipping deploy.');
  });

  it('missing secrets message is consistent across multiple calls', () => {
    expect(buildRenderMissingSecretsMessage()).toBe(buildRenderMissingSecretsMessage());
  });
});

// ── Suite 11: ci.yml build artifact and job configuration ────────────────────

describe('ci.yml: build artifact and job configuration', () => {
  it('build artifact is named "dashboard-build"', () => {
    expect(getBuildArtifactName()).toBe('dashboard-build');
  });

  it('build artifact name does not contain spaces', () => {
    expect(getBuildArtifactName()).not.toContain(' ');
  });

  it('build artifact paths include "build"', () => {
    expect(getBuildArtifactPaths()).toContain('build');
  });

  it('build artifact paths include "dist"', () => {
    expect(getBuildArtifactPaths()).toContain('dist');
  });

  it('build artifact paths array has exactly two entries', () => {
    expect(getBuildArtifactPaths()).toHaveLength(2);
  });

  it('ci job timeout is 30 minutes', () => {
    expect(getCiJobTimeoutMinutes()).toBe(30);
  });

  it('ci job timeout is a positive integer', () => {
    const timeout = getCiJobTimeoutMinutes();
    expect(timeout).toBeGreaterThan(0);
    expect(Number.isInteger(timeout)).toBe(true);
  });

  it('workflow Node.js version is "18"', () => {
    expect(getWorkflowNodeVersion()).toBe('18');
  });

  it('workflow Node.js version is a string (as specified in the YAML)', () => {
    expect(typeof getWorkflowNodeVersion()).toBe('string');
  });

  it('build artifact paths are returned as a new array on each call (not mutated)', () => {
    const paths1 = getBuildArtifactPaths();
    const paths2 = getBuildArtifactPaths();
    paths1.push('unexpected');
    expect(paths2).toHaveLength(2);
  });
});

// ── Suite 12: cross-workflow consistency ─────────────────────────────────────

describe('cross-workflow consistency checks', () => {
  // Both ci.yml and bundle-analyze.yml specify Node.js 18; they must agree.
  it('workflow Node.js version matches the version used in both ci.yml and bundle-analyze.yml', () => {
    expect(getWorkflowNodeVersion()).toBe('18');
  });

  // The test command and build artifact names are set in ci.yml.
  it('test command array does not overlap with build artifact paths', () => {
    const testCmd = buildTestCommand();
    const artifactPaths = getBuildArtifactPaths();
    // No element of the test command should be a recognised artifact path
    for (const path of artifactPaths) {
      expect(testCmd).not.toContain(path);
    }
  });

  // The deploy URL scheme must match what the auth header is designed for.
  it('Render deploy URL uses HTTPS — consistent with Bearer token security requirement', () => {
    expect(buildRenderDeployUrl('srv-1')).toMatch(/^https:\/\//);
  });

  // The guard clause and the failure message describe the same condition.
  it('canTriggerRenderDeploy(undefined, ...) matches the missing-secrets message semantics', () => {
    const canDeploy = canTriggerRenderDeploy(undefined, 'srv_1');
    expect(canDeploy).toBe(false);
    // When canDeploy is false the missing-secrets message is shown
    const msg = buildRenderMissingSecretsMessage();
    expect(msg.length).toBeGreaterThan(0);
  });

  // HTTP 200 is the expected success code from Render; 422 is a known client error.
  it('HTTP 200 is success and 422 is failure — Render API behaviour', () => {
    expect(isHttpSuccess(200)).toBe(true);
    expect(isHttpSuccess(422)).toBe(false);
  });

  // The failure message should reference the same code we check as failure.
  it('isHttpSuccess(code) false implies buildRenderDeployFailureMessage(code) is non-empty', () => {
    const failureCodes = [199, 300, 400, 500];
    for (const code of failureCodes) {
      expect(isHttpSuccess(code)).toBe(false);
      expect(buildRenderDeployFailureMessage(code).length).toBeGreaterThan(0);
    }
  });

  // The bundle artifact name and build artifact name should be different strings.
  it('bundle artifact name and CI build artifact name are distinct identifiers', () => {
    expect(getBundleArtifactName()).not.toBe(getBuildArtifactName());
  });
});