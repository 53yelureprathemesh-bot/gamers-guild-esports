export interface EmailPayload {
  to: string;
  playerName: string;
  registrationCode: string;
  eventName: string;
  game?: string;
  inGameName?: string;
  playerUid?: string;
  teamName?: string;
  teamRole?: string;
  state: string;
  district?: string;
  city?: string;
  phone?: string;
  gamingExperience?: string;
  dateOfBirth?: string;
  gender?: string;
  status: string; // 'PENDING' | 'APPROVED' | 'REJECTED' or descriptive string
  submissionDate: string;
  adminNotes?: string;
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

export function buildRegistrationEmailHtml(payload: EmailPayload): string {
  const isApproved = payload.status.toUpperCase().includes('APPROV');
  const isRejected = payload.status.toUpperCase().includes('REJECT');

  let statusBadgeBg = 'rgba(255, 184, 0, 0.15)';
  let statusBadgeColor = '#ffb800';
  let statusBadgeBorder = 'rgba(255, 184, 0, 0.4)';
  let statusDisplay = 'PENDING (UNDER REVIEW)';
  let statusNotice = 'Your tournament registration has been received and recorded in our competitive database. Our administrative team is currently verifying your roster, in-game UID, and state eligibility.';

  if (isApproved) {
    statusBadgeBg = 'rgba(0, 255, 157, 0.15)';
    statusBadgeColor = '#00ff9d';
    statusBadgeBorder = 'rgba(0, 255, 157, 0.4)';
    statusDisplay = 'APPROVED & OFFICIALLY VERIFIED';
    statusNotice = 'CONGRATULATIONS! Your tournament registration has been APPROVED by Gamers Guild Esports organizers. Your slot in the championship bracket is officially confirmed!';
  } else if (isRejected) {
    statusBadgeBg = 'rgba(255, 70, 85, 0.15)';
    statusBadgeColor = '#ff4655';
    statusBadgeBorder = 'rgba(255, 70, 85, 0.4)';
    statusDisplay = 'APPLICATION REJECTED';
    statusNotice = `Your registration application could not be approved at this time.${payload.adminNotes ? ` Reason: ${payload.adminNotes}` : ' Please contact support if you believe this is an error.'}`;
  }

  const receiptUrl = `https://gamers-guild-esports.vercel.app/find-registration?query=${encodeURIComponent(payload.registrationCode)}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gamers Guild Esports Registration</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #05070b; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #05070b; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #07090e; color: #f8fafc; padding: 36px 24px; border-radius: 14px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b; box-shadow: 0 15px 35px rgba(0,0,0,0.85);">
    
    <!-- Header with Esports Branding -->
    <div style="text-align: center; margin-bottom: 26px; border-bottom: 1px solid rgba(30, 41, 59, 0.8); padding-bottom: 22px;">
      <div style="display: inline-block; padding: 5px 14px; background: rgba(0, 255, 157, 0.1); border: 1px solid rgba(0, 255, 157, 0.3); border-radius: 20px; margin-bottom: 12px;">
        <span style="color: #00ff9d; font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;">OFFICIAL TOURNAMENT VERIFICATION</span>
      </div>
      <h1 style="color: #00ff9d; font-family: 'Orbitron', 'Rajdhani', sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 3px; margin: 0; text-transform: uppercase;">GAMERS GUILD ESPORTS</h1>
      <p style="color: #00f0ff; font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; margin: 6px 0 0 0; text-transform: uppercase;">ENTER THE ARENA. BUILD YOUR LEGACY.</p>
    </div>

    <!-- Status Banner Alert -->
    <div style="background: ${statusBadgeBg}; border: 1px solid ${statusBadgeBorder}; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; text-align: center;">
      <div style="font-family: 'Orbitron', 'Rajdhani', sans-serif; color: ${statusBadgeColor}; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
        STATUS: ${statusDisplay}
      </div>
      <p style="color: #e2e8f0; font-size: 13px; line-height: 1.5; margin: 0;">
        ${statusNotice}
      </p>
    </div>

    <!-- Salutation -->
    <p style="font-size: 15px; line-height: 1.6; color: #f1f5f9; margin: 0 0 8px 0;">Hello <strong style="color: #00f0ff;">${escapeHtml(payload.playerName)}</strong>,</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 22px 0;">Below are the complete tournament registration details registered under your profile for <strong style="color: #ffffff;">${escapeHtml(payload.eventName)}</strong>.</p>

    <!-- Cyber HUD Pass Card -->
    <div style="background: linear-gradient(145deg, #0c1220 0%, #060911 100%); border-left: 4px solid #00f0ff; border-radius: 10px; padding: 22px; margin: 20px 0; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; box-shadow: inset 0 0 25px rgba(0, 240, 255, 0.04);">
      
      <div style="font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">YOUR OFFICIAL STATE REGISTRATION CODE</div>
      
      <!-- Big Registration Code -->
      <div style="font-family: 'Orbitron', 'Rajdhani', monospace, sans-serif; font-size: 42px; font-weight: 900; color: #00f0ff; letter-spacing: 4px; margin: 10px 0 16px 0; line-height: 1;">${escapeHtml(payload.registrationCode)}</div>
      
      <!-- COMPLETE PLAYER DETAILS TABLE -->
      <div style="border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 14px; font-size: 13px;">
        <div style="font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700; color: #00ff9d; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px;">
          VERIFIED PLAYER & ROSTER DETAILS
        </div>
        
        <table style="width: 100%; border-collapse: collapse; font-family: 'Inter', -apple-system, sans-serif;">
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600; width: 40%;">Tournament:</td>
            <td style="padding: 7px 0; color: #f1f5f9; font-weight: 700;">${escapeHtml(payload.eventName)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Game Title:</td>
            <td style="padding: 7px 0; color: #00f0ff; font-weight: 700;">${escapeHtml(payload.game || 'BGMI (Battlegrounds Mobile India)')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Player Full Name:</td>
            <td style="padding: 7px 0; color: #f1f5f9; font-weight: 700;">${escapeHtml(payload.playerName)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">In-Game Name (IGN):</td>
            <td style="padding: 7px 0; color: #00ff9d; font-weight: 800; font-family: 'Orbitron', monospace;">${escapeHtml(payload.inGameName || 'N/A')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Character / Player UID:</td>
            <td style="padding: 7px 0; color: #f1f5f9; font-weight: 700; font-family: monospace;">${escapeHtml(payload.playerUid || 'N/A')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Squad / Team Name:</td>
            <td style="padding: 7px 0; color: #f1f5f9; font-weight: 700;">${escapeHtml(payload.teamName || 'N/A')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Team Role:</td>
            <td style="padding: 7px 0; color: #e2e8f0; font-weight: 600;">${escapeHtml(payload.teamRole || 'Player')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Registered State:</td>
            <td style="padding: 7px 0; color: #00ff9d; font-weight: 700;">${escapeHtml(payload.state)}</td>
          </tr>
          ${payload.district || payload.city ? `
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">District / City:</td>
            <td style="padding: 7px 0; color: #e2e8f0;">${escapeHtml([payload.district, payload.city].filter(Boolean).join(', '))}</td>
          </tr>` : ''}
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Contact Phone:</td>
            <td style="padding: 7px 0; color: #e2e8f0; font-family: monospace;">${escapeHtml(payload.phone || 'N/A')}</td>
          </tr>
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Registered Email:</td>
            <td style="padding: 7px 0; color: #e2e8f0;">${escapeHtml(payload.to)}</td>
          </tr>
          ${payload.gamingExperience ? `
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Competitive Experience:</td>
            <td style="padding: 7px 0; color: #e2e8f0;">${escapeHtml(payload.gamingExperience)}</td>
          </tr>` : ''}
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Registration Status:</td>
            <td style="padding: 7px 0;">
              <span style="background: ${statusBadgeBg}; color: ${statusBadgeColor}; border: 1px solid ${statusBadgeBorder}; padding: 3px 10px; border-radius: 4px; font-weight: 800; font-size: 11px; text-transform: uppercase;">
                ${escapeHtml(payload.status)}
              </span>
            </td>
          </tr>
          ${payload.adminNotes ? `
          <tr style="border-bottom: 1px solid #131d2e;">
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Admin Notes:</td>
            <td style="padding: 7px 0; color: #f59e0b; font-weight: 600;">${escapeHtml(payload.adminNotes)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 7px 0; color: #64748b; font-weight: 600;">Verification Timestamp:</td>
            <td style="padding: 7px 0; color: #94a3b8; font-size: 12px;">${escapeHtml(payload.submissionDate)}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Match Instructions -->
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 18px 0 24px 0;">
      Please save this registration email and keep your state code (<strong style="color: #00f0ff;">${escapeHtml(payload.registrationCode)}</strong>) ready for match room entry, bracket seeding, and player identity verification.
    </p>

    <!-- Action Button to View Official Live Printable Receipt -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="${receiptUrl}" target="_blank" style="display: inline-block; background-color: #00f0ff; color: #07090e; font-family: 'Orbitron', 'Rajdhani', sans-serif; font-weight: 800; font-size: 12px; letter-spacing: 2px; text-decoration: none; padding: 14px 28px; border-radius: 6px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(0, 240, 255, 0.4);">
        VIEW OFFICIAL RECEIPT
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 18px; border-top: 1px solid #1e293b;">
      <p style="color: #64748b; font-size: 11px; margin: 0; font-family: 'Rajdhani', sans-serif; letter-spacing: 1px;">GAMERS GUILD ESPORTS ORGANIZATION &bull; NAGPUR, MAHARASHTRA, INDIA</p>
      <p style="color: #475569; font-size: 11px; margin-top: 6px;">Support: gamersguildesports12@gmail.com &bull; Nagpur Competitive Circuit</p>
    </div>
  </div>
</body>
</html>`;
}

export function buildRegistrationEmailText(payload: EmailPayload): string {
  return `GAMERS GUILD ESPORTS — OFFICIAL TOURNAMENT VERIFICATION
============================================================

Hello ${payload.playerName},

Your registration status: ${payload.status.toUpperCase()}
Registration Code: ${payload.registrationCode}

PLAYER & ROSTER DETAILS:
- Tournament: ${payload.eventName}
- Game: ${payload.game || 'BGMI (Battlegrounds Mobile India)'}
- Full Name: ${payload.playerName}
- In-Game Name (IGN): ${payload.inGameName || 'N/A'}
- Character UID: ${payload.playerUid || 'N/A'}
- Team Name: ${payload.teamName || 'N/A'}
- Team Role: ${payload.teamRole || 'Player'}
- State: ${payload.state}
- District/City: ${[payload.district, payload.city].filter(Boolean).join(', ') || 'N/A'}
- Phone: ${payload.phone || 'N/A'}
- Email: ${payload.to}
${payload.gamingExperience ? `- Competitive Experience: ${payload.gamingExperience}\n` : ''}${payload.adminNotes ? `- Admin Notes: ${payload.adminNotes}\n` : ''}- Timestamp: ${payload.submissionDate}

Track or Print Your Official Receipt:
https://gamers-guild-esports.vercel.app/find-registration?query=${payload.registrationCode}

Gamers Guild Esports Organization • Nagpur, Maharashtra, India
Support: gamersguildesports12@gmail.com`;
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const DEFAULT_EMAIL_TEMPLATE = ``;
