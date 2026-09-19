import { 
  Event, 
  Registration, 
  RegistrationForm, 
  Announcement, 
  GalleryItem, 
  Sponsor, 
  SiteSettings,
  EmailTemplate,
  EmailLog,
  AdminUser,
  TournamentMatch,
  PointsTableEntry
} from './types';
import { getStateCode } from './stateCodes';

// Initial Demo Seed Data
export const INITIAL_EVENTS: Event[] = [
  {
    id: "evt-001",
    slug: "neural-nexus-2k26",
    title: "NEURAL NEXUS 2K26 — BGMI CHAMPIONSHIP",
    game: "BGMI (Battlegrounds Mobile India)",
    poster_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    date: "2026-10-15",
    time: "05:00 PM IST",
    venue: "Online Custom Rooms & GG Esports Arena, Nagpur",
    mode: "ONLINE",
    prize_pool: "₹50,000",
    entry_fee: "FREE ENTRY",
    registration_deadline: "2026-10-12 23:59:59",
    total_slots: 100,
    filled_slots: 42,
    description: "The premier battle royale tournament of the season. 100 squads drop into Erangel for high-octane competitive action and cash prizes.",
    rules: [
      "All squad players must have minimum account Level 35 in BGMI.",
      "Emulators, iPad, and physical trigger accessories are strictly forbidden.",
      "Full POV screen recording must be retained for top 3 finishes.",
      "Tournament admin decisions are absolute and binding."
    ],
    status: "UPCOMING",
    is_published: true,
    registration_form_id: "form-default"
  },
  {
    id: "evt-002",
    slug: "free-fire-clash-of-titans",
    title: "FREE FIRE CLASH OF TITANS: SEASON 4",
    game: "Free Fire Max",
    poster_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    date: "2026-09-28",
    time: "06:30 PM IST",
    venue: "Online Custom Lobby",
    mode: "ONLINE",
    prize_pool: "₹25,000",
    entry_fee: "FREE ENTRY",
    registration_deadline: "2026-09-26 23:59:59",
    total_slots: 48,
    filled_slots: 48,
    description: "High-octane Bermuda showdown. 12 elite teams battle through 6 rounds of intense gunfights for state and national bragging rights.",
    rules: [
      "Mobile devices only. No emulators.",
      "Gun attributes turned OFF for true competitive parity.",
      "Teams failing to enter the room within 10 minutes of schedule forfeit their slot."
    ],
    status: "ONGOING",
    is_published: true,
    registration_form_id: "form-default",
    stream_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    is_stream_live: true
  },
  {
    id: "evt-003",
    slug: "valorant-cyber-strike-lan",
    title: "VALORANT CYBER STRIKE INVITATIONAL",
    game: "Valorant",
    poster_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    date: "2026-11-05",
    time: "11:00 AM IST",
    venue: "Gamers Guild Esports Arena, Nagpur, Maharashtra",
    mode: "OFFLINE",
    prize_pool: "₹1,00,000",
    entry_fee: "₹500 / Team",
    registration_deadline: "2026-10-30 23:59:59",
    total_slots: 32,
    filled_slots: 18,
    description: "Premier 5v5 tactical shooter LAN championship featuring 240Hz monitors, noise-cancelling player booths, live stage commentary, and streaming.",
    rules: [
      "Standard Competitive 5v5 tournament format with overtime enabled.",
      "Players may bring their own approved peripherals (mouse, keyboard, headset).",
      "Valid physical government ID proof required at venue check-in."
    ],
    status: "UPCOMING",
    is_published: true,
    registration_form_id: "form-default"
  }
];

export const INITIAL_POINTS_TABLE: PointsTableEntry[] = [
  { id: "pt-1", event_id: "evt-002", rank: 1, team_name: "GODLIKE ESPORTS", matches_played: 4, wwcd: 2, placement_points: 40, kill_points: 34, total_points: 74 },
  { id: "pt-2", event_id: "evt-002", rank: 2, team_name: "TEAM SOUL", matches_played: 4, wwcd: 1, placement_points: 32, kill_points: 28, total_points: 60 },
  { id: "pt-3", event_id: "evt-002", rank: 3, team_name: "ORANGE ROCK", matches_played: 4, wwcd: 1, placement_points: 26, kill_points: 22, total_points: 48 },
  { id: "pt-4", event_id: "evt-002", rank: 4, team_name: "BLIND ESPORTS", matches_played: 4, wwcd: 0, placement_points: 20, kill_points: 24, total_points: 44 },
  { id: "pt-5", event_id: "evt-002", rank: 5, team_name: "HYDRA CLAN", matches_played: 4, wwcd: 0, placement_points: 16, kill_points: 18, total_points: 34 },
  { id: "pt-6", event_id: "evt-002", rank: 6, team_name: "CYBER TITANS", matches_played: 4, wwcd: 0, placement_points: 12, kill_points: 14, total_points: 26 }
];

export const INITIAL_MATCHES: TournamentMatch[] = [
  { id: "m-1", event_id: "evt-002", round_name: "Semi-Finals", match_title: "Round 5 - Bermuda", scheduled_time: "07:15 PM IST", status: "LIVE", stream_url: "https://youtube.com", map_name: "Bermuda" },
  { id: "m-2", event_id: "evt-002", round_name: "Grand Finals", match_title: "Round 6 - Purgatory", scheduled_time: "08:30 PM IST", status: "UPCOMING", stream_url: "https://youtube.com", map_name: "Purgatory" }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  hero: {
    tagline: "ENTER THE ARENA. BUILD YOUR LEGACY.",
    subheading: "India's Premier Competitive Gaming Organization. Dominating esports arenas, scouting apex talent, and orchestrating tier-1 broadcast championships.",
    cta_primary_text: "REGISTER NOW",
    cta_primary_link: "/registration",
    cta_secondary_text: "VIEW EVENTS",
    cta_secondary_link: "/upcoming-events",
    logo_url: "/images/logo.png"
  },
  about: {
    heading: "FORGING CHAMPIONS IN THE DIGITAL COLOSSEUM",
    description: "Gamers Guild Esports is a powerhouse organization built for players who live to compete. From grassroots campus showdowns to national LAN grand finals, we deliver high-stakes, broadcast-grade esports.",
    mission: "Empower underground gamers, cultivate esports stars, and elevate competitive gaming standards across every state of India.",
    vision: "To establish India as a global esports powerhouse through relentless talent development and world-class championship spectacles."
  },
  statistics: [
    { number: "500+", label: "PLAYERS", icon: "Users" },
    { number: "25+", label: "EVENTS", icon: "Trophy" },
    { number: "₹1L+", label: "PRIZE DISTRIBUTED", icon: "Coins" },
    { number: "10+", label: "CITIES", icon: "MapPin" }
  ],
  contact: {
    email: "contact@gamersguild.gg",
    phone: "+91 98765 43210",
    address: "Gamers Guild Esports Arena, Cyber District, Nagpur, Maharashtra, India",
    discord: "https://discord.gg/gamersguild",
    instagram: "https://instagram.com/gamersguildesports",
    youtube: "https://youtube.com/@gamersguildesports",
    twitter: "https://twitter.com/gamersguildgg"
  }
};

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    title: "NEURAL NEXUS 2K26 REGISTRATIONS ARE OFFICIALLY LIVE!",
    content: "The biggest BGMI mobile championship is accepting registrations. Squads must register before the cutoff date to secure their bracket seeding.",
    priority: "URGENT",
    image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    link: "/registration",
    is_published: true,
    created_at: "2026-09-15"
  },
  {
    id: "ann-2",
    title: "SPECTATOR PASSES: VALORANT CYBER STRIKE LAN IN NAGPUR",
    content: "Come experience high-stakes LAN matches in person! Limited audience seats with live commentary and exclusive team jerseys.",
    priority: "HIGH",
    image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    link: "/upcoming-events",
    is_published: true,
    created_at: "2026-09-12"
  },
  {
    id: "ann-3",
    title: "UPDATED TOURNAMENT ANTI-CHEAT POLICY",
    content: "Zero tolerance for aim assistance, hardware triggers, or suspicious emulator usage. POV recording will be verified for all final stages.",
    priority: "MEDIUM",
    image_url: "",
    link: "",
    is_published: true,
    created_at: "2026-09-10"
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Winter Championship Trophy Lift",
    description: "Team Hydra lifting the ₹1L Grand Trophy at GG Arena Nagpur",
    category: "LAN_EVENTS",
    image_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    is_published: true,
    sort_order: 1,
    created_at: "2026-08-20"
  },
  {
    id: "gal-2",
    title: "Main Stage Lighting & Casters Desk",
    description: "High adrenaline commentary desk during the grand finals",
    category: "ARENA",
    image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    is_published: true,
    sort_order: 2,
    created_at: "2026-08-20"
  },
  {
    id: "gal-3",
    title: "Player Pods & LAN Battleground",
    description: "32 competitive rigs running simultaneous bracket matches",
    category: "STAGE",
    image_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    is_published: true,
    sort_order: 3,
    created_at: "2026-08-20"
  },
  {
    id: "gal-4",
    title: "Squad Huddle Before Final Circle",
    description: "Cyber Titans discussing match strategy moments before drop",
    category: "COMMUNITY",
    image_url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80",
    is_published: true,
    sort_order: 4,
    created_at: "2026-08-20"
  }
];

export const INITIAL_SPONSORS: Sponsor[] = [
  {
    id: "sp-1",
    name: "CYBERCORE HARDWARE",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    website: "https://example.com",
    description: "Official High-Performance Gaming Rig Partner",
    tier: "MAIN_SPONSOR",
    sort_order: 1,
    is_active: true
  },
  {
    id: "sp-2",
    name: "NEXUS ENERGY",
    logo_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80",
    website: "https://example.com",
    description: "Fueling Champions Through Extended Clutch Rounds",
    tier: "ESPORTS_PARTNER",
    sort_order: 2,
    is_active: true
  },
  {
    id: "sp-3",
    name: "QUANTUM BROADCAST NETWORKS",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    website: "https://example.com",
    description: "Zero-Latency Tournament Stream Transmission",
    tier: "TECH_PARTNER",
    sort_order: 3,
    is_active: true
  },
  {
    id: "sp-4",
    name: "DISCORD INDIA COMMUNITY",
    logo_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80",
    website: "https://example.com",
    description: "Official Tournament Voice Server Partner",
    tier: "COMMUNITY_PARTNER",
    sort_order: 4,
    is_active: true
  }
];

export const INITIAL_ADMINS: AdminUser[] = [
  { 
    id: "adm-1", 
    email: "53yelureprathemesh@gmail.com", 
    password: "Prathamesh@27",
    full_name: "Prathamesh (Super Admin)", 
    role: "SUPER_ADMIN", 
    is_active: true, 
    created_at: "2026-01-01" 
  },
  { 
    id: "adm-2", 
    email: "admineventgge@gmail.com", 
    password: "gamresguildesp@21",
    full_name: "Event Administrator", 
    role: "EVENT_ADMIN", 
    is_active: true, 
    created_at: "2026-09-20" 
  },
  { 
    id: "adm-3", 
    email: "eventregester@gge.com", 
    password: "gamersguildesports@22",
    full_name: "Registration Manager", 
    role: "REGISTRATION_MANAGER", 
    is_active: true, 
    created_at: "2026-09-20" 
  },
  { 
    id: "adm-4", 
    email: "managercontantgge@gge.com", 
    password: "gamersguildesp@ggesports",
    full_name: "Content Manager", 
    role: "CONTENT_EDITOR", 
    is_active: true, 
    created_at: "2026-09-20" 
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: "reg-001",
    public_code: "MH27",
    event_id: "evt-001",
    form_id: "form-default",
    player_name: "Rahul Deshmukh",
    email: "rahul.deshmukh@gmail.com",
    phone: "+91 98220 12345",
    date_of_birth: "2003-05-14",
    gender: "Male",
    state: "Maharashtra",
    district: "Nagpur",
    city: "Nagpur",
    game: "BGMI (Battlegrounds Mobile India)",
    in_game_name: "TITAN_SNIPER",
    player_uid: "5129481023",
    team_name: "CYBER TITANS",
    team_role: "IGL (In-Game Leader)",
    gaming_experience: "Semifinalist at Nagpur Esports Open 2025.",
    status: "APPROVED",
    email_status: "SENT",
    admin_notes: "ID and payment verified by admin.",
    created_at: "2026-09-16T10:15:00Z",
    event_title: "NEURAL NEXUS 2K26 — BGMI CHAMPIONSHIP",
    files: [
      { id: "f-1", file_name: "aadhaar_rahul.pdf", file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", is_private: true, mime_type: "application/pdf" },
      { id: "f-2", file_name: "player_photo.png", file_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", is_private: false, mime_type: "image/png" }
    ]
  },
  {
    id: "reg-002",
    public_code: "GJ14",
    event_id: "evt-001",
    form_id: "form-default",
    player_name: "Karan Patel",
    email: "karan.patel@gmail.com",
    phone: "+91 98980 54321",
    date_of_birth: "2004-11-20",
    gender: "Male",
    state: "Gujarat",
    district: "Ahmedabad",
    city: "Ahmedabad",
    game: "BGMI (Battlegrounds Mobile India)",
    in_game_name: "VIPER_GG",
    player_uid: "5341209845",
    team_name: "GUJARAT GLADIATORS",
    team_role: "Assaulter",
    gaming_experience: "T2 scrims winner 4x times.",
    status: "VERIFIED",
    email_status: "SENT",
    created_at: "2026-09-16T14:30:00Z",
    event_title: "NEURAL NEXUS 2K26 — BGMI CHAMPIONSHIP",
    files: [
      { id: "f-3", file_name: "student_id.jpg", file_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", is_private: true, mime_type: "image/jpeg" }
    ]
  },
  {
    id: "reg-003",
    public_code: "MP8",
    event_id: "evt-002",
    form_id: "form-default",
    player_name: "Aman Sharma",
    email: "aman.mp@gmail.com",
    phone: "+91 97550 99887",
    date_of_birth: "2002-08-05",
    gender: "Male",
    state: "Madhya Pradesh",
    district: "Bhopal",
    city: "Bhopal",
    game: "Free Fire Max",
    in_game_name: "GHOST_REAPER",
    player_uid: "1987452301",
    team_name: "BHOPAL ELITE",
    team_role: "Assaulter",
    gaming_experience: "City cup champions Bhopal 2025.",
    status: "PENDING",
    email_status: "SENT",
    created_at: "2026-09-16T18:00:00Z",
    event_title: "FREE FIRE CLASH OF TITANS: SEASON 4",
    files: []
  },
  {
    id: "reg-004",
    public_code: "MH28",
    event_id: "evt-003",
    form_id: "form-default",
    player_name: "Sneha Kulkarni",
    email: "sneha.k@gmail.com",
    phone: "+91 98200 44556",
    date_of_birth: "2001-03-12",
    gender: "Female",
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    game: "Valorant",
    in_game_name: "VALKYRIE_99",
    player_uid: "Valkyrie#PUNE",
    team_name: "APEX GODS",
    team_role: "Support / Initiator",
    gaming_experience: "Immortal 2 player, played University esports invitational.",
    status: "APPROVED",
    email_status: "SENT",
    created_at: "2026-09-16T20:45:00Z",
    event_title: "VALORANT CYBER STRIKE INVITATIONAL",
    files: []
  }
];

// In-Memory State Store with Concurrency-Safe State Code Counters
class DataStore {
  private events: Event[] = [...INITIAL_EVENTS];
  private matches: TournamentMatch[] = [...INITIAL_MATCHES];
  private pointsTable: PointsTableEntry[] = [...INITIAL_POINTS_TABLE];
  private registrations: Registration[] = [...INITIAL_REGISTRATIONS];
  private announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];
  private gallery: GalleryItem[] = [...INITIAL_GALLERY];
  private sponsors: Sponsor[] = [...INITIAL_SPONSORS];
  private siteSettings: SiteSettings = { ...INITIAL_SITE_SETTINGS };
  private admins: AdminUser[] = [...INITIAL_ADMINS];
  private stateCounters: Record<string, number> = {
    MH: 28,
    GJ: 14,
    MP: 8,
    KA: 3,
    DL: 5,
    GG: 1
  };

  // Atomic state registration code generator
  public generateStateCode(stateName: string): string {
    const codePrefix = getStateCode(stateName);
    const nextVal = (this.stateCounters[codePrefix] || 0) + 1;
    this.stateCounters[codePrefix] = nextVal;
    return `${codePrefix}${nextVal}`;
  }

  // Events
  public getEvents(): Event[] { return this.events; }
  public getUpcomingEvents(): Event[] { return this.events.filter(e => e.status === 'UPCOMING' && e.is_published); }
  public getOngoingEvents(): Event[] { return this.events.filter(e => e.status === 'ONGOING' && e.is_published); }
  public getEventBySlug(slug: string): Event | undefined { return this.events.find(e => e.slug === slug); }
  public getEventById(id: string): Event | undefined { return this.events.find(e => e.id === id); }
  
  public saveEvent(event: Partial<Event> & { title: string }): Event {
    if (event.id) {
      const idx = this.events.findIndex(e => e.id === event.id);
      if (idx !== -1) {
        this.events[idx] = { ...this.events[idx], ...event, updated_at: new Date().toISOString() };
        return this.events[idx];
      }
    }
    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      slug: (event.slug || event.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      title: event.title,
      game: event.game || 'Competitive Game',
      poster_url: event.poster_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      date: event.date || '2026-12-31',
      time: event.time || '06:00 PM IST',
      venue: event.venue || 'Online',
      mode: event.mode || 'ONLINE',
      prize_pool: event.prize_pool || '₹10,000',
      entry_fee: event.entry_fee || 'FREE',
      registration_deadline: event.registration_deadline || '2026-12-25',
      total_slots: event.total_slots || 100,
      filled_slots: event.filled_slots || 0,
      description: event.description || '',
      rules: event.rules || [],
      status: event.status || 'UPCOMING',
      is_published: event.is_published ?? true,
      stream_url: event.stream_url,
      is_stream_live: event.is_stream_live ?? false,
      created_at: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  public updateEventStream(eventId: string, streamUrl: string, isLive: boolean): Event | undefined {
    const idx = this.events.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      this.events[idx] = {
        ...this.events[idx],
        stream_url: streamUrl,
        is_stream_live: isLive,
        updated_at: new Date().toISOString()
      };
      return this.events[idx];
    }
    return undefined;
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.events.length;
    this.events = this.events.filter(e => e.id !== id);
    return this.events.length < initialLen;
  }

  // Matches & Points Table
  public getMatches(eventId?: string): TournamentMatch[] {
    return eventId ? this.matches.filter(m => m.event_id === eventId) : this.matches;
  }
  public getPointsTable(eventId?: string): PointsTableEntry[] {
    const table = eventId ? this.pointsTable.filter(p => p.event_id === eventId) : this.pointsTable;
    return table.sort((a, b) => a.rank - b.rank);
  }
  public savePointsTableEntry(entry: Partial<PointsTableEntry> & { event_id: string; team_name: string }): PointsTableEntry {
    if (entry.id) {
      const idx = this.pointsTable.findIndex(p => p.id === entry.id);
      if (idx !== -1) {
        this.pointsTable[idx] = { ...this.pointsTable[idx], ...entry };
        return this.pointsTable[idx];
      }
    }
    const newEntry: PointsTableEntry = {
      id: `pt-${Date.now()}`,
      event_id: entry.event_id,
      rank: entry.rank || this.pointsTable.length + 1,
      team_name: entry.team_name,
      matches_played: entry.matches_played || 0,
      wwcd: entry.wwcd || 0,
      placement_points: entry.placement_points || 0,
      kill_points: entry.kill_points || 0,
      total_points: entry.total_points || 0
    };
    this.pointsTable.push(newEntry);
    return newEntry;
  }

  // Registrations
  public getRegistrations(): Registration[] { return this.registrations; }
  public getRegistrationByCode(code: string): Registration | undefined {
    return this.registrations.find(r => r.public_code.toLowerCase() === code.toLowerCase().replace(/^#/, ''));
  }

  public findRegistrations(query: string): Registration[] {
    const q = query.trim().toLowerCase().replace(/^#/, '');
    if (!q) return [];
    const cleanDigits = q.replace(/\D/g, '');
    
    return this.registrations.filter(r => {
      const codeMatch = r.public_code.toLowerCase() === q;
      const emailMatch = r.email.toLowerCase() === q;
      const nameMatch = r.player_name.toLowerCase().includes(q) || r.in_game_name.toLowerCase().includes(q);
      const teamMatch = r.team_name.toLowerCase().includes(q);
      const uidMatch = Boolean(cleanDigits && r.player_uid.replace(/\D/g, '').includes(cleanDigits));
      const phoneMatch = Boolean(cleanDigits && r.phone.replace(/\D/g, '').includes(cleanDigits));
      
      return codeMatch || emailMatch || nameMatch || teamMatch || uidMatch || phoneMatch;
    });
  }

  public createRegistration(data: Omit<Registration, 'id' | 'public_code' | 'created_at' | 'status' | 'email_status'> & { id?: string; public_code?: string }): Registration {
    const publicCode = data.public_code || this.generateStateCode(data.state);
    const event = this.getEventById(data.event_id);
    
    // Increment slot count
    if (event) {
      event.filled_slots = (event.filled_slots || 0) + 1;
    }

    const newReg: Registration = {
      ...data,
      id: data.id || `reg-${Date.now()}`,
      public_code: publicCode,
      status: 'PENDING',
      email_status: 'SENT',
      created_at: new Date().toISOString(),
      event_title: event?.title || 'Tournament'
    };
    this.registrations.unshift(newReg);
    return newReg;
  }

  public updateRegistrationStatus(id: string, status: Registration['status'], notes?: string): Registration | undefined {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = status;
      if (notes !== undefined) reg.admin_notes = notes;
    }
    return reg;
  }

  public deleteRegistration(id: string): boolean {
    const initialLen = this.registrations.length;
    this.registrations = this.registrations.filter(r => r.id !== id);
    return this.registrations.length < initialLen;
  }

  // Announcements
  public getAnnouncements(): Announcement[] { return this.announcements; }
  public saveAnnouncement(ann: Partial<Announcement> & { title: string; content: string }): Announcement {
    if (ann.id) {
      const idx = this.announcements.findIndex(a => a.id === ann.id);
      if (idx !== -1) {
        this.announcements[idx] = { ...this.announcements[idx], ...ann };
        return this.announcements[idx];
      }
    }
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: ann.title,
      content: ann.content,
      priority: ann.priority || 'MEDIUM',
      image_url: ann.image_url || '',
      link: ann.link || '',
      is_published: ann.is_published ?? true,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.announcements.unshift(newAnn);
    return newAnn;
  }
  public deleteAnnouncement(id: string): boolean {
    this.announcements = this.announcements.filter(a => a.id !== id);
    return true;
  }

  // Gallery
  public getGallery(): GalleryItem[] { return this.gallery; }
  public saveGalleryItem(item: Partial<GalleryItem> & { title: string; image_url: string }): GalleryItem {
    if (item.id) {
      const idx = this.gallery.findIndex(g => g.id === item.id);
      if (idx !== -1) {
        this.gallery[idx] = { ...this.gallery[idx], ...item };
        return this.gallery[idx];
      }
    }
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: item.title,
      description: item.description || '',
      category: item.category || 'LAN_EVENTS',
      image_url: item.image_url,
      is_published: item.is_published ?? true,
      sort_order: item.sort_order || this.gallery.length + 1,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.gallery.push(newItem);
    return newItem;
  }
  public deleteGalleryItem(id: string): boolean {
    this.gallery = this.gallery.filter(g => g.id !== id);
    return true;
  }

  // Sponsors
  public getSponsors(): Sponsor[] { return this.sponsors; }
  public saveSponsor(sponsor: Partial<Sponsor> & { name: string; logo_url: string; tier: Sponsor['tier'] }): Sponsor {
    if (sponsor.id) {
      const idx = this.sponsors.findIndex(s => s.id === sponsor.id);
      if (idx !== -1) {
        this.sponsors[idx] = { ...this.sponsors[idx], ...sponsor };
        return this.sponsors[idx];
      }
    }
    const newSponsor: Sponsor = {
      id: `sp-${Date.now()}`,
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      website: sponsor.website || '',
      description: sponsor.description || '',
      tier: sponsor.tier,
      sort_order: sponsor.sort_order || this.sponsors.length + 1,
      is_active: sponsor.is_active ?? true
    };
    this.sponsors.push(newSponsor);
    return newSponsor;
  }
  public deleteSponsor(id: string): boolean {
    this.sponsors = this.sponsors.filter(s => s.id !== id);
    return true;
  }

  // Site Settings
  public getSiteSettings(): SiteSettings { return this.siteSettings; }
  public updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    this.siteSettings = {
      ...this.siteSettings,
      ...settings
    };
    return this.siteSettings;
  }

  // Admins
  public getAdmins(): AdminUser[] { 
    return this.admins; 
  }

  public saveAdmin(admin: Partial<AdminUser> & { email: string; full_name: string; role: AdminUser['role']; password?: string }): AdminUser {
    const cleanEmail = admin.email.trim().toLowerCase();
    
    // Check by ID or Email
    const existingIdx = this.admins.findIndex(a => 
      (admin.id && a.id === admin.id) || a.email.toLowerCase() === cleanEmail
    );

    if (existingIdx !== -1) {
      this.admins[existingIdx] = { 
        ...this.admins[existingIdx], 
        ...admin,
        email: cleanEmail,
        password: (admin.password && admin.password.trim()) ? admin.password.trim() : this.admins[existingIdx].password
      };
      return this.admins[existingIdx];
    }

    const newAdmin: AdminUser = {
      id: admin.id || `adm-${Date.now()}`,
      email: cleanEmail,
      password: admin.password || 'GGEsports@2026',
      full_name: admin.full_name,
      role: admin.role,
      is_active: admin.is_active ?? true,
      created_at: new Date().toISOString().split('T')[0]
    };
    this.admins.push(newAdmin);
    return newAdmin;
  }

  public deleteAdmin(id: string): boolean {
    const target = this.admins.find(a => a.id === id);
    if (!target) return false;
    // Protect the primary Super Admin
    if (target.email.toLowerCase() === '53yelureprathemesh@gmail.com') {
      return false;
    }
    this.admins = this.admins.filter(a => a.id !== id);
    return true;
  }

  public authenticateAdmin(email: string, password: string): AdminUser | null {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const user = this.admins.find(a => 
      a.email.toLowerCase() === cleanEmail && a.is_active !== false
    );

    if (user && user.password === cleanPass) {
      return user;
    }

    return null;
  }
}

// Global Singleton for in-memory persistence during development server run
const globalForData = global as unknown as { gamersGuildStore: DataStore };
export const dataStore = globalForData.gamersGuildStore || new DataStore();
if (process.env.NODE_ENV !== 'production') globalForData.gamersGuildStore = dataStore;
