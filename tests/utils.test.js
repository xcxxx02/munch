import test from 'node:test';
import assert from 'node:assert/strict';
import { dateFromToday, daysLeftLabel, daysUntil, todayISO } from '../src/utils.js';

test('expiry helpers convert between a number of days and the stored date', () => {
  assert.equal(dateFromToday(0), todayISO());
  assert.equal(daysUntil(dateFromToday(5)), 5);
  assert.equal(daysLeftLabel(dateFromToday(1)), '1 day left');
  assert.equal(daysLeftLabel(dateFromToday(4)), '4 days left');
});

test('expiry helpers keep the field optional and reject invalid day counts', () => {
  assert.equal(dateFromToday(''), '');
  assert.equal(dateFromToday(-1), '');
  assert.equal(daysUntil(''), '');
  assert.equal(daysLeftLabel(''), 'No expiry');
});
