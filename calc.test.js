import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeJobValue } from './calc.js';

test('worked example: 1000 base, 25% tax', () => {
  const r = computeJobValue(1000, 25);
  assert.equal(r.gst, 100);
  assert.equal(r.tax, 250);
  assert.equal(r.final, 1350);
});

test('GST is always 10% of base', () => {
  assert.equal(computeJobValue(2000, 0).gst, 200);
});

test('zero tax means final = base + gst', () => {
  const r = computeJobValue(500, 0);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 550);
});

test('empty / NaN base is treated as 0', () => {
  const r = computeJobValue(NaN, 25);
  assert.equal(r.gst, 0);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 0);
});

test('NaN tax is treated as 0', () => {
  const r = computeJobValue(1000, NaN);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 1100);
});

test('negative base clamps to 0', () => {
  const r = computeJobValue(-500, 25);
  assert.equal(r.final, 0);
});

test('negative tax clamps to 0', () => {
  const r = computeJobValue(1000, -10);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 1100);
});
