const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const authController = require('../src/controllers/authController');

test('resetPassword rejects invalid token', async () => {
    const req = { body: { token: 'not-a-valid-token', newPassword: 'NewPass123' } };
    let statusCode = 0;
    let payload;

    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            payload = data;
            return this;
        }
    };

    await authController.resetPassword(req, res);

    assert.equal(statusCode, 400);
    assert.equal(payload.success, false);
    assert.equal(payload.message, 'Invalid or expired reset token');
});
