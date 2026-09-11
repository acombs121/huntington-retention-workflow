/**
 * Verification harness for src/lib/assumptions.ts.
 *
 * The frontend has no test runner configured, so rather than add a dependency this
 * compiles the real shipped module to CommonJS and asserts its outputs against the
 * figures derived from Huntington's Q2 2026 Form 10-Q and FFIEC Call Report.
 * See docs/CITATIONS.md §4 for the provenance of every expected value below.
 *
 * Run:  npm test          (from frontend/)
 *   or: node scripts/verify-assumptions.mjs   (from anywhere)
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// Resolve everything relative to this file so the harness runs from any cwd.
const FRONTEND_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(FRONTEND_ROOT, 'src/lib/assumptions.ts');
// Project-local compiler; `npx tsc` resolves to an unrelated npm package.
const TSC = join(FRONTEND_ROOT, 'node_modules/.bin/tsc');

const out = mkdtempSync(join(tmpdir(), 'assumptions-'));

try {
  execSync(
    `"${TSC}" "${SRC}" --outDir "${out}" --module commonjs --target es2020 ` +
      `--moduleResolution node --skipLibCheck`,
    { stdio: 'inherit' },
  );

  const m = await import(join(out, 'assumptions.js'));
  const A = m.DEFAULT_ASSUMPTIONS;

  let passed = 0;
  const check = (name, actual, expected, tol) => {
    assert.ok(
      Math.abs(actual - expected) <= tol,
      `${name}: got ${actual}, expected ~${expected} (tolerance ${tol})`,
    );
    console.log(`  ok  ${name.padEnd(42)} ${actual}`);
    passed += 1;
  };
  const ok = (name) => {
    console.log(`  ok  ${name}`);
    passed += 1;
  };

  console.log('\nVerified constants (10-Q Table 8/25, Call Report RC-C)');
  check('TARGET_CRE_BOOK', m.TARGET_CRE_BOOK, 19.967e9, 1e6);
  check('LOADED_FTE_COST', m.LOADED_FTE_COST, 292302, 1);

  console.log('\nFunnel (defaults, owner-occupied included)');
  const f = m.computeFunnel(A);
  check('targetBook', f.targetBook, 33.298e9, 1e6);
  check('payoffVolume', f.payoffVolume, 7.492e9, 2e6);
  check('atRiskEquity', f.atRiskEquity, 0.899e9, 3e6);
  assert.ok(
    m.computeFunnel({ ...A, includeOwnerOccupied: false }).targetBook < f.targetBook,
    'excluding owner-occupied must shrink the target book',
  );
  ok('excluding owner-occupied shrinks the target book');

  console.log('\nYields');
  check('statedBlendedYield', m.statedBlendedYield(A), 0.0078, 1e-6);
  check('effectiveBlendedYield', m.effectiveBlendedYield(A), 0.0040916, 1e-6);

  // Schedule RC-T, HNB, quarter ended 2026-06-30. Personal trust ($44.581M) plus
  // investment management/advisory ($56.187M) fiduciary income is year-to-date at
  // six months; annualized over the managed assets in those same two categories
  // ($10.653B + $20.008B) it implies 65.7 bps.
  const RCT_IMPLIED_TIER2 = ((44.581 + 56.187) * 2) / (10.653e3 + 20.007704e3);
  check('RC-T implied advisory yield', RCT_IMPLIED_TIER2, 0.006573, 5e-6);
  assert.ok(
    A.tier2Bps <= RCT_IMPLIED_TIER2,
    `tier2Bps (${A.tier2Bps}) must stay at or below the RC-T implied ${RCT_IMPLIED_TIER2}`,
  );
  ok('advisory fee is conservative to the RC-T implied yield');
  assert.equal(
    m.ASSUMPTION_META.tier2Bps.provenance,
    'derived',
    'tier2Bps is grounded in RC-T and must not be labelled an estimate',
  );
  ok('advisory fee is labelled derived, not estimate');

  console.log('\nROI');
  const r30 = m.computeRoi(A, 30);
  check('breakevenRecapturePct', r30.breakevenRecapturePct, 33.97, 0.15);
  assert.equal(m.computeRoi(A, 10).isAccretive, false, '10% recapture must be underwater');
  ok('10% recapture is underwater');
  assert.equal(m.computeRoi(A, 50).isAccretive, true, '50% recapture must be accretive');
  ok('50% recapture is accretive');

  // The defect this model exists to correct: applying an annual rate to escrow float
  // that IRC 1031 caps at 180 days.
  const noDuration = m.computeRoi({ ...A, tier1DurationDays: 365 }, 30);
  assert.ok(
    noDuration.grossAnnualValue > r30.grossAnnualValue * 1.5,
    'duration correction must materially reduce gross value',
  );
  ok('duration correction materially reduces gross value');

  console.log('\nCapacity (the primary business case)');
  const band = m.computeCapacityBand(A);
  check('events/yr', band.mid.events, 2497, 5);
  check('4h annual value', band.low.annualValue, 1.622e6, 5e3);
  check('6h annual value', band.high.annualValue, 2.433e6, 5e3);
  assert.equal(band.low.clearsRunRate, true, 'conservative capacity case must clear run-rate');
  ok('conservative (4h) capacity case clears the $1.25M run-rate');

  console.log('\nGuards');
  assert.equal(m.computeCapacity({ ...A, avgLoanSize: 0 }).events, 0);
  ok('zero average loan size does not divide by zero');
  assert.equal(m.computeRoi({ ...A, flightRate: 0 }, 10).recoveryMonths, Infinity);
  ok('zero gross value yields Infinity recovery, not NaN');

  console.log(`\n${passed} assertions passed.\n`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
