# SUPABASE DATABASE SETUP GUIDE — GAMERS GUILD ESPORTS

This guide is written specifically for **complete beginners** with zero prior coding or database experience. Follow these steps to set up your PostgreSQL database, storage buckets, and admin security in under 5 minutes.

---

## 1. Create a Free Supabase Account & Project

1. Visit [supabase.com](https://supabase.com) and click **"Start your project"**.
2. Sign in with GitHub or your email address.
3. Click **"New Project"** in your Supabase dashboard.
4. Fill in the project details:
   - **Name**: `gamers-guild-esports`
   - **Database Password**: Create a strong password (save this safely).
   - **Region**: Choose **South Asia (Mumbai)** or the closest region to your players for minimum latency.
5. Click **"Create new project"** and wait about 1–2 minutes while Supabase provisions your PostgreSQL server.

---

## 2. Execute the Database SQL Schema

We have already created the complete database script for you in the project folder at:
`supabase/schema.sql`

1. In your Supabase project dashboard, look at the left sidebar and click on the **SQL Editor** icon (shaped like `>_` or a terminal).
2. Click **"+ New Query"**.
3. Open the file `supabase/schema.sql` on your computer, copy the entire code, and paste it into the Supabase SQL Editor box.
4. Click the green **"RUN"** button in the bottom right.
5. You will see a success message: `Success. No rows returned`.

### What This SQL Script Creates Automatically:
- **18 Tables**: `events`, `registrations`, `registration_forms`, `registration_fields`, `registration_files`, `site_settings`, `announcements`, `gallery`, `sponsors`, `tournament_points_table`, `state_codes`, `state_counters`, etc.
- **28 Indian States Pre-configured**: Maharashtra (MH), Gujarat (GJ), Madhya Pradesh (MP), Delhi (DL), etc.
- **Concurrency-Safe Atomic Code Generator Function**: `generate_state_registration_code()`. This ensures simultaneous registrations never collide or produce duplicate codes.
- **Row Level Security (RLS) Policies**: Keeps player Aadhaar/ID documents strictly private so normal visitors cannot access them.

---

## 3. Configure Supabase Storage Buckets

Tournaments require players to upload ID proofs and profile photos. Follow these steps to set up storage:

1. On the left sidebar, click **Storage**.
2. Click **"New Bucket"**.
3. Create the first bucket:
   - **Name**: `public-assets`
   - **Public bucket**: **Enable / Turn ON** (used for event posters and logos).
   - Click **Save**.
4. Click **"New Bucket"** again to create the second bucket:
   - **Name**: `registration-docs`
   - **Public bucket**: **Disable / Turn OFF** (this keeps player ID proofs and payment screenshots private).
   - Click **Save**.

---

## 4. Copy Your API Keys to Your Project

1. In Supabase, click the **Settings** gear icon at the bottom of the left sidebar.
2. Under "Project Settings", click **API**.
3. Copy the following values into your project's `.env.local` file:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public)** key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role (secret)** key -> `SUPABASE_SERVICE_ROLE_KEY`

Example `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnopqrst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Provisioning Your Super Admin User

1. In Supabase, go to **Authentication** -> **Users** in the sidebar.
2. Click **"Add User"** -> **"Create user"**.
3. Enter your email (e.g. `admin@gamersguild.gg`) and password.
4. In the SQL Editor, link this email as a `SUPER_ADMIN` with one quick query:
```sql
INSERT INTO admin_users (email, full_name, role, is_active)
VALUES ('admin@gamersguild.gg', 'Guild Commander', 'SUPER_ADMIN', TRUE);
```
5. You can now log into your admin dashboard at `/admin/login`!
