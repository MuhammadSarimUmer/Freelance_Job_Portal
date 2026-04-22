const { Safepay } = require('@sfpy/node-sdk');

const SAFEPAY_BASE_URL = process.env.SAFEPAY_BASE_URL || 'https://sandbox.api.getsafepay.com';
const SAFEPAY_ENV = process.env.SAFEPAY_ENV || 'sandbox';

const getSafepay = () => new Safepay({
    environment: SAFEPAY_ENV,
    apiKey: process.env.SAFEPAY_API_KEY,
    v1Secret: process.env.SAFEPAY_V1_SECRET,
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || 'not-used',
});

/**
 * Creates a SafePay payment tracker via the official SDK.
 * Amount is converted to smallest currency unit (paisas for PKR).
 * Returns the tracker token string.
 */
const createPaymentTracker = async ({ amount, currency = 'PKR' }) => {
    const safepay = getSafepay();
    const { token } = await safepay.payments.create({
        amount: Math.round(Number(amount) * 100),
        currency,
    });
    if (!token) throw new Error('SafePay did not return a tracker token');
    return token;
};

/**
 * Builds the SafePay hosted checkout URL via the official SDK.
 */
const getCheckoutUrl = (trackerToken, { redirectUrl, cancelUrl, orderId } = {}) => {
    const safepay = getSafepay();
    return safepay.checkout.create({
        token: trackerToken,
        orderId: orderId || `ORDER-${Date.now()}`,
        cancelUrl: cancelUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/escrow`,
        redirectUrl: redirectUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/return`,
        webhooks: false,
    });
};

/**
 * Verifies a payment using the tracker token via SafePay inquiry API.
 * Returns { isPaid, state, paymentStatus }
 */
const verifyPayment = async (trackerToken) => {
    const url = `${SAFEPAY_BASE_URL}/order/v1/inquire?beacon=${encodeURIComponent(trackerToken)}&env=${SAFEPAY_ENV}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-SFPY-MERCHANT-SECRET': process.env.SAFEPAY_V1_SECRET,
        },
    });

    const data = await response.json();

    if (!response.ok || data?.status?.message === 'fail') {
        const errMsg = data?.status?.errors?.[0] || `SafePay verification failed: ${response.status}`;
        throw new Error(errMsg);
    }

    const tracker = data?.data?.tracker;
    const state = tracker?.state;
    const paymentStatus = tracker?.payment?.status;

    return {
        isPaid: state === 'TRACKER_ENDED' && paymentStatus === 'captured',
        state: state || 'UNKNOWN',
        paymentStatus: paymentStatus || 'unknown',
    };
};

module.exports = { createPaymentTracker, getCheckoutUrl, verifyPayment };
