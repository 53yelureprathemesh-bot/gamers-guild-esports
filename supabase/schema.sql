-- ==============================================================================
-- GAMERS GUILD ESPORTS - COMPREHENSIVE PRODUCTION DATABASE SCHEMA
-- Stack: Supabase (PostgreSQL 15+) with Row Level Security (RLS) & Atomic Code Generator
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STATE CODES & CONCURRENCY-SAFE COUNTERS
CREATE TABLE IF NOT EXISTS state_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_code VARCHAR(10) UNIQUE NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS state_counters (
    state_code VARCHAR(10) PRIMARY KEY,
    current_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial State Codes
INSERT INTO state_codes (state_code, state_name) VALUES
('MH', 'Maharashtra'),
('GJ', 'Gujarat'),
('MP', 'Madhya Pradesh'),
('KA', 'Karnataka'),
('TS', 'Telangana'),
('AP', 'Andhra Pradesh'),
('DL', 'Delhi'),
('RJ', 'Rajasthan'),
('UP', 'Uttar Pradesh'),
('WB', 'West Bengal'),
('TN', 'Tamil Nadu'),
('KL', 'Kerala'),
('GA', 'Goa'),
('PB', 'Punjab'),
('HR', 'Haryana'),
('BR', 'Bihar'),
('OD', 'Odisha'),
('JH', 'Jharkhand'),
('CG', 'Chhattisgarh'),
('AS', 'Assam'),
('UK', 'Uttarakhand'),
('HP', 'Himachal Pradesh'),
('JK', 'Jammu and Kashmir'),
('ML', 'Meghalaya'),
('MN', 'Manipur'),
('TR', 'Tripura'),
('NL', 'Nagaland'),
('MZ', 'Mizoram')
ON CONFLICT (state_code) DO NOTHING;

-- Initialize counters
INSERT INTO state_counters (state_code, current_count)
SELECT state_code, 0 FROM state_codes
ON CONFLICT (state_code) DO NOTHING;

-- ATOMIC CONCURRENCY-SAFE CODE GENERATOR FUNCTION
CREATE OR REPLACE FUNCTION generate_state_registration_code(p_state_code TEXT)
RETURNS TEXT AS $$
DECLARE
    v_clean_code TEXT;
    v_next_val INT;
BEGIN
    v_clean_code := UPPER(TRIM(p_state_code));
    IF v_clean_code IS NULL OR length(v_clean_code) = 0 THEN
        v_clean_code := 'GG';
    END IF;

    -- Concurrency-safe atomic increment with row-level lock
    INSERT INTO state_counters (state_code, current_count)
    VALUES (v_clean_code, 1)
    ON CONFLICT (state_code)
    DO UPDATE SET current_count = state_counters.current_count + 1, updated_at = NOW()
    RETURNING current_count INTO v_next_val;

    RETURN v_clean_code || v_next_val::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PROFILES & ADMIN ROLE-BASED ACCESS CONTROL (RBAC)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'EVENT_ADMIN', 'REGISTRATION_MANAGER', 'CONTENT_EDITOR')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SITE SETTINGS & HOMEPAGE CONTENT MANAGEMENT
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial site settings
INSERT INTO site_settings (key, value, description) VALUES
('hero', '{
    "tagline": "ENTER THE ARENA. BUILD YOUR LEGACY.",
    "subheading": "India’s Premier Competitive Gaming Organization. Dominating esports arenas, scouting apex talent, and orchestrating tier-1 tournaments.",
    "cta_primary_text": "REGISTER NOW",
    "cta_primary_link": "/registration",
    "cta_secondary_text": "VIEW EVENTS",
    "cta_secondary_link": "/upcoming-events",
    "logo_url": "/images/logo.png"
}', 'Hero section content'),
('about', '{
    "heading": "FORGING LEGENDS IN THE DIGITAL COLOSSEUM",
    "description": "Gamers Guild Esports is a powerhouse organization built for players who live to compete. From grassroots campus showdowns to national LAN grand finals, we deliver high-stakes, broadcast-grade esports.",
    "mission": "Empower underground gamers, cultivate esports stars, and raise competitive gaming standards across India.",
    "vision": "To establish India as a global esports powerhouse through relentless talent development and world-class championship spectacles."
}', 'About section text'),
('statistics', '[
    {"number": "500+", "label": "PLAYERS", "icon": "Users"},
    {"number": "25+", "label": "EVENTS", "icon": "Trophy"},
    {"number": "₹1L+", "label": "PRIZE DISTRIBUTED", "icon": "Coins"},
    {"number": "10+", "label": "CITIES", "icon": "MapPin"}
]', 'Homepage statistics cards'),
('contact', '{
    "email": "contact@gamersguild.gg",
    "phone": "+91 98765 43210",
    "address": "Gamers Guild Arena, Cyber District, Nagpur, Maharashtra, India",
    "discord": "https://discord.gg/gamersguild",
    "instagram": "https://instagram.com/gamersguildesports",
    "youtube": "https://youtube.com/@gamersguildesports",
    "twitter": "https://twitter.com/gamersguildgg"
}', 'Contact details and social links')
ON CONFLICT (key) DO NOTHING;

-- 5. EVENTS & TOURNAMENTS
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    game VARCHAR(100) NOT NULL,
    poster_url TEXT,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    mode VARCHAR(50) NOT NULL CHECK (mode IN ('ONLINE', 'OFFLINE', 'HYBRID')),
    prize_pool VARCHAR(100) NOT NULL,
    entry_fee VARCHAR(100) DEFAULT 'FREE',
    registration_deadline TIMESTAMPTZ NOT NULL,
    total_slots INT NOT NULL DEFAULT 100,
    filled_slots INT NOT NULL DEFAULT 0,
    description TEXT,
    rules JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED')),
    is_published BOOLEAN DEFAULT TRUE,
    registration_form_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sample events
INSERT INTO events (slug, title, game, poster_url, date, time, venue, mode, prize_pool, entry_fee, registration_deadline, total_slots, filled_slots, description, rules, status, is_published)
VALUES 
(
    'neural-nexus-2k26',
    'NEURAL NEXUS 2K26 - BGMI CHAMPIONSHIP',
    'BGMI (Battlegrounds Mobile India)',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    '2026-10-15',
    '05:00 PM IST',
    'Discord & Custom Rooms (Online Finals at GG Arena, Nagpur)',
    'ONLINE',
    '₹50,000',
    'FREE ENTRY',
    '2026-10-12 23:59:59+05:30',
    100,
    42,
    'The flagship mobile battle royale tournament of the season. 100 squads drop into Erangel for ultimate glory and cash prizes.',
    '["All team members must be at least level 35 in BGMI.", "Emulators, iPad, and triggers are strictly prohibited.", "Record POV of the entire match for verification.", "Admins decision will be final and binding."]'::jsonb,
    'UPCOMING',
    TRUE
),
(
    'free-fire-clash-of-titans',
    'FREE FIRE CLASH OF TITANS: SEASON 4',
    'Free Fire Max',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
    '2026-09-28',
    '06:30 PM IST',
    'Online Custom Lobby',
    'ONLINE',
    '₹25,000',
    'FREE ENTRY',
    '2026-09-26 23:59:59+05:30',
    48,
    48,
    'High-octane Bermuda showdown. 12 elite teams battle through 6 rounds of intense gunfights.',
    '["Only mobile devices allowed.", "Gun attributes will be disabled.", "Any toxic behavior in chat leads to immediate squad disqualification."]'::jsonb,
    'ONGOING',
    TRUE
),
(
    'valorant-cyber-strike-lan',
    'VALORANT CYBER STRIKE INVITATIONAL',
    'Valorant',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    '2026-11-05',
    '11:00 AM IST',
    'Gamers Guild Esports Arena, Nagpur',
    'OFFLINE',
    '₹1,00,000',
    '₹500 / Team',
    '2026-10-30 23:59:59+05:30',
    32,
    18,
    'Premier 5v5 tactical shooter LAN event. Premium 240Hz setups, live casters, and main stage finals.',
    '["Standard tournament mode with overtime enabled.", "Bring your own peripherals (Mice, Keyboard, Headset).", "Valid government ID proof required at venue check-in."]'::jsonb,
    'UPCOMING',
    TRUE
)
ON CONFLICT (slug) DO NOTHING;

-- 6. TOURNAMENT MATCHES & POINTS TABLES (FOR ONGOING EVENTS)
CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL,
    match_title VARCHAR(100) NOT NULL,
    scheduled_time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'LIVE', 'COMPLETED')),
    stream_url TEXT,
    map_name VARCHAR(100),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_points_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    rank INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    matches_played INT NOT NULL DEFAULT 0,
    wwcd INT NOT NULL DEFAULT 0,
    placement_points INT NOT NULL DEFAULT 0,
    kill_points INT NOT NULL DEFAULT 0,
    total_points INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sample points table for Free Fire Ongoing Event
INSERT INTO tournament_points_table (event_id, rank, team_name, matches_played, wwcd, placement_points, kill_points, total_points)
SELECT id, 1, 'GODLIKE ESPORTS', 4, 2, 40, 34, 74 FROM events WHERE slug = 'free-fire-clash-of-titans'
UNION ALL
SELECT id, 2, 'TEAM SOUL', 4, 1, 32, 28, 60 FROM events WHERE slug = 'free-fire-clash-of-titans'
UNION ALL
SELECT id, 3, 'ORANGE ROCK', 4, 1, 26, 22, 48 FROM events WHERE slug = 'free-fire-clash-of-titans'
UNION ALL
SELECT id, 4, 'BLIND ESPORTS', 4, 0, 20, 24, 44 FROM events WHERE slug = 'free-fire-clash-of-titans'
UNION ALL
SELECT id, 5, 'HYDRA CLAN', 4, 0, 16, 18, 34 FROM events WHERE slug = 'free-fire-clash-of-titans'
ON CONFLICT DO NOTHING;

-- 7. DYNAMIC REGISTRATION FORMS & FIELDS
CREATE TABLE IF NOT EXISTS registration_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registration_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES registration_forms(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
        'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'EMAIL', 'PHONE', 
        'DATE', 'DROPDOWN', 'MULTIPLE_CHOICE', 'CHECKBOX', 
        'IMAGE_UPLOAD', 'FILE_UPLOAD', 'PDF_UPLOAD'
    )),
    description TEXT,
    placeholder TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    options JSONB DEFAULT '[]'::jsonb,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Registration Form
INSERT INTO registration_forms (id, title, description, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'GAMERS GUILD OFFICIAL PLAYER & SQUAD REGISTRATION',
    'Fill out all player details, game identifiers, and required verification proofs to enter the competitive bracket.',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Update default form to event
UPDATE events SET registration_form_id = 'a0000000-0000-0000-0000-000000000001' WHERE slug = 'neural-nexus-2k26';

-- Seed Standard Form Fields
INSERT INTO registration_fields (form_id, label, field_type, description, placeholder, is_required, options, sort_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Full Name', 'SHORT_TEXT', 'Legal name as per government ID', 'John Doe', TRUE, '[]'::jsonb, 1),
('a0000000-0000-0000-0000-000000000001', 'Date of Birth', 'DATE', 'For age bracket verification', '', TRUE, '[]'::jsonb, 2),
('a0000000-0000-0000-0000-000000000001', 'Gender', 'DROPDOWN', 'Select gender', '', TRUE, '["Male", "Female", "Non-Binary", "Prefer not to say"]'::jsonb, 3),
('a0000000-0000-0000-0000-000000000001', 'Mobile Number (WhatsApp)', 'PHONE', 'For bracket link & room ID coordination', '+91 9876543210', TRUE, '[]'::jsonb, 4),
('a0000000-0000-0000-0000-000000000001', 'Email Address', 'EMAIL', 'Confirmation code & match updates will be delivered here', 'player@gamersguild.gg', TRUE, '[]'::jsonb, 5),
('a0000000-0000-0000-0000-000000000001', 'State', 'DROPDOWN', 'State determines your official state code (e.g. MH27)', '', TRUE, '["Maharashtra", "Gujarat", "Madhya Pradesh", "Karnataka", "Telangana", "Delhi", "Rajasthan", "Uttar Pradesh", "West Bengal", "Tamil Nadu", "Kerala", "Punjab", "Haryana", "Bihar", "Odisha", "Other"]'::jsonb, 6),
('a0000000-0000-0000-0000-000000000001', 'District', 'SHORT_TEXT', 'Home district for regional classification', 'Nagpur', TRUE, '[]'::jsonb, 7),
('a0000000-0000-0000-0000-000000000001', 'City / Town', 'SHORT_TEXT', 'Current city of residence', 'Nagpur', TRUE, '[]'::jsonb, 8),
('a0000000-0000-0000-0000-000000000001', 'Game Selected', 'DROPDOWN', 'Game title you are registering for', '', TRUE, '["BGMI (Battlegrounds Mobile India)", "Free Fire Max", "Valorant", "Call of Duty: Mobile"]'::jsonb, 9),
('a0000000-0000-0000-0000-000000000001', 'In-Game Name (IGN)', 'SHORT_TEXT', 'Exact in-game handle', 'HYDRA_SNIPER', TRUE, '[]'::jsonb, 10),
('a0000000-0000-0000-0000-000000000001', 'Character UID / Player ID', 'SHORT_TEXT', 'Numeric account ID', '5129481023', TRUE, '[]'::jsonb, 11),
('a0000000-0000-0000-0000-000000000001', 'Team Name', 'SHORT_TEXT', 'Official squad or clan name', 'CYBER TITANS', TRUE, '[]'::jsonb, 12),
('a0000000-0000-0000-0000-000000000001', 'Team Role', 'DROPDOWN', 'Role within the roster', '', TRUE, '["IGL (In-Game Leader)", "Assaulter", "Sniper", "Support / Healer", "Substitute"]'::jsonb, 13),
('a0000000-0000-0000-0000-000000000001', 'Gaming Experience & T1/T2 Tournaments Played', 'LONG_TEXT', 'Brief highlight of competitive achievements', 'Played Nodwin BGMI Open, Quarterfinalist in City LAN 2025.', FALSE, '[]'::jsonb, 14),
('a0000000-0000-0000-0000-000000000001', 'Government ID Proof (Aadhaar / Driving License / Student ID)', 'PDF_UPLOAD', 'Required for age and identity verification (Max 5MB PDF/JPG)', '', TRUE, '[]'::jsonb, 15),
('a0000000-0000-0000-0000-000000000001', 'Player Profile Photo', 'IMAGE_UPLOAD', 'High-res headshot for tournament stream overlays', '', TRUE, '[]'::jsonb, 16),
('a0000000-0000-0000-0000-000000000001', 'Payment Screenshot (If Paid Tournament)', 'IMAGE_UPLOAD', 'Upload UPI transaction screenshot if entry fee is applicable', '', FALSE, '[]'::jsonb, 17),
('a0000000-0000-0000-0000-000000000001', 'Team Logo', 'IMAGE_UPLOAD', 'Squad logo PNG with transparent background', '', FALSE, '[]'::jsonb, 18)
ON CONFLICT DO NOTHING;

-- 8. REGISTRATIONS (PRIVATE & SECURE)
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_code VARCHAR(20) NOT NULL UNIQUE, -- Generated state code e.g. MH27
    event_id UUID REFERENCES events(id) ON DELETE RESTRICT,
    form_id UUID REFERENCES registration_forms(id) ON DELETE RESTRICT,
    player_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    game VARCHAR(100) NOT NULL,
    in_game_name VARCHAR(100) NOT NULL,
    player_uid VARCHAR(100) NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    team_role VARCHAR(100),
    gaming_experience TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'APPROVED', 'REJECTED')),
    email_status VARCHAR(50) NOT NULL DEFAULT 'NOT_SENT' CHECK (email_status IN ('NOT_SENT', 'SENDING', 'SENT', 'FAILED')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_public_code ON registrations(public_code);
CREATE INDEX IF NOT EXISTS idx_reg_state ON registrations(state);
CREATE INDEX IF NOT EXISTS idx_reg_district ON registrations(district);
CREATE INDEX IF NOT EXISTS idx_reg_game ON registrations(game);
CREATE INDEX IF NOT EXISTS idx_reg_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_reg_email ON registrations(email);

-- Custom dynamic field answers & files
CREATE TABLE IF NOT EXISTS registration_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    field_id UUID REFERENCES registration_fields(id) ON DELETE CASCADE,
    field_label VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registration_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    field_id UUID REFERENCES registration_fields(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    image_url TEXT,
    link TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sample announcements
INSERT INTO announcements (title, content, priority, image_url, link, is_published) VALUES
('NEURAL NEXUS 2K26 REGISTRATIONS LIVE', 'The biggest BGMI tournament of 2026 is officially accepting team registrations. Register before slots fill up!', 'URGENT', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', '/registration', TRUE),
('LAN FINALS TICKETS NOW AVAILABLE', 'Spectate the Valorant Cyber Strike live at Gamers Guild Arena Nagpur. Free pass with seat booking.', 'HIGH', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', '/upcoming-events', TRUE),
('ANTI-CHEAT POLICY UPDATE', 'Strict hardware-ID bans and mandatory video POV checks will be enforced across all ongoing stages.', 'MEDIUM', '', '', TRUE)
ON CONFLICT DO NOTHING;

-- 10. GALLERY
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'LAN_EVENTS',
    image_url TEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO gallery (title, description, category, image_url, sort_order) VALUES
('Winter Championship Trophy Lift', 'Team Hydra lifting the ₹1L Grand Trophy at GG Arena Nagpur', 'LAN_EVENTS', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', 1),
('Main Stage Lighting & Casters', 'High adrenaline commentary desk during the grand finals', 'ARENA', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 2),
('Player Pods & LAN Battleground', '32 competitive rigs running simultaneous bracket matches', 'STAGE', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 3),
('Squad Huddle Before Final Circle', 'Cyber Titans discussing match strategy moments before drop', 'COMMUNITY', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', 4)
ON CONFLICT DO NOTHING;

-- 11. SPONSORS & PARTNERS
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    website TEXT,
    description TEXT,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('MAIN_SPONSOR', 'ESPORTS_PARTNER', 'TECH_PARTNER', 'COMMUNITY_PARTNER')),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sponsors (name, logo_url, website, description, tier, sort_order) VALUES
('CYBERCORE HARDWARE', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://example.com', 'Official High-Performance Gaming Rig Partner', 'MAIN_SPONSOR', 1),
('NEXUS ENERGY DRINKS', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80', 'https://example.com', 'Fueling Champions Through Extended Clutch Rounds', 'ESPORTS_PARTNER', 2),
('QUANTUM BROADCAST NETWORKS', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80', 'https://example.com', 'Zero-Latency Tournament Stream Transmission', 'TECH_PARTNER', 3),
('DISCORD INDIA COMMUNITY', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80', 'https://example.com', 'Official Match Coordination & Voice Server Partner', 'COMMUNITY_PARTNER', 4)
ON CONFLICT DO NOTHING;

-- 12. EMAIL TEMPLATES & LOGS
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    sender_name VARCHAR(100) DEFAULT 'Gamers Guild Esports',
    reply_to VARCHAR(100) DEFAULT 'support@gamersguild.gg',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO email_templates (slug, name, subject, body_html) VALUES
(
    'registration-confirmed',
    'Registration Confirmation Email',
    'Gamers Guild Esports — Registration Confirmed [{{registration_code}}]',
    '<div style="font-family: Arial, sans-serif; background: #07090e; color: #f8fafc; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #00ff9d; letter-spacing: 2px; margin: 0;">GAMERS GUILD ESPORTS</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">ENTER THE ARENA. BUILD YOUR LEGACY.</p>
        </div>
        
        <p style="font-size: 16px;">Hello <strong>{{player_name}}</strong>,</p>
        <p style="color: #cbd5e1; line-height: 1.6;">Your tournament registration with Gamers Guild Esports has been received and logged into our central verification grid.</p>
        
        <div style="background: #0f172a; border-left: 4px solid #00f0ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 6px 0; font-size: 14px; color: #94a3b8;">OFFICIAL REGISTRATION CODE</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #00f0ff; letter-spacing: 2px;">{{registration_code}}</p>
            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 15px 0;" />
            <p style="margin: 6px 0;"><strong>Event:</strong> {{event_name}}</p>
            <p style="margin: 6px 0;"><strong>State:</strong> {{state}}</p>
            <p style="margin: 6px 0;"><strong>Team:</strong> {{team_name}}</p>
            <p style="margin: 6px 0;"><strong>Status:</strong> <span style="color: #ffb800; font-weight: bold;">{{status}}</span></p>
            <p style="margin: 6px 0;"><strong>Submitted:</strong> {{submission_date}}</p>
        </div>
        
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Please keep this registration code safe. Our tournament admins will verify your uploaded credentials. You will be pinged via WhatsApp & Email before custom room IDs and passwords are dispatched.</p>
        
        <div style="text-align: center; margin-top: 35px; border-top: 1px solid #1e293b; padding-top: 20px;">
            <p style="color: #64748b; font-size: 12px; margin: 0;">Gamers Guild Esports &copy; 2026. All rights reserved.</p>
            <p style="color: #64748b; font-size: 12px; margin: 5px 0 0 0;">Nagpur, Maharashtra, India &bull; contact@gamersguild.gg</p>
        </div>
    </div>'
) ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    template_slug VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FUTURE ARCHITECTURE: TEAMS & PLAYER PROFILES
CREATE TABLE IF NOT EXISTS tournament_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tag VARCHAR(20) NOT NULL,
    logo_url TEXT,
    captain_id UUID,
    total_tournaments INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ign VARCHAR(100) NOT NULL,
    primary_game VARCHAR(100) NOT NULL,
    team_id UUID REFERENCES tournament_teams(id) ON DELETE SET NULL,
    total_kills INT DEFAULT 0,
    mvp_titles INT DEFAULT 0,
    earnings VARCHAR(100) DEFAULT '₹0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_points_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_codes ENABLE ROW LEVEL SECURITY;

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Public can view active/published resources
CREATE POLICY "Public can view published events" ON events FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view tournament matches" ON tournament_matches FOR SELECT USING (TRUE);
CREATE POLICY "Public can view points table" ON tournament_points_table FOR SELECT USING (TRUE);
CREATE POLICY "Public can view active forms" ON registration_forms FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view form fields" ON registration_fields FOR SELECT USING (TRUE);
CREATE POLICY "Public can view announcements" ON announcements FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view gallery" ON gallery FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public can view sponsors" ON sponsors FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public can view state codes" ON state_codes FOR SELECT USING (is_active = TRUE);

-- Public can submit registration (INSERT ONLY)
CREATE POLICY "Public can insert registrations" ON registrations FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can insert registration answers" ON registration_answers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can insert registration files" ON registration_files FOR INSERT WITH CHECK (TRUE);

-- Registrations SELECT is strictly restricted to authenticated Admins or specific query by token
CREATE POLICY "Admins can view and manage all registrations" ON registrations
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = TRUE));

CREATE POLICY "Admins can view registration answers" ON registration_answers
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = TRUE));

CREATE POLICY "Admins can view registration files" ON registration_files
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = TRUE));

CREATE POLICY "Admins can manage events" ON events
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = TRUE));

CREATE POLICY "Admins can manage admin users" ON admin_users
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND admin_users.role = 'SUPER_ADMIN'));

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
