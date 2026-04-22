const { test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.EMAIL_USER = 'noreply@test.com';
process.env.RESEND_API_KEY = 'test_resend_key';
process.env.BREVO_API_KEY = 'test_brevo_key';
process.env.EMAIL_PROVIDER = 'resend';
process.env.CLIENT_URL = 'http://localhost:5173';

const {
    buildEmailLayout,
    sendVerificationEmail,
    sendInvitationEmail,
    setResendFactory,
    setBrevoPost
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

test('sendVerificationEmail uses Resend client', async () => {
    let payload;
    setResendFactory(() => ({
        emails: {
            send: async (data) => {
                payload = data;
                return { data: { id: 'test_1' }, error: null };
            }
        }
    }));

    await sendVerificationEmail('person@example.com', 'Person', 'token123');

    assert.equal(payload.to, 'person@example.com');
    assert.ok(payload.subject.includes('Email Verification'));
    assert.ok(payload.html.includes('token123'));
});

test('sendInvitationEmail includes contract link', async () => {
    let payload;
    const contractUrl = 'http://localhost:5173/contracts/abc123';

    setResendFactory(() => ({
        emails: {
            send: async (data) => {
                payload = data;
                return { data: { id: 'test_2' }, error: null };
            }
        }
    }));

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

test('sendVerificationEmail uses Brevo when provider is brevo', async () => {
    process.env.EMAIL_PROVIDER = 'brevo';
    let payload;

    setBrevoPost(async (data) => {
        payload = data;
        return { messageId: 'brevo_1' };
    });

    await sendVerificationEmail('brevo@example.com', 'Brevo User', 'tokenABC');

    assert.equal(payload.to[0].email, 'brevo@example.com');
    assert.ok(payload.subject.includes('Email Verification'));
    assert.ok(payload.htmlContent.includes('tokenABC'));

    process.env.EMAIL_PROVIDER = 'resend';
});
