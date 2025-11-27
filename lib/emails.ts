import { Resend } from "resend";

let resend: Resend | null = null;
export function getResendClient(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = "InvoiceFlow <noreply@invcyflow.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invcyflow.com";

// Base email template wrapper
export function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          background-color: #f8fafc;
          margin: 0;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        .header-title { color: #2563eb; }
        .header-subtitle { color: #64748b; }
        .footer-text { color: #94a3b8; }
        .footer-link { color: #64748b; }
        .banner { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); }
        .banner-title { color: #1e40af; }
        .banner-text { color: #1e3a8a; }
        .content-box { background: #f8fafc; }
        .content-title { color: #334155; }
        .list-item { color: #475569; }
        
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #0f172a !important;
            color: #e2e8f0 !important;
          }
          .container {
            background: #1e293b !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
            border: 1px solid #334155 !important;
          }
          .header-title { color: #60a5fa !important; }
          .header-subtitle { color: #94a3b8 !important; }
          .footer-text { color: #64748b !important; }
          .footer-link { color: #94a3b8 !important; }
          .banner { background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%) !important; }
          .banner-title { color: #bfdbfe !important; }
          .banner-text { color: #dbeafe !important; }
          .content-box { background: #0f172a !important; border: 1px solid #334155 !important; }
          .content-title { color: #f1f5f9 !important; }
          .list-item { color: #cbd5e1 !important; }
          h1, h2, h3, h4, strong { color: #f8fafc !important; }
          p, li, td { color: #cbd5e1 !important; }
          a { color: #60a5fa !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 class="header-title" style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">InvoiceFlow</h1>
          <p class="header-subtitle" style="margin: 8px 0 0 0; font-size: 14px;">Professional Invoicing Made Simple</p>
        </div>
        
        ${content}
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px;">
          <p class="footer-text" style="margin: 0;">© ${new Date().getFullYear()} InvoiceFlow. All rights reserved.</p>
          <p style="margin: 8px 0 0 0;">
            <a href="${APP_URL}/privacy-policy" class="footer-link" style="text-decoration: none;">Privacy Policy</a> · 
            <a href="${APP_URL}/help" class="footer-link" style="text-decoration: none;">Help Center</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Welcome email for new signups
export async function sendWelcomeEmail(email: string, name?: string) {
  const firstName = name?.split(" ")[0] || "there";

  const content = `
    <div class="banner" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <h2 class="banner-title" style="margin: 0 0 8px 0; color: #1e40af; font-size: 24px;">Welcome to InvoiceFlow! 🎉</h2>
      <p class="banner-text" style="margin: 0; color: #1e3a8a;">Your professional invoicing journey starts now</p>
    </div>
    
    <p>Hi ${firstName},</p>
    
    <p>Thank you for joining InvoiceFlow! We're excited to help you create professional invoices in minutes.</p>
    
    <div class="content-box" style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 class="content-title" style="margin: 0 0 16px 0; color: #334155;">Here's what you can do:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li class="list-item" style="margin-bottom: 12px;"><strong>Create invoices</strong> - Beautiful, professional invoices in seconds</li>
        <li class="list-item" style="margin-bottom: 12px;"><strong>Track payments</strong> - Know when clients view your invoices</li>
        <li class="list-item" style="margin-bottom: 12px;"><strong>Manage clients</strong> - Keep all your client info organized</li>
        <li class="list-item"><strong>Get paid faster</strong> - Send invoices directly to clients</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Go to Dashboard →
      </a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">
      Your free plan includes 2 invoices and 1 business. Need more? Check out our 
      <a href="${APP_URL}/pricing" style="color: #2563eb;">Professional plan</a> 
      with a 30-day free trial, or our Enterprise plan for unlimited access!
    </p>
    
    <p style="margin-top: 24px;">
      Welcome aboard!<br>
      <strong>The InvoiceFlow Team</strong>
    </p>
  `;

  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to InvoiceFlow! 🎉",
    html: emailWrapper(content),
  });
}

// Plan upgrade email (trial started or subscription activated)
export async function sendPlanUpgradeEmail(
  email: string,
  planName: string,
  hasTrial: boolean,
  trialEndDate?: Date
) {
  const formattedTrialEnd = trialEndDate?.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const features =
    planName === "Enterprise"
      ? [
          "Unlimited invoices",
          "Unlimited businesses",
          "All templates + custom branding",
          "Email tracking & reminders",
          "Priority support",
        ]
      : [
          "15 invoices per month",
          "3 businesses",
          "All templates",
          "Custom branding",
          "Priority support",
        ];

  const content = `
    <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <h2 style="margin: 0 0 8px 0; color: #166534; font-size: 24px;">
        ${hasTrial ? `Your ${planName} Trial Has Started! 🚀` : `Welcome to ${planName}! 🚀`}
      </h2>
      ${hasTrial ? `<p style="margin: 0; color: #15803d;">30 days of full access, completely free</p>` : `<p style="margin: 0; color: #15803d;">Your subscription is now active</p>`}
    </div>
    
    <p>Hi there,</p>
    
    <p>${
      hasTrial
        ? `Great news! Your 30-day free trial of the <strong>${planName}</strong> plan is now active. You won't be charged until ${formattedTrialEnd}.`
        : `Your <strong>${planName}</strong> subscription is now active. Thank you for upgrading!`
    }</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #334155;">Your ${planName} features:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        ${features.map((f) => `<li style="margin-bottom: 8px;">✓ ${f}</li>`).join("")}
      </ul>
    </div>
    
    ${
      hasTrial
        ? `
    <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Reminder:</strong> Your trial ends on ${formattedTrialEnd}. 
        We'll send you a reminder before your trial ends. You can cancel anytime from your account settings.
      </p>
    </div>
    `
        : ""
    }
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Start Creating Invoices →
      </a>
    </div>
    
    <p style="margin-top: 24px;">
      Happy invoicing!<br>
      <strong>The InvoiceFlow Team</strong>
    </p>
  `;

  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: hasTrial
      ? `Your ${planName} trial has started! 🚀`
      : `Welcome to ${planName}! 🚀`,
    html: emailWrapper(content),
  });
}

// Invoice credits purchased email
export async function sendCreditsEmail(
  email: string,
  quantity: number,
  total: string,
  newBalance: number
) {
  const content = `
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <h2 style="margin: 0 0 8px 0; color: #92400e; font-size: 24px;">Invoice Credits Added! 📄</h2>
      <p style="margin: 0; color: #78350f;">+${quantity} credit${quantity > 1 ? "s" : ""} added to your account</p>
    </div>
    
    <p>Hi there,</p>
    
    <p>Your purchase of <strong>${quantity} invoice credit${quantity > 1 ? "s" : ""}</strong> was successful!</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Credits purchased:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${quantity}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Amount paid:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">$${total}</td>
        </tr>
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 12px 0 0 0; color: #334155; font-weight: 600;">New credit balance:</td>
          <td style="padding: 12px 0 0 0; text-align: right; font-weight: 700; color: #2563eb; font-size: 18px;">${newBalance}</td>
        </tr>
      </table>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">
      Your credits never expire and can be used anytime. Each credit allows you to create one invoice.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/dashboard/invoices/new" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Create New Invoice →
      </a>
    </div>
    
    <p style="margin-top: 24px;">
      Thanks for your purchase!<br>
      <strong>The InvoiceFlow Team</strong>
    </p>
  `;

  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${quantity} invoice credit${quantity > 1 ? "s" : ""} added to your account`,
    html: emailWrapper(content),
  });
}

// Plan downgrade completed email
export async function sendDowngradeCompletedEmail(
  email: string,
  previousPlan: string
) {
  const content = `
    <div style="background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <h2 style="margin: 0 0 8px 0; color: #334155; font-size: 24px;">Your Plan Has Changed</h2>
      <p style="margin: 0; color: #475569;">You're now on the Free plan</p>
    </div>
    
    <p>Hi there,</p>
    
    <p>Your <strong>${previousPlan}</strong> subscription has ended and your account has been switched to the <strong>Free plan</strong>.</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #334155;">Your Free plan includes:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;">2 invoices per month</li>
        <li style="margin-bottom: 8px;">1 business profile</li>
        <li style="margin-bottom: 8px;">Basic templates</li>
        <li>PDF export</li>
      </ul>
    </div>
    
    <p>All your existing invoices and data are still safe and accessible.</p>
    
    <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>Need more invoices?</strong> You can purchase additional credits anytime, or upgrade back to a paid plan.
      </p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/pricing" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Plans →
      </a>
    </div>
    
    <p style="margin-top: 24px;">
      We're here if you need us!<br>
      <strong>The InvoiceFlow Team</strong>
    </p>
  `;

  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Your plan has changed to Free",
    html: emailWrapper(content),
  });
}

// Reactivate subscription email (user cancels the cancellation)
export async function sendReactivationEmail(email: string, planName: string) {
  const content = `
    <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <h2 style="margin: 0 0 8px 0; color: #166534; font-size: 24px;">Subscription Reactivated! 🎉</h2>
      <p style="margin: 0; color: #15803d;">Welcome back to ${planName}!</p>
    </div>
    
    <p>Hi there,</p>
    
    <p>Great news! Your <strong>${planName}</strong> subscription has been reactivated and will continue as normal.</p>
    
    <p>We're glad you decided to stay! You'll continue to have access to all your ${planName} features without interruption.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Go to Dashboard →
      </a>
    </div>
    
    <p style="margin-top: 24px;">
      Happy invoicing!<br>
      <strong>The InvoiceFlow Team</strong>
    </p>
  `;

  return getResendClient().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your ${planName} subscription is back! 🎉`,
    html: emailWrapper(content),
  });
}
