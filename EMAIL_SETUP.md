# TRANSACTIONAL EMAIL SETUP GUIDE — GAMERS GUILD ESPORTS

When a player registers, the platform automatically generates their state registration code (e.g. `MH27`) and dispatches a confirmation email to their inbox.

This guide explains how to set up transactional emails using **Resend** (which gives you **3,000 free emails every month**).

---

## 1. Create a Free Account on Resend

1. Go to [resend.com](https://resend.com) and click **"Get Started"**.
2. Sign in with GitHub or your email.

---

## 2. Generate an API Key

1. In the Resend dashboard, click **API Keys** on the left menu.
2. Click **"Create API Key"**.
3. Name it `Gamers Guild Platform` and give it **Full Access**.
4. Click **Add**.
5. Copy the generated key (it starts with `re_...`).

---

## 3. Add to Your `.env.local`

Open `.env.local` in your project and set:
```env
RESEND_API_KEY=re_123456789_abcdefg
EMAIL_FROM=Gamers Guild Esports <onboarding@resend.dev>
```

> **Note**: For initial testing without your own domain, Resend provides the default verified testing email: `onboarding@resend.dev`. You can send test emails to the email address registered on your Resend account.
> 
> To send to any player's email address in production, add your custom domain (e.g. `gamersguild.gg`) under **Domains** in the Resend dashboard and verify the 3 DNS records with your domain provider (GoDaddy, Namecheap, Cloudflare, etc.).

---

## 4. Local Testing Without API Keys (Zero-Config Simulation)

If you do not have a Resend key yet, the application automatically simulates email delivery in local development mode:
- It logs the dispatched confirmation email to the developer console:
  `[EMAIL DISPATCH SIMULATION] Sent to: player@example.com | Code: MH27`
- The player will still see their confirmation slip with their registration code on screen immediately!
- The admin can also click **"Resend Email"** in `/admin/registrations` to test resending at any time without generating a duplicate code.
