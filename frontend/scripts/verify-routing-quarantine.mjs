/**
 * Verification test for AdvisorRoutingView quarantine masking.
 *
 * Verifies that when quarantined === true:
 * - Principal name is masked
 * - Email is masked
 * - Co-investor relationship rationale is suppressed
 * - Dispatch button is locked
 *
 * And when quarantined === false:
 * - Real principal name and email are displayed
 * - Relationship rationale is displayed
 * - Dispatch button is available
 *
 * Run:  node scripts/verify-routing-quarantine.mjs   (from frontend/)
 */
import { buildSync } from 'esbuild';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const FRONTEND_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tmpDir = join(FRONTEND_ROOT, 'node_modules', '.tmp-routing-test');
mkdirSync(tmpDir, { recursive: true });

const testEntryCode = `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdvisorRoutingView } from '${join(FRONTEND_ROOT, 'src/views/AdvisorRoutingView.tsx').replace(/\\/g, '/')}';
import { initialPayoffQueue, initialEntityResolution } from '${join(FRONTEND_ROOT, 'src/mockData.ts').replace(/\\/g, '/')}';

const deal = initialPayoffQueue[0]; // Marcus Vance / Vance Riverfront Properties IV, LLC
const entityData = initialEntityResolution;

export function renderQuarantined() {
  return renderToStaticMarkup(
    React.createElement(AdvisorRoutingView, {
      deal,
      entityData,
      quarantineState: { quarantined: true, verbal_consent_recorded: false, timestamp: '' },
      onBackToRetention: () => {},
      onHandoffToWealth: () => {},
    })
  );
}

export function renderUnquarantined() {
  return renderToStaticMarkup(
    React.createElement(AdvisorRoutingView, {
      deal,
      entityData,
      quarantineState: { quarantined: false, verbal_consent_recorded: true, timestamp: '2026-09-12' },
      onBackToRetention: () => {},
      onHandoffToWealth: () => {},
    })
  );
}
`;

const entryPath = join(tmpDir, 'entry.tsx');
const bundlePath = join(tmpDir, 'bundle.mjs');

writeFileSync(entryPath, testEntryCode, 'utf8');

try {
  buildSync({
    entryPoints: [entryPath],
    outfile: bundlePath,
    bundle: true,
    platform: 'node',
    format: 'esm',
    jsx: 'automatic',
    external: ['react', 'react-dom', 'react-dom/server'],
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
  });

  const { renderQuarantined, renderUnquarantined } = await import(pathToFileURL(bundlePath).href);

  console.log('\nVerifying AdvisorRoutingView quarantine consent gate');

  // 1. Quarantined verification
  const quarantinedHtml = renderQuarantined();

  assert.ok(
    quarantinedHtml.includes('Locked by NPI Privacy Barrier (Commercial Client Opt-In Required)'),
    'Quarantined view must show the NPI Privacy Barrier warning',
  );
  assert.ok(
    quarantinedHtml.includes('[Quarantined — Commercial Client Opt-In Required]'),
    'Quarantined view must mask principal name',
  );
  assert.ok(
    quarantinedHtml.includes('[quarantined@privacy-barrier.internal]'),
    'Quarantined view must mask client email',
  );
  assert.ok(
    quarantinedHtml.includes('Introduction Locked (Opt-In Required)'),
    'Quarantined view must show locked introduction button',
  );
  assert.ok(
    quarantinedHtml.includes('network tie and co-investor details suppressed'),
    'Quarantined view must suppress principal network tie',
  );
  assert.ok(
    !quarantinedHtml.includes('Marcus Vance'),
    'Quarantined view must NOT contain raw principal name "Marcus Vance"',
  );
  assert.ok(
    !quarantinedHtml.includes('marcus.vance@vanceproperties.com'),
    'Quarantined view must NOT contain raw principal email',
  );
  assert.ok(
    !quarantinedHtml.includes('direct advisory relationship with principal co-investor David Cole'),
    'Quarantined view must NOT contain un-suppressed co-investor relationship string',
  );
  console.log('  ok  quarantined state masks principal, email, network tie, and locks dispatch');

  // 2. Unquarantined verification
  const unquarantinedHtml = renderUnquarantined();

  assert.ok(
    unquarantinedHtml.includes('Marcus Vance'),
    'Unquarantined view must display raw principal name "Marcus Vance"',
  );
  assert.ok(
    unquarantinedHtml.includes('marcus.vance@vanceproperties.com'),
    'Unquarantined view must display raw principal email',
  );
  assert.ok(
    unquarantinedHtml.includes('David Cole'),
    'Unquarantined view must display co-investor network tie',
  );
  assert.ok(
    unquarantinedHtml.includes('Queue Introduction'),
    'Unquarantined view must enable queue introduction button',
  );
  assert.ok(
    !unquarantinedHtml.includes('Introduction Locked (Opt-In Required)'),
    'Unquarantined view must NOT show locked introduction button',
  );
  console.log('  ok  unquarantined state displays principal, email, network tie, and enables dispatch');

  console.log('Quarantine consent gate assertions passed.\n');
} finally {
  try {
    rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}
