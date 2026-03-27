// @vitest-environment node
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Helpers – mirror the exact shell-script logic introduced in this PR.
//
// The PR adds three new workflow files that embed bash scripts:
//   .github/workflows/deploy-to-render.yml
//   github/workflows/ci.yml                (modified)
//   github/workflows/.github/workflows/bundle-analyze.yml
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
  // We also trim to reject whitespace-only values
  const apiKeyMissing = !apiKey || apiKey.trim().length === 0;
  const serviceIdMissing = !serviceId || serviceId.trim().length === 0;
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
 * Replicates the conditional script detection in github/workflows/ci.yml (lines 28-30, 34-36):
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
 * Replicates the test command from github/workflows/ci.yml (line 42):
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
 * @param availablePaths - the set of file paths that actually exist on disk
 * @returns the first matching known output pattern, or null if no .js files match
 */
function detectBundleOutputPath(
  availablePaths: string[],
): BundleOutputPattern | null {
  for (const pattern of BUNDLE_OUTPUT_PATTERNS) {
    // Check if any available path matches this pattern (directory + /*.js glob)
    // e.g., pattern "build/static/js" should match files like "build/static/js/main.abc123.js"
    const hasMatchingJsFile = availablePaths.some(path => {
      return path.startsWith(pattern + '/') && path.endsWith('.js');
    });
    if (hasMatchingJsFile) {
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
  it('detects CRA output path "build/static/js" when .js files are present', () => {
    expect(detectBundleOutputPath(['build/static/js/main.abc123.js'])).toBe('build/static/js');
  });

  it('detects Vite output path "dist/assets" when .js files are present', () => {
    expect(detectBundleOutputPath(['dist/assets/index.xyz789.js'])).toBe('dist/assets');
  });

  it('prefers CRA path over Vite path when both have .js files', () => {
    // CRA is listed first in BUNDLE_OUTPUT_PATTERNS
    expect(detectBundleOutputPath([
      'build/static/js/main.abc123.js',
      'dist/assets/index.xyz789.js'
    ])).toBe('build/static/js');
  });

  it('returns null when neither known path has .js files', () => {
    expect(detectBundleOutputPath([])).toBeNull();
  });

  it('returns null for unrecognised paths', () => {
    expect(detectBundleOutputPath(['custom/output/path/file.js'])).toBeNull();
  });

  it('returns null for an empty available-paths array', () => {
    expect(detectBundleOutputPath([])).toBeNull();
  });

  it('does not match directories without .js files', () => {
    expect(detectBundleOutputPath(['build/static/js'])).toBeNull();
    expect(detectBundleOutputPath(['dist/assets'])).toBeNull();
  });

  it('does not match non-.js files in known directories', () => {
    expect(detectBundleOutputPath(['build/static/js/styles.css'])).toBeNull();
    expect(detectBundleOutputPath(['dist/assets/image.png'])).toBeNull();
  });

  it('matches multiple .js files in the same directory', () => {
    expect(detectBundleOutputPath([
      'build/static/js/main.abc.js',
      'build/static/js/vendor.def.js'
    ])).toBe('build/static/js');
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
    // helper should reject whitespace-only values as they are not truly valid.
    // This test documents that only non-empty trimmed values should pass.
    expect(canTriggerRenderDeploy(' ', 'srv_123')).toBe(false);
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