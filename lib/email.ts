import nodemailer from 'nodemailer';

export * from './emailTemplates';
import { 
  EmailPayload, 
  buildRegistrationEmailHtml, 
  buildRegistrationEmailText 
} from './emailTemplates';

export async function sendRegistrationConfirmationEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const cleanKey = (str?: string) => (str || '').trim().split(/[\r\n]+/)[0].trim();
    const smtpUser = cleanKey(process.env.SMTP_USER);
    const smtpPass = cleanKey(process.env.SMTP_PASS).replace(/\s+/g, '');
    const smtpHost = cleanKey(process.env.SMTP_HOST) || 'smtp.gmail.com';
    const smtpPort = parseInt(cleanKey(process.env.SMTP_PORT) || '465', 10);
    const resendApiKey = cleanKey(process.env.RESEND_API_KEY);

    const defaultFrom = smtpUser 
      ? `"Gamers Guild Esports" <${smtpUser}>` 
      : '"Gamers Guild Esports" <onboarding@resend.dev>';
    const fromEmail = cleanKey(process.env.EMAIL_FROM) || defaultFrom;
    const replyToEmail = smtpUser || 'gamersguildesports12@gmail.com';

    // Dynamic subject line reflecting exact status (PENDING vs APPROVED vs REJECTED)
    const isApproved = payload.status.toUpperCase().includes('APPROV');
    const isRejected = payload.status.toUpperCase().includes('REJECT');
    let subject = `Gamers Guild Esports — Application Received [PENDING] - Code: ${payload.registrationCode}`;
    if (isApproved) {
      subject = `Gamers Guild Esports — Registration APPROVED [${payload.registrationCode}]`;
    } else if (isRejected) {
      subject = `Gamers Guild Esports — Registration Update [REJECTED] - Code: ${payload.registrationCode}`;
    }

    const html = buildRegistrationEmailHtml(payload);
    const plainText = buildRegistrationEmailText(payload);

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
          replyTo: replyToEmail,
          subject: subject,
          text: plainText,
          html: html,
          headers: {
            'X-Entity-Ref-ID': payload.registrationCode,
          }
        });

        console.log(`[SMTP] Email successfully dispatched to participant: ${payload.to} (${info.messageId}) [Status: ${payload.status}]`);
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
          reply_to: replyToEmail,
          subject: subject,
          text: plainText,
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
      console.log(`[Resend] Email successfully dispatched to participant: ${payload.to} (${result.id}) [Status: ${payload.status}]`);
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

export async function sendContactInquiryNotificationEmail(inquiry: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  created_at?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanKey = (str?: string) => (str || '').trim().split(/[\r\n]+/)[0].trim();
    const smtpUser = cleanKey(process.env.SMTP_USER);
    const smtpPass = cleanKey(process.env.SMTP_PASS).replace(/\s+/g, '');
    const smtpHost = cleanKey(process.env.SMTP_HOST) || 'smtp.gmail.com';
    const smtpPort = parseInt(cleanKey(process.env.SMTP_PORT) || '465', 10);
    const resendApiKey = cleanKey(process.env.RESEND_API_KEY);

    const targetRecipient = 'gamersgesports@gmail.com';
    const defaultFrom = smtpUser 
      ? `"Gamers Guild Battle Desk" <${smtpUser}>` 
      : '"Gamers Guild Battle Desk" <onboarding@resend.dev>';
    const fromEmail = cleanKey(process.env.EMAIL_FROM) || defaultFrom;

    const emailSubject = `[Gamers Guild] New Transmit Message: ${inquiry.subject} from ${inquiry.name}`;
    const emailHtml = `
      <div style="background-color: #0b0f19; color: #e2e8f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; max-width: 650px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #00f2fe; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #00f2fe; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">
            NEW TRANSMITTED MESSAGE FROM USER
          </h2>
          <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Received through Gamers Guild Esports Contact Gateway</p>
        </div>

        <div style="background-color: #111827; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
          <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Sender Name:</strong> <span style="color: #ffffff; font-weight: 600;">${inquiry.name}</span></p>
          <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Sender Email:</strong> <a href="mailto:${inquiry.email}" style="color: #00f2fe; text-decoration: none;">${inquiry.email}</a></p>
          ${inquiry.phone ? `<p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Phone / WhatsApp:</strong> <span style="color: #ffffff;">${inquiry.phone}</span></p>` : ''}
          <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Subject Category:</strong> <span style="background: rgba(0,242,254,0.15); color: #00f2fe; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${inquiry.subject}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong style="color: #94a3b8;">Transmission Time:</strong> <span style="color: #cbd5e1;">${new Date(inquiry.created_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</span></p>
        </div>

        <div style="background-color: #151d30; padding: 18px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="color: #e2e8f0; font-size: 13px; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 0.5px;">Message Content:</h3>
          <p style="color: #ffffff; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${inquiry.message}</p>
        </div>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
          <a href="mailto:${inquiry.email}?subject=Re: [Gamers Guild] ${encodeURIComponent(inquiry.subject)}" style="background: #10b981; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; text-transform: uppercase; display: inline-block;">
            REPLY DIRECTLY TO SENDER
          </a>
          <p style="color: #64748b; font-size: 11px; margin-top: 12px;">You can also manage and resolve this ticket inside the Admin Panel under Transmit Messages.</p>
        </div>
      </div>
    `;

    if (smtpUser && smtpPass) {
      try {
        const isGmail = smtpUser.endsWith('@gmail.com') || smtpHost.includes('gmail');
        const transporter = nodemailer.createTransport(
          isGmail
            ? { service: 'gmail', auth: { user: smtpUser, pass: smtpPass } }
            : { host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: smtpUser, pass: smtpPass } }
        );

        await transporter.sendMail({
          from: fromEmail,
          to: targetRecipient,
          replyTo: inquiry.email,
          subject: emailSubject,
          html: emailHtml,
          text: `New contact message from ${inquiry.name} (${inquiry.email}):\nSubject: ${inquiry.subject}\n\n${inquiry.message}`
        });

        console.log(`[SMTP] Contact inquiry alert dispatched to ${targetRecipient}`);
        return { success: true };
      } catch (err: any) {
        console.warn('SMTP contact alert dispatch failed:', err);
      }
    }

    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: fromEmail,
            to: [targetRecipient],
            reply_to: inquiry.email,
            subject: emailSubject,
            html: emailHtml
          })
        });
        return { success: true };
      } catch (err: any) {
        console.warn('Resend contact alert dispatch failed:', err);
      }
    }

    return { success: true }; // In-memory/database is primary
  } catch (e: any) {
    console.warn('sendContactInquiryNotificationEmail error:', e);
    return { success: false, error: e.message };
  }
}

