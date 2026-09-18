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
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800;900&family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    body { margin: 0; padding: 0; background-color: #05070b; }
    .neon-text { text-shadow: 0 0 15px rgba(0, 240, 255, 0.5); }
  </style>
</head>
<body style="margin: 0; padding: 20px 10px; background-color: #05070b; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="background-color: #07090e; color: #f8fafc; padding: 36px 24px; border-radius: 14px; max-width: 580px; margin: 0 auto; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
    
    <!-- Header with Esports Branding -->
    <div style="text-align: center; margin-bottom: 28px; border-bottom: 1px solid rgba(30, 41, 59, 0.8); padding-bottom: 22px;">
      <div style="display: inline-block; padding: 4px 12px; background: rgba(0, 255, 157, 0.1); border: 1px solid rgba(0, 255, 157, 0.3); border-radius: 20px; margin-bottom: 10px;">
        <span style="color: #00ff9d; font-family: 'Rajdhani', 'Segoe UI', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">OFFICIAL TOURNAMENT VERIFICATION</span>
      </div>
      <h1 style="color: #00ff9d; font-family: 'Orbitron', 'Rajdhani', -apple-system, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: 3px; margin: 0; text-transform: uppercase;">GAMERS GUILD ESPORTS</h1>
      <p style="color: #00f0ff; font-family: 'Rajdhani', 'Segoe UI', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2.5px; margin: 6px 0 0 0; text-transform: uppercase;">ENTER THE ARENA. BUILD YOUR LEGACY.</p>
    </div>

    <!-- Salutation -->
    <p style="font-size: 15px; line-height: 1.6; color: #f1f5f9; margin: 0 0 8px 0;">Hello <strong style="color: #ffffff;">{{player_name}}</strong>,</p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">Your tournament registration with <strong style="color: #e2e8f0;">Gamers Guild Esports</strong> has been successfully received and recorded in our competitive database.</p>

    <!-- Cyber HUD Pass Card -->
    <div style="background: linear-gradient(145deg, #0d1424 0%, #080c16 100%); border-left: 4px solid #00f0ff; border-radius: 10px; padding: 24px; margin: 24px 0; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; box-shadow: inset 0 0 20px rgba(0, 240, 255, 0.05);">
      
      <div style="font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">YOUR OFFICIAL STATE REGISTRATION CODE</div>
      
      <!-- Big Registration Code -->
      <div style="font-family: 'Orbitron', 'Rajdhani', monospace, sans-serif; font-size: 42px; font-weight: 900; color: #00f0ff; letter-spacing: 4px; margin: 10px 0 16px 0; line-height: 1;">{{registration_code}}</div>
      
      <!-- Details Table -->
      <div style="border-top: 1px solid #1e293b; padding-top: 14px; margin-top: 14px; font-size: 13px;">
        <table style="width: 100%; border-collapse: collapse; font-family: 'Inter', -apple-system, sans-serif;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 35%;">Tournament:</td>
            <td style="padding: 6px 0; color: #f1f5f9; font-weight: 700;">{{event_name}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">State Code:</td>
            <td style="padding: 6px 0; color: #00ff9d; font-weight: 700;">{{state}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Team:</td>
            <td style="padding: 6px 0; color: #f1f5f9; font-weight: 700;">{{team_name}}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Status:</td>
            <td style="padding: 6px 0;">
              <span style="background: rgba(255, 184, 0, 0.15); color: #ffb800; border: 1px solid rgba(255, 184, 0, 0.4); padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px; text-transform: uppercase;">{{status}}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Timestamp:</td>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 12px;">{{submission_date}}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Match Instructions -->
    <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 18px 0 24px 0;">
      Please keep this registration code safe for bracket verification and custom room coordination. Official room credentials and schedule will be broadcasted to your registered mobile/email prior to match day.
    </p>

    <!-- Action Link -->
    <div style="text-align: center; margin: 28px 0;">
      <a href="https://gamers-guild-esports.vercel.app/find-registration?query={{registration_code}}" target="_blank" style="display: inline-block; background-color: #00f0ff; color: #07090e; font-family: 'Orbitron', 'Rajdhani', -apple-system, sans-serif; font-weight: 800; font-size: 12px; letter-spacing: 2px; text-decoration: none; padding: 13px 26px; border-radius: 6px; text-transform: uppercase;">
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
</html>
`;
