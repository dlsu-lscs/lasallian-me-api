import { Resend } from 'resend';
import { logger } from '../utils/logger.js';

export interface ApplicationStatusEmailData {
  userName: string;
  applicationTitle: string;
  applicationSlug: string;
  status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REMOVED';
  rejectionReason?: string | null;
}

const FROM = 'pana.tools <notifications@app.pana.tools>';

const STATUS_CONFIG = {
  APPROVED: { label: 'Application Approved', accentColor: '#16a34a' },
  CHANGES_REQUESTED: { label: 'Changes Requested', accentColor: '#d97706' },
  REMOVED: { label: 'Application Removed', accentColor: '#dc2626' },
} as const;

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmail(data: ApplicationStatusEmailData): { subject: string; html: string } {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pana.tools';
  const config = STATUS_CONFIG[data.status];
  const appUrl = `${siteUrl}/${data.applicationSlug}`;
  const editUrl = `${siteUrl}/${data.applicationSlug}/edit`;

  const subject = `${config.label} — ${data.applicationTitle}`;

  let bodyHtml = '';
  let ctaUrl = '';
  let ctaLabel = '';

  switch (data.status) {
    case 'APPROVED':
      bodyHtml = `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
          Congratulations! Your app <strong>${escape(data.applicationTitle)}</strong> has been reviewed and approved by the LSCS team. It is now live and visible to the public on pana.tools.
        </p>
        <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">
          Thank you for contributing to the LaSallian community.
        </p>`;
      ctaUrl = appUrl;
      ctaLabel = 'View Your Application';
      break;

    case 'CHANGES_REQUESTED':
      bodyHtml = `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
          Your app <strong>${escape(data.applicationTitle)}</strong> has been reviewed and requires some changes before it can be approved.
        </p>
        ${
          data.rejectionReason
            ? `<div style="background:#fffbeb;border-left:3px solid #d97706;padding:16px 20px;border-radius:0 6px 6px 0;margin:0 0 20px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#92400e;">Feedback from reviewers</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1c1917;">${escape(data.rejectionReason)}</p>
               </div>`
            : ''
        }
        <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">
          Please address the feedback above and resubmit for review.
        </p>`;
      ctaUrl = editUrl;
      ctaLabel = 'Edit Your Application';
      break;

    case 'REMOVED':
      bodyHtml = `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
          Your app <strong>${escape(data.applicationTitle)}</strong> has been removed from pana.tools.
        </p>
        ${
          data.rejectionReason
            ? `<div style="background:#fef2f2;border-left:3px solid #dc2626;padding:16px 20px;border-radius:0 6px 6px 0;margin:0 0 20px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#991b1b;">Reason</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#1c1917;">${escape(data.rejectionReason)}</p>
               </div>`
            : ''
        }
        <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">
          If you have questions about this decision, please reach out to the LSCS R&amp;D team.
        </p>`;
      ctaUrl = siteUrl;
      ctaLabel = 'Visit pana.tools';
      break;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr>
            <td style="background:#006633;padding:28px 40px 24px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;letter-spacing:-.01em;">pana.tools</p>
            </td>
          </tr>
          <tr>
            <td style="background:${config.accentColor};padding:14px 40px;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;letter-spacing:.01em;">${config.label}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="margin:0 0 20px;font-size:15px;color:#374151;">Hi ${escape(data.userName)},</p>
              ${bodyHtml}
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;">Application</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${escape(data.applicationTitle)}</p>
                  </td>
                </tr>
              </table>
              <a href="${ctaUrl}" style="display:inline-block;background:#006633;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:.01em;">${ctaLabel} &rarr;</a>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:22px 40px;">
              <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">La Salle Computer Society</p>
              <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;">2401 Taft Avenue, Gokongwei Hall, LSCS Nook</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated notification. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

function resendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY not configured');
  return new Resend(apiKey);
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pana.tools';
}

function emailShell(subject: string, accentColor: string, statusLabel: string, bodyHtml: string, ctaUrl: string, ctaLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${escape(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr>
            <td style="background:#006633;padding:28px 40px 24px;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;line-height:1.2;letter-spacing:-.01em;">pana.tools</p>
            </td>
          </tr>
          <tr>
            <td style="background:${accentColor};padding:14px 40px;">
              <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;letter-spacing:.01em;">${statusLabel}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 32px;">
              ${bodyHtml}
              <a href="${ctaUrl}" style="display:inline-block;background:#006633;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;letter-spacing:.01em;">${ctaLabel} &rarr;</a>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:22px 40px;">
              <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">La Salle Computer Society</p>
              <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;">2401 Taft Avenue, Gokongwei Hall, LSCS Nook</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated notification. Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function appCard(title: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
    <tr>
      <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;">Application</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${escape(title)}</p>
      </td>
    </tr>
  </table>`;
}

export const sendApplicationSubmittedEmail = async (
  to: string,
  data: { userName: string; applicationTitle: string; applicationSlug: string },
): Promise<void> => {
  const base = siteUrl();
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;">Hi ${escape(data.userName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      We've received your submission for <strong>${escape(data.applicationTitle)}</strong>. The LSCS team is now reviewing it — we'll send you an update once a decision has been made.
    </p>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">
      Thanks for contributing to the LaSallian community.
    </p>
    ${appCard(data.applicationTitle)}`;

  const subject = `Submission Received — ${data.applicationTitle}`;
  const html = emailShell(subject, '#2563eb', 'Submission Received', body, `${base}/${data.applicationSlug}`, 'View Your Application');

  try {
    const { error } = await resendClient().emails.send({ from: FROM, to, subject, html });
    if (error) logger.error('Failed to send submission email', { to, error });
    else logger.info('Submission confirmation email sent', { to });
  } catch (err) {
    logger.error('RESEND_API_KEY not configured — email not sent', err);
  }
};

export const sendAdminNewSubmissionEmail = async (
  adminEmails: string[],
  data: { userName: string; userEmail: string; applicationTitle: string; applicationSlug: string },
): Promise<void> => {
  if (adminEmails.length === 0) return;

  const base = siteUrl();
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;">A new application has been submitted for review.</p>
    ${appCard(data.applicationTitle)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;">Submitted by</p>
          <p style="margin:0 0 2px;font-size:15px;font-weight:600;color:#111827;">${escape(data.userName)}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;">${escape(data.userEmail)}</p>
        </td>
      </tr>
    </table>`;

  const subject = `New Submission — ${data.applicationTitle}`;
  const html = emailShell(subject, '#2563eb', 'New Submission', body, `${base}/admin`, 'Open Admin Panel');

  try {
    const { error } = await resendClient().emails.send({ from: FROM, to: adminEmails, subject, html });
    if (error) logger.error('Failed to send admin submission notification', { error });
    else logger.info('Admin new submission email sent', { count: adminEmails.length });
  } catch (err) {
    logger.error('RESEND_API_KEY not configured — email not sent', err);
  }
};

export const sendClaimSubmittedEmail = async (
  to: string,
  data: { userName: string; applicationTitle: string; applicationSlug: string },
): Promise<void> => {
  const base = siteUrl();
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;">Hi ${escape(data.userName)},</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      We've received your claim request for <strong>${escape(data.applicationTitle)}</strong>. The LSCS team is reviewing it and will be in touch.
    </p>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#374151;">
      Thanks for reaching out.
    </p>
    ${appCard(data.applicationTitle)}`;

  const subject = `Claim Request Received — ${data.applicationTitle}`;
  const html = emailShell(subject, '#7c3aed', 'Claim Request Received', body, `${base}/${data.applicationSlug}`, 'View Application');

  try {
    const { error } = await resendClient().emails.send({ from: FROM, to, subject, html });
    if (error) logger.error('Failed to send claim confirmation email', { to, error });
    else logger.info('Claim confirmation email sent', { to });
  } catch (err) {
    logger.error('RESEND_API_KEY not configured — email not sent', err);
  }
};

export const sendAdminNewClaimEmail = async (
  adminEmails: string[],
  data: { userName: string; userEmail: string; applicationTitle: string; applicationSlug: string },
): Promise<void> => {
  if (adminEmails.length === 0) return;

  const base = siteUrl();
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:#374151;">A claim request has been submitted.</p>
    ${appCard(data.applicationTitle)}
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;">Claimant</p>
          <p style="margin:0 0 2px;font-size:15px;font-weight:600;color:#111827;">${escape(data.userName)}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;">${escape(data.userEmail)}</p>
        </td>
      </tr>
    </table>`;

  const subject = `New Claim Request — ${data.applicationTitle}`;
  const html = emailShell(subject, '#7c3aed', 'New Claim Request', body, `${base}/admin`, 'Open Admin Panel');

  try {
    const { error } = await resendClient().emails.send({ from: FROM, to: adminEmails, subject, html });
    if (error) logger.error('Failed to send admin claim notification', { error });
    else logger.info('Admin new claim email sent', { count: adminEmails.length });
  } catch (err) {
    logger.error('RESEND_API_KEY not configured — email not sent', err);
  }
};

export const sendApplicationStatusEmail = async (
  to: string,
  data: ApplicationStatusEmailData,
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    logger.error('RESEND_API_KEY not configured — email not sent');
    return;
  }

  const resend = new Resend(apiKey);
  const { subject, html } = buildEmail(data);

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });

  if (error) {
    logger.error('Failed to send email via Resend', { to, status: data.status, error });
    return;
  }

  logger.info('Application status email sent', { to, status: data.status });
};
