const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.EMAIL_USER = 'noreply@test.com';
process.env.CLIENT_URL = 'http://localhost:5173';

const {
    buildEmailLayout,
    sendVerificationEmail,
    sendInvitationEmail,
    setTransporter
} = require('../src/services/emailService');

test('buildEmailLayout renders title and body', () => {
    const html = buildEmailLayout({
        title: 'Hello',
        bodyHtml: '<p>Body</p>',
        ctaLabel: 'Open',
        ctaUrl: 'http://example.com'
    });

    assert.ok(html.includes('Hello'));
    assert.ok(html.includes('Body'));
    assert.ok(html.includes('http://example.com'));
});

test('sendVerificationEmail uses transporter', async () => {
    let payload;
    setTransporter({
        sendMail: async (data) => {
            payload = data;
        }
    });

    await sendVerificationEmail('person@example.com', 'Person', 'token123');

    assert.equal(payload.to, 'person@example.com');
    assert.ok(payload.subject.includes('Email Verification'));
    assert.ok(payload.html.includes('token123'));
});

test('sendInvitationEmail includes contract link', async () => {
    let payload;
    const contractUrl = 'http://localhost:5173/contracts/abc123';

    setTransporter({
        sendMail: async (data) => {
            payload = data;
        }
    });

    await sendInvitationEmail({
        developerEmail: 'dev@example.com',
        developerName: 'Dev',
        clientName: 'Client',
        contractTitle: 'New App',
        message: 'Join the project!',
        contractUrl
    });

    assert.equal(payload.to, 'dev@example.com');
    assert.ok(payload.html.includes(contractUrl));
});
