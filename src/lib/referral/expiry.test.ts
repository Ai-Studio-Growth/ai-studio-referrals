import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expiryDaysFromEligibility, referralExpiresAt, isReferralExpired } from './expiry';

const DAY = 24 * 60 * 60 * 1000;

test('expiryDaysFromEligibility: missing / zero / invalid → null', () => {
  assert.equal(expiryDaysFromEligibility(null), null);
  assert.equal(expiryDaysFromEligibility(undefined), null);
  assert.equal(expiryDaysFromEligibility({}), null);
  assert.equal(expiryDaysFromEligibility({ referralExpiryDays: 0 }), null);
  assert.equal(expiryDaysFromEligibility({ referralExpiryDays: -5 }), null);
  assert.equal(expiryDaysFromEligibility({ referralExpiryDays: 'soon' }), null);
  assert.equal(expiryDaysFromEligibility([1, 2, 3]), null);
});

test('expiryDaysFromEligibility: reads a positive integer', () => {
  assert.equal(expiryDaysFromEligibility({ referralExpiryDays: 30 }), 30);
  assert.equal(expiryDaysFromEligibility({ referralExpiryDays: 7.9 }), 7); // floored
});

test('referralExpiresAt: adds the window, or null when no expiry', () => {
  const created = new Date('2026-01-01T00:00:00.000Z');
  assert.equal(referralExpiresAt(created, null), null);
  assert.equal(referralExpiresAt(created, 0), null);
  assert.equal(referralExpiresAt(created, 10)?.toISOString(), '2026-01-11T00:00:00.000Z');
});

test('isReferralExpired: never expires without config', () => {
  const created = new Date(Date.now() - 365 * DAY);
  assert.equal(isReferralExpired(created, {}), false);
  assert.equal(isReferralExpired(created, { referralExpiryDays: 0 }), false);
});

test('isReferralExpired: boundary around created + days', () => {
  const created = new Date('2026-01-01T00:00:00.000Z');
  const elig = { referralExpiryDays: 7 };
  assert.equal(isReferralExpired(created, elig, new Date('2026-01-05T00:00:00.000Z')), false);
  assert.equal(isReferralExpired(created, elig, new Date('2026-01-07T23:59:59.000Z')), false);
  assert.equal(isReferralExpired(created, elig, new Date('2026-01-08T00:00:00.000Z')), true);
  assert.equal(isReferralExpired(created, elig, new Date('2026-02-01T00:00:00.000Z')), true);
});
