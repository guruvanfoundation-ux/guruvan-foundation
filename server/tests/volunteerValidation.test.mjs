import test from 'node:test';
import assert from 'node:assert/strict';
import { validateVolunteerPayload } from '../utils/volunteerValidation.js';

test('accepts valid volunteer payload', () => {
  const result = validateVolunteerPayload({
    name: 'Asha Kumar',
    email: 'asha@example.com',
    phone: '+91 98765 43210',
    city: 'Pune',
    interest: 'Volunteer',
  });

  assert.deepEqual(result, {
    valid: true,
    cleaned: {
      name: 'Asha Kumar',
      email: 'asha@example.com',
      phone: '+919876543210',
      city: 'Pune',
      interest: 'Volunteer',
    },
  });
});

test('rejects invalid email and phone', () => {
  const result = validateVolunteerPayload({
    name: 'Asha Kumar',
    email: 'invalid-email',
    phone: '12345',
    city: 'Pune',
    interest: 'Volunteer',
  });

  assert.equal(result.valid, false);
  assert.match(result.error, /email|phone/i);
});
