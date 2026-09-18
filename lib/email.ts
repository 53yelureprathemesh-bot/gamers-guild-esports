import nodemailer from 'nodemailer';

export * from './emailTemplates';
import { EmailPayload, renderEmailTemplate, DEFAULT_EMAIL_TEMPLATE } from './emailTemplates';

export async function sendRegistrationConfirmationEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const cleanKey = (str?: string) => (str || '').trim().split(/[\r\n]+/)[0].trim();
    const smtpUser = cleanKey(process.env.SMTP_USER);
    const smtpPass = cleanKey(process.env.SMTP_PASS).replace(/\s+/g, '');
    const smtpHost = cleanKey(process.env.SMTP_HOST) || 'smtp.gmail.com';
    const smtpPort = parseInt(cleanKey(process.env.SMTP_PORT) || '465', 10);
    const resendApiKey = cleanKey(process.env.RESEND_API_KEY);
    const fromEmail = cleanKey(process.env.EMAIL_FROM) || (smtpUser ? `Gamers Guild Esports <${smtpUser}>` : 'Gamers Guild Esports <onboarding@resend.dev>');

    const html = renderEmailTemplate(DEFAULT_EMAIL_TEMPLATE, {
      player_name: payload.playerName,
      registration_code: payload.registrationCode,
      event_name: payload.eventName,
      state: payload.state,
      team_name: payload.teamName,
      status: payload.status,
      submission_date: payload.submissionDate,
    });

    // 1. Prioritize SMTP (Gmail App Password or custom SMTP) if configured
    if (smtpUser && smtpPass) {
      try {
        const isGmail = smtpUser.endsWith('@gmail.com') || smtpHost.includes('gmail');
        const transporter = nodemailer.createTransport(
          isGmail
            ? {
                service: 'gmail',
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
              }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
              }
        );

        const info = await transporter.sendMail({
          from: fromEmail,
          to: payload.to,
          subject: `Gamers Guild Esports — Registration Confirmed [${payload.registrationCode}]`,
          html: html,
        });

        console.log(`[SMTP] Email successfully dispatched to participant: ${payload.to} (${info.messageId})`);
        return { success: true, messageId: info.messageId };
      } catch (smtpErr: any) {
        console.error('SMTP email error:', smtpErr);
        if (!resendApiKey) {
          return { 
            success: false, 
            error: `SMTP dispatch error: ${smtpErr.message || 'Failed to send via SMTP.'}` 
          };
        }
      }
    }

    // 2. Use Resend API if configured
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [payload.to],
          subject: `Gamers Guild Esports — Registration Confirmed [${payload.registrationCode}]`,
          html: html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend API Error:', errorData);

        let helpfulMsg = errorData.message || 'Failed to dispatch email via Resend.';
        if (response.status === 403 || errorData.message?.toLowerCase().includes('testing emails')) {
          helpfulMsg = `Resend Free Sandbox Limitation: Resend only allows delivering to account owner. To send to participant (${payload.to}), either verify your domain at resend.com/domains, OR configure free Gmail SMTP (SMTP_USER and SMTP_PASS in Vercel).`;
        }

        return { success: false, error: helpfulMsg };
      }

      const result = await response.json();
      console.log(`[Resend] Email successfully dispatched to participant: ${payload.to} (${result.id})`);
      return { success: true, messageId: result.id };
    }

    // Fallback if no provider is configured
    console.log(`[EMAIL DISPATCH SIMULATION] Sent to participant: ${payload.to} | Code: ${payload.registrationCode}`);
    return { 
      success: false, 
      error: 'No email service configured. Please add SMTP_USER & SMTP_PASS (Gmail App Password) or verify your domain in Resend.' 
    };
  } catch (err: any) {
    console.error('Email send error:', err);
    return { success: false, error: err.message || 'Internal email error' };
  }
}
