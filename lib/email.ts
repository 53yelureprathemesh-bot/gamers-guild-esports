export interface EmailPayload {
  to: string;
  playerName: string;
  registrationCode: string;
  eventName: string;
  state: string;
  teamName: string;
  status: string;
  submissionDate: string;
}

export function renderEmailTemplate(
  templateHtml: string,
  variables: Record<string, string>
): string {
  let rendered = templateHtml;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value || '');
  }
  return rendered;
}

export const DEFAULT_EMAIL_TEMPLATE = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #07090e; color: #f8fafc; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #00ff9d; font-size: 26px; letter-spacing: 3px; margin: 0; text-transform: uppercase;">Gamers Guild Esports</h1>
    <p style="color: #00f0ff; font-size: 13px; font-weight: 600; letter-spacing: 2px; margin-top: 6px;">ENTER THE ARENA. BUILD YOUR LEGACY.</p>
  </div>

  <p style="font-size: 16px; line-height: 1.6; color: #f1f5f9;">Hello <strong>{{player_name}}</strong>,</p>
  <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">Your tournament registration with <strong>Gamers Guild Esports</strong> has been successfully received and recorded in our competitive database.</p>

  <div style="background-color: #0f172a; border-left: 4px solid #00f0ff; border-radius: 8px; padding: 24px; margin: 28px 0; border: 1px solid #1e293b;">
    <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Your Official State Registration Code</div>
    <div style="font-size: 38px; font-weight: 800; color: #00f0ff; letter-spacing: 3px; margin: 10px 0;">{{registration_code}}</div>
    
    <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 16px;">
      <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Tournament:</strong> {{event_name}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">State Code:</strong> {{state}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Team:</strong> {{team_name}}</p>
      <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Status:</strong> <span style="color: #ffb800; font-weight: 700;">{{status}}</span></p>
      <p style="margin: 6px 0; font-size: 14px;"><strong style="color: #94a3b8;">Timestamp:</strong> {{submission_date}}</p>
    </div>
  </div>

  <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Please keep this registration code safe for bracket verification and custom room coordination. Official room credentials and schedule will be broadcasted to your registered mobile/email prior to match day.</p>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #1e293b;">
    <p style="color: #64748b; font-size: 12px; margin: 0;">Gamers Guild Esports Organization &bull; Nagpur, Maharashtra, India</p>
    <p style="color: #475569; font-size: 11px; margin-top: 6px;">Need assistance? Contact support@gamersguild.gg or join our Discord server.</p>
  </div>
</div>
`;

export async function sendRegistrationConfirmationEmail(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'Gamers Guild Esports <noreply@gamersguild.gg>';

    const html = renderEmailTemplate(DEFAULT_EMAIL_TEMPLATE, {
      player_name: payload.playerName,
      registration_code: payload.registrationCode,
      event_name: payload.eventName,
      state: payload.state,
      team_name: payload.teamName,
      status: payload.status,
      submission_date: payload.submissionDate,
    });

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
        return { success: false, error: errorData.message || 'Failed to send email via Resend' };
      }

      const result = await response.json();
      return { success: true, messageId: result.id };
    } else {
      // In local dev without RESEND_API_KEY, simulate email success and log to console
      console.log(`[EMAIL DISPATCH SIMULATION] Sent to: ${payload.to} | Code: ${payload.registrationCode}`);
      return { success: true, messageId: `mock-email-${Date.now()}` };
    }
  } catch (err: any) {
    console.error('Email send error:', err);
    return { success: false, error: err.message || 'Internal email error' };
  }
}
