export type AdminRole = 'SUPER_ADMIN' | 'EVENT_ADMIN' | 'REGISTRATION_MANAGER' | 'CONTENT_EDITOR';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
}

export interface StateCode {
  id: string;
  state_code: string;
  state_name: string;
  is_active: boolean;
}

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';
export type EventMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export interface Event {
  id: string;
  slug: string;
  title: string;
  game: string;
  poster_url: string;
  date: string;
  time: string;
  venue: string;
  mode: EventMode;
  prize_pool: string;
  entry_fee: string;
  registration_deadline: string;
  total_slots: number;
  filled_slots: number;
  description: string;
  rules: string[];
  status: EventStatus;
  is_published: boolean;
  registration_form_id?: string;
  stream_url?: string;
  is_stream_live?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TournamentMatch {
  id: string;
  event_id: string;
  round_name: string;
  match_title: string;
  scheduled_time: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  stream_url?: string;
  map_name?: string;
  sort_order?: number;
}

export interface PointsTableEntry {
  id: string;
  event_id: string;
  rank: number;
  team_name: string;
  matches_played: number;
  wwcd: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
}

export type FieldType = 
  | 'SHORT_TEXT' 
  | 'LONG_TEXT' 
  | 'NUMBER' 
  | 'EMAIL' 
  | 'PHONE' 
  | 'DATE' 
  | 'DROPDOWN' 
  | 'MULTIPLE_CHOICE' 
  | 'CHECKBOX' 
  | 'IMAGE_UPLOAD' 
  | 'FILE_UPLOAD' 
  | 'PDF_UPLOAD';

export interface RegistrationField {
  id: string;
  form_id: string;
  label: string;
  field_type: FieldType;
  description?: string;
  placeholder?: string;
  is_required: boolean;
  options: string[];
  validation_rules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  sort_order: number;
}

export interface RegistrationForm {
  id: string;
  event_id?: string;
  title: string;
  description?: string;
  is_active: boolean;
  fields?: RegistrationField[];
  created_at?: string;
}

export type RegistrationStatus = 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED';
export type EmailStatus = 'NOT_SENT' | 'SENDING' | 'SENT' | 'FAILED';

export interface Registration {
  id: string;
  public_code: string; // e.g. MH27
  event_id: string;
  form_id: string;
  player_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: string;
  state: string;
  district: string;
  city: string;
  game: string;
  in_game_name: string;
  player_uid: string;
  team_name: string;
  team_role?: string;
  gaming_experience?: string;
  status: RegistrationStatus;
  email_status: EmailStatus;
  admin_notes?: string;
  created_at: string;
  answers?: Record<string, any>;
  files?: RegistrationUploadedFile[];
  event_title?: string;
}

export interface RegistrationUploadedFile {
  id: string;
  field_id?: string;
  field_label?: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  is_private: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  image_url?: string;
  link?: string;
  is_published: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  image_url: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export type SponsorTier = 'MAIN_SPONSOR' | 'ESPORTS_PARTNER' | 'TECH_PARTNER' | 'COMMUNITY_PARTNER';

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website?: string;
  description?: string;
  tier: SponsorTier;
  sort_order: number;
  is_active: boolean;
}

export interface SiteSettings {
  hero: {
    tagline: string;
    subheading: string;
    cta_primary_text: string;
    cta_primary_link: string;
    cta_secondary_text: string;
    cta_secondary_link: string;
    logo_url: string;
  };
  about: {
    heading: string;
    description: string;
    mission: string;
    vision: string;
  };
  statistics: Array<{
    number: string;
    label: string;
    icon: string;
  }>;
  contact: {
    email: string;
    phone: string;
    address: string;
    discord: string;
    instagram: string;
    youtube: string;
    twitter: string;
  };
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  sender_name: string;
  reply_to: string;
}

export interface EmailLog {
  id: string;
  registration_id: string;
  recipient_email: string;
  template_slug: string;
  status: 'NOT_SENT' | 'SENDING' | 'SENT' | 'FAILED';
  error_message?: string;
  sent_at: string;
}
