# GAMERS GUILD ESPORTS — OFFICIAL FULL-STACK WEB PLATFORM

```
   ██████╗  █████╗ ███╗   ███╗███████╗██████╗ ███████╗   ██████╗ ██╗   ██╗██╗██╗     ██████╗ 
  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔══██╗██╔════╝  ██╔════╝ ██║   ██║██║██║     ██╔══██╗
  ██║  ███╗███████║██╔████╔██║█████╗  ██████╔╝███████╗  ██║  ███╗██║   ██║██║██║     ██║  ██║
  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ██╔══██╗╚════██║  ██║   ██║██║   ██║██║██║     ██║  ██║
  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗██║  ██║███████║  ╚██████╔╝╚██████╔╝██║███████╗██████╔╝
   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝   ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ 
                                  E S P O R T S
```

> **ENTER THE ARENA. BUILD YOUR LEGACY.**

A complete, production-ready, full-stack esports organization platform built for **Gamers Guild Esports**. Featuring a futuristic cyber theme, dynamic Google-Forms-style registration with atomic state-wise code allocation (e.g. `MH1`, `MH27`, `GJ14`), private document vaults, role-based admin control center, live match points tables, visual content editor, and email automation.

---

## 🚀 Key Features

### 1. Public Esports Portal
- **Hero & Official Brand Identity**: Incorporates the official Gamers Guild metallic shield emblem with neon emerald/cyan glows.
- **Upcoming Tournaments Dashboard (`/upcoming-events`)**: Browse by game (BGMI, Free Fire Max, Valorant, Call of Duty), filter by mode (Online/LAN), inspect rules, prize pools, remaining slots, and direct registration links.
- **Ongoing Events Live Pulse (`/ongoing-events`)**: Live broadcast badges, current match rounds, map schedules, qualified rosters, and real-time tournament points tables (WWCD, Placement Pts, Kill Pts, Total Pts).
- **Organization Lore & Values (`/about`)**: Mission, vision, tier-1 operational blueprint, and milestones.
- **Headquarters Relay (`/contact`)**: Direct support ticket transmission, WhatsApp helpline, Discord guild, and arena location.

### 2. Google-Forms-Style Dynamic Registration (`/registration`)
- **Event Selection**: Auto-populates selected tournament with prize pool & mode indicators.
- **4 Structured Form Sections**:
  1. Personal Identification (Name, DOB, Gender, Mobile, Email, State, District, City).
  2. Gaming Telemetry (Game, In-Game Name, UID / Player ID, Squad Name, Role, Past Scrim Experience).
  3. Dynamic Questionnaire (Fields configured on-the-fly by admins).
  4. Document Vault (Aadhaar / ID proof, player photo, payment screenshot, team logo with JPG/PNG/PDF validation and 5MB size guard).
- **Atomic State Registration Codes**: Concurrency-safe state-wise counter engine ensures simultaneous players receive sequential codes (e.g., Maharashtra players receive `MH1`, `MH2`, `MH3` ... `MH27`; Gujarat players receive `GJ1`, `GJ2`, `GJ3` ... `GJ14`).
- **Instant Confirmation Slip**: Displays huge state code, player details, email notification alert, and 1-click **PRINT / SAVE AS PDF** button.

### 3. Admin Control Center (`/admin`)
- **Role-Based Access Control (RBAC)**:
  - `SUPER_ADMIN`: Root control, user provisioning, state codes, email templates.
  - `EVENT_ADMIN`: Manage upcoming tournaments, live match rounds, and points tables.
  - `REGISTRATION_MANAGER`: Review private registrations, verify player IDs, approve/reject squads, resend confirmation emails, and export CSV.
  - `CONTENT_EDITOR`: Visual home editor, announcements, gallery media, and sponsors.
- **Visual Homepage Editor (`/admin/home-editor`)**: Modify hero title, subheadings, CTA buttons, about text, and statistics counters without touching source code.
- **Dynamic Form Builder (`/admin/forms`)**: Drag, reorder, duplicate, add, and configure 12 different field types (short text, long text, dropdown, radio, checkbox, image upload, PDF upload).
- **State-Wise Registration Explorer (`/admin/registrations`)**:
  - Drilldown tree: `INDIA -> STATE -> DISTRICT -> GAME -> REGISTRATIONS`.
  - Search by Name, Email, Phone, UID, Team, or Registration Code (`MH27`).
  - View confidential player documents.
  - Verify, Approve, or Reject buttons.
  - Resend Email action (preserves existing state registration code).
  - 1-click CSV Export.
- **Email Template Editor (`/admin/email-settings`)**: Visual editor supporting variables (`{{player_name}}`, `{{registration_code}}`, `{{event_name}}`, `{{state}}`, `{{team_name}}`, `{{status}}`, `{{submission_date}}`) with live simulation preview.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Database**: Supabase, PostgreSQL 15, Row Level Security (RLS)
- **Code Generator**: Concurrency-safe atomic PostgreSQL stored procedure (`generate_state_registration_code`)
- **Storage**: Supabase Storage (`public-assets` and private `registration-docs`)
- **Transactional Email**: Resend API integration + local simulation fallback
- **Deployment**: Vercel Compatible

---

## ⚡ Quick Start (Run in VS Code in 2 Minutes)

You do **NOT** need any coding knowledge or pre-existing database credentials to run the project. A zero-config fallback demo store is built-in so everything works immediately!

### Step 1: Open Terminal in VS Code
Open the project folder in VS Code and open a terminal (`Ctrl + ~` or Terminal -> New Terminal).

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Public Website**: [http://localhost:3000](http://localhost:3000)
- **Registration Form**: [http://localhost:3000/registration](http://localhost:3000/registration)
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 👑 Logging into Admin Panel

1. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
2. Enter:
   - **Email**: `admin@gamersguild.gg`
   - **Password**: `admin123`
3. Click **"AUTHORIZE LOGIN"** (or use the 1-click **Quick Role Switcher** buttons at the bottom to test each of the 4 roles: Super Admin, Event Admin, Reg Manager, Content Editor).

---

## 🗄️ Connecting Live Supabase Database

When you are ready to connect a live PostgreSQL database on Supabase:
1. Follow our beginner guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).
2. Copy your keys into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Run `npm run dev` again. The application will seamlessly connect to your Supabase tables and storage buckets!

---

## 📧 Connecting Real Email Sending (Resend)

Follow our guide in [EMAIL_SETUP.md](./EMAIL_SETUP.md) to get a free API key from Resend (3,000 free emails/month).

---

## 📁 Project Folder Structure

```
gamers-guild-esports/
├── app/
│   ├── api/
│   │   ├── admin/data/route.ts          # Admin CRUD API
│   │   ├── registrations/submit/route.ts # Registration & atomic code generator
│   │   └── registrations/email/route.ts  # Confirmation email resend API
│   ├── admin/
│   │   ├── login/page.tsx               # Admin authentication & role switcher
│   │   ├── home-editor/page.tsx         # Visual CMS for hero, about & stats
│   │   ├── upcoming-events/page.tsx     # Add/edit/publish upcoming events
│   │   ├── ongoing-events/page.tsx      # Live scores & points table editor
│   │   ├── forms/page.tsx               # Dynamic Google-Forms-style builder
│   │   ├── registrations/page.tsx       # Private state-wise explorer & CSV export
│   │   ├── announcements/page.tsx       # News & live ticker alerts
│   │   ├── gallery/page.tsx             # Media highlights manager
│   │   ├── sponsors/page.tsx            # Sponsor tiers manager
│   │   ├── users/page.tsx               # Super Admin RBAC accounts
│   │   ├── email-settings/page.tsx      # Email template customizer & preview
│   │   ├── settings/page.tsx            # State code prefixes (MH, GJ, MP, etc.)
│   │   ├── layout.tsx                   # Admin sidebar & role gating
│   │   └── page.tsx                     # Analytics & metrics dashboard
│   ├── upcoming-events/page.tsx         # Public tournament calendar
│   ├── ongoing-events/page.tsx          # Public live matches & leaderboards
│   ├── registration/page.tsx            # Public Google-Forms-style registration
│   ├── about/page.tsx                   # About, Mission & Vision
│   ├── contact/page.tsx                 # Contact form & support channels
│   ├── globals.css                      # Cyber dark theme & neon effects
│   ├── layout.tsx                       # Global header & footer layout
│   └── page.tsx                         # 12-section futuristic homepage
├── components/
│   ├── Navbar.tsx                       # Navigation with official logo & live badge
│   └── Footer.tsx                       # Esports footer with branding & links
├── lib/
│   ├── dataStore.ts                     # In-memory demo data with atomic state counters
│   ├── defaultForm.ts                   # Standard questionnaire fields
│   ├── email.ts                         # Transactional email renderer & Resend integration
│   ├── stateCodes.ts                    # 28 Indian states, codes & district directories
│   ├── supabaseClient.ts                # Supabase browser & service clients
│   └── types.ts                         # TypeScript interfaces
├── public/
│   └── images/
│       └── logo.png                     # Official Gamers Guild Esports Logo
├── supabase/
│   └── schema.sql                       # 18 PostgreSQL tables, RLS & atomic function
├── EMAIL_SETUP.md                       # Resend email integration instructions
├── SUPABASE_SETUP.md                    # Complete Supabase beginner setup guide
├── tailwind.config.ts                   # Futuristic gaming theme config
└── package.json
```

---

## 🚀 Deployment to Vercel

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial Gamers Guild Esports platform commit"
   git remote add origin https://github.com/your-username/gamers-guild-esports.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. (Optional) Paste your Supabase environment variables into the **Environment Variables** section.
5. Click **"Deploy"**. Your website will be live worldwide in less than 60 seconds with free automatic SSL!

---

&copy; 2026 **GAMERS GUILD ESPORTS**. All Rights Reserved.
