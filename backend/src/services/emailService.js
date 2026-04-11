// TODO-DEADLINE: Email templates + sending logic (DO NOT REMOVE)
//
// const nodemailer = require('nodemailer');
// require('dotenv').config();
//
// const appName = process.env.APP_NAME || 'Freelance Job Portal';
// const fromName = process.env.EMAIL_FROM_NAME || appName;
//
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: process.env.EMAIL_USER,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN
//     }
// });
//
// transporter.verify((error) => {
//     if (error) {
//         console.error('Email Server Error:', error);
//     } else {
//         console.log('Email service ready');
//     }
// });
//
// const sendEmail = async (to, subject, html) => {
//     await transporter.sendMail({
//         from: `"${fromName}" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html
//     });
// };
//
// const buildEmailLayout = ({ title, preheader, accentColor, bodyHtml, ctaLabel, ctaUrl, footerNote }) => {
//     const safeAccent = accentColor || '#22c55e';
//
//     return `
//     <div style="margin:0; padding:0; background-color:#0b1220;">
//         <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0b1220; padding:48px 16px; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif; color:#e2e8f0;">
//             <tr>
//                 <td align="center">
//                     <table role="presentation" cellpadding="0" cellspacing="0" width="640" style="max-width:640px; background:#0f172a; border-radius:16px; overflow:hidden; border:1px solid #1f2937; box-shadow:0 18px 40px rgba(15,23,42,0.35);">
//                         <tr>
//                             <td style="padding:28px 32px; background:linear-gradient(120deg, #0b1220 0%, #111827 100%); border-bottom:1px solid #1f2937;">
//                                 <p style="margin:0; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#94a3b8;">${appName}</p>
//                                 <h1 style="margin:10px 0 0; font-size:26px; color:#f8fafc;">${title}</h1>
//                                 <p style="margin:8px 0 0; color:#94a3b8; font-size:14px;">${preheader || ''}</p>
//                             </td>
//                         </tr>
//                         <tr>
//                             <td style="padding:32px;">
//                                 ${bodyHtml}
//                                 ${ctaUrl ? `
//                                 <div style="margin:28px 0 8px; text-align:center;">
//                                     <a href="${ctaUrl}" style="background:${safeAccent}; color:#0b1220; text-decoration:none; font-weight:600; padding:14px 28px; border-radius:10px; display:inline-block; box-shadow:0 10px 20px rgba(34,197,94,0.25);">${ctaLabel || 'Open'}</a>
//                                 </div>
//                                 ` : ''}
//                                 <div style="margin-top:24px; border-top:1px solid #1f2937; padding-top:18px; color:#64748b; font-size:12px;">
//                                     <p style="margin:0;">${footerNote || 'If you did not request this, you can safely ignore this email.'}</p>
//                                 </div>
//                             </td>
//                         </tr>
//                     </table>
//                     <p style="margin:16px 0 0; font-size:11px; color:#475569;">${appName} Security Team</p>
//                 </td>
//             </tr>
//         </table>
//     </div>
//     `;
// };
//
// const sendVerificationEmail = async (email, name, token) => {
//     const clientUrl = process.env.CLIENT_URL || '#';
//     const apiBaseUrl = process.env.API_BASE_URL || '';
//     const verifyLink = `${clientUrl}/verify-email?token=${token}`;
//     const apiVerifyLink = apiBaseUrl ? `${apiBaseUrl}/api/v1/auth/verify-email?token=${token}` : null;
//
//     const bodyHtml = `
//         <p style="margin:0 0 16px; font-size:16px; color:#e2e8f0;">Hello ${name},</p>
//         <p style="margin:0 0 16px; color:#cbd5f5; line-height:1.6;">Welcome to ${appName}. Please verify your email address to activate your account.</p>
//         <div style="background:#0b1220; border:1px solid #1f2937; padding:18px; border-radius:12px; margin:20px 0;">
//             <p style="margin:0; color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Verification</p>
//             <p style="margin:8px 0 0; color:#e2e8f0; font-size:15px;">Click the button below to verify your email.</p>
//         </div>
//         ${apiVerifyLink ? `<p style="margin:0; color:#94a3b8; font-size:12px;">Direct API verify link: <a href="${apiVerifyLink}" style="color:#38bdf8;">${apiVerifyLink}</a></p>` : ''}
//     `;
//
//     const html = buildEmailLayout({
//         title: 'Verify your email',
//         preheader: 'Complete your registration with a quick verification step.',
//         accentColor: '#38bdf8',
//         bodyHtml,
//         ctaLabel: 'Verify Email',
//         ctaUrl: verifyLink,
//         footerNote: 'This verification link expires soon. If it expires, request a new one from the sign in screen.'
//     });
//
//     await sendEmail(email, `${appName} Email Verification`, html);
// };
//
// const sendPasswordResetOtpEmail = async (email, name, otp, expiresMinutes) => {
//     const bodyHtml = `
//         <p style="margin:0 0 16px; font-size:16px; color:#e2e8f0;">Hi ${name},</p>
//         <p style="margin:0 0 16px; color:#cbd5f5; line-height:1.6;">We received a request to reset your password. Use the one-time code below to continue.</p>
//         <div style="background:#0b1220; border:1px solid #1f2937; padding:20px; border-radius:12px; margin:20px 0; text-align:center;">
//             <p style="margin:0; color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:1px;">One-time code</p>
//             <p style="margin:12px 0 0; color:#f8fafc; font-size:28px; letter-spacing:6px; font-weight:700;">${otp}</p>
//         </div>
//         <p style="margin:0; color:#94a3b8; font-size:13px;">This code expires in ${expiresMinutes} minutes.</p>
//     `;
//
//     const html = buildEmailLayout({
//         title: 'Password reset code',
//         preheader: 'Use this code to reset your password.',
//         accentColor: '#f59e0b',
//         bodyHtml,
//         footerNote: 'If you did not request a password reset, we recommend updating your password immediately.'
//     });
//
//     await sendEmail(email, `${appName} Password Reset Code`, html);
// };
//
// module.exports = {
//     sendVerificationEmail,
//     sendPasswordResetOtpEmail
// };
