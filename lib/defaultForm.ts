import { RegistrationField } from './types';

export const DEFAULT_FORM_FIELDS: RegistrationField[] = [
  {
    id: "f-name",
    form_id: "form-default",
    label: "Full Name",
    field_type: "SHORT_TEXT",
    description: "Official full name matching your government-issued identity proof.",
    placeholder: "e.g. John Doe",
    is_required: true,
    options: [],
    sort_order: 1
  },
  {
    id: "f-dob",
    form_id: "form-default",
    label: "Date of Birth",
    field_type: "DATE",
    description: "Used to verify tournament age bracket criteria.",
    placeholder: "",
    is_required: true,
    options: [],
    sort_order: 2
  },
  {
    id: "f-gender",
    form_id: "form-default",
    label: "Gender",
    field_type: "DROPDOWN",
    description: "Select your gender.",
    placeholder: "Select Gender",
    is_required: true,
    options: ["Male", "Female", "Non-Binary", "Prefer not to say"],
    sort_order: 3
  },
  {
    id: "f-phone",
    form_id: "form-default",
    label: "Mobile Number (WhatsApp Active)",
    field_type: "PHONE",
    description: "Important: Custom room credentials and group invites are sent here.",
    placeholder: "+91 98765 43210",
    is_required: true,
    options: [],
    sort_order: 4
  },
  {
    id: "f-email",
    form_id: "form-default",
    label: "Email Address",
    field_type: "EMAIL",
    description: "Official registration confirmation code will be dispatched to this inbox.",
    placeholder: "player@example.com",
    is_required: true,
    options: [],
    sort_order: 5
  },
  {
    id: "f-state",
    form_id: "form-default",
    label: "State",
    field_type: "DROPDOWN",
    description: "Your state dictates your official state code (e.g. MH27, GJ14, MP8).",
    placeholder: "Select State",
    is_required: true,
    options: [
      "Maharashtra", "Gujarat", "Madhya Pradesh", "Karnataka", "Telangana",
      "Andhra Pradesh", "Delhi", "Rajasthan", "Uttar Pradesh", "West Bengal",
      "Tamil Nadu", "Kerala", "Goa", "Punjab", "Haryana", "Bihar", "Odisha",
      "Jharkhand", "Chhattisgarh", "Assam", "Uttarakhand", "Himachal Pradesh",
      "Jammu and Kashmir", "Chandigarh", "Other"
    ],
    sort_order: 6
  },
  {
    id: "f-district",
    form_id: "form-default",
    label: "District",
    field_type: "SHORT_TEXT",
    description: "District for regional circuit ranking and leaderboard grouping.",
    placeholder: "e.g. Nagpur",
    is_required: true,
    options: [],
    sort_order: 7
  },
  {
    id: "f-city",
    form_id: "form-default",
    label: "City / Town",
    field_type: "SHORT_TEXT",
    description: "Your home city or town.",
    placeholder: "e.g. Nagpur",
    is_required: true,
    options: [],
    sort_order: 8
  },
  {
    id: "f-game",
    form_id: "form-default",
    label: "Competitive Game Title",
    field_type: "DROPDOWN",
    description: "Select the esport title you are competing in.",
    placeholder: "Select Game",
    is_required: true,
    options: [
      "BGMI (Battlegrounds Mobile India)",
      "Free Fire Max",
      "Valorant",
      "Call of Duty: Mobile"
    ],
    sort_order: 9
  },
  {
    id: "f-ign",
    form_id: "form-default",
    label: "In-Game Name (IGN)",
    field_type: "SHORT_TEXT",
    description: "Exact case-sensitive gamer tag as seen inside the game client.",
    placeholder: "e.g. TITAN_SNIPER",
    is_required: true,
    options: [],
    sort_order: 10
  },
  {
    id: "f-uid",
    form_id: "form-default",
    label: "Character UID / Player ID",
    field_type: "SHORT_TEXT",
    description: "Numeric character UID used to invite and verify your in-game identity.",
    placeholder: "e.g. 5129481023",
    is_required: true,
    options: [],
    sort_order: 11
  },
  {
    id: "f-team",
    form_id: "form-default",
    label: "Team / Squad Name",
    field_type: "SHORT_TEXT",
    description: "Official team name. For solo events, enter your player handle.",
    placeholder: "e.g. CYBER TITANS",
    is_required: true,
    options: [],
    sort_order: 12
  },
  {
    id: "f-role",
    form_id: "form-default",
    label: "Team Role",
    field_type: "DROPDOWN",
    description: "Your designated tactical role in the squad.",
    placeholder: "Select Tactical Role",
    is_required: false,
    options: [
      "IGL (In-Game Leader)",
      "Assaulter / Entry Fragger",
      "Sniper / Marksman",
      "Support / Utility",
      "Substitute / Sixth Player"
    ],
    sort_order: 13
  },
  {
    id: "f-exp",
    form_id: "form-default",
    label: "Competitive Experience & Past Achievements",
    field_type: "LONG_TEXT",
    description: "Tell us about previous scrims, LAN events, or college tournament wins.",
    placeholder: "e.g. Quarterfinalist in Winter City LAN 2025; Top 10 Scrims Tier 2.",
    is_required: false,
    options: [],
    sort_order: 14
  },
  {
    id: "f-doc-id",
    form_id: "form-default",
    label: "Government ID Proof (Aadhaar / Driving License / Student ID)",
    field_type: "PDF_UPLOAD",
    description: "Private document for age and identity verification. Allowed: PDF, JPG, PNG (Max 5MB).",
    placeholder: "",
    is_required: true,
    options: [],
    sort_order: 15
  },
  {
    id: "f-doc-photo",
    form_id: "form-default",
    label: "Player Profile Photo / Headshot",
    field_type: "IMAGE_UPLOAD",
    description: "High-resolution portrait photo for tournament broadcast stream graphics.",
    placeholder: "",
    is_required: true,
    options: [],
    sort_order: 16
  },
  {
    id: "f-doc-payment",
    form_id: "form-default",
    label: "Payment Screenshot (If Entry Fee Applicable)",
    field_type: "IMAGE_UPLOAD",
    description: "Upload transaction confirmation screenshot for paid tournaments.",
    placeholder: "",
    is_required: false,
    options: [],
    sort_order: 17
  },
  {
    id: "f-doc-logo",
    form_id: "form-default",
    label: "Team Logo",
    field_type: "IMAGE_UPLOAD",
    description: "Square PNG/JPG with transparent background for bracket display.",
    placeholder: "",
    is_required: false,
    options: [],
    sort_order: 18
  }
];

class FormStore {
  private fields: RegistrationField[] = [...DEFAULT_FORM_FIELDS];

  public getFields(): RegistrationField[] {
    return [...this.fields].sort((a, b) => a.sort_order - b.sort_order);
  }

  public setFields(newFields: RegistrationField[]) {
    this.fields = newFields;
  }

  public addField(field: Omit<RegistrationField, 'id' | 'form_id'>): RegistrationField {
    const newField: RegistrationField = {
      ...field,
      id: `f-${Date.now()}`,
      form_id: "form-default",
      sort_order: this.fields.length + 1
    };
    this.fields.push(newField);
    return newField;
  }

  public updateField(id: string, updates: Partial<RegistrationField>): RegistrationField | undefined {
    const idx = this.fields.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.fields[idx] = { ...this.fields[idx], ...updates };
      return this.fields[idx];
    }
    return undefined;
  }

  public deleteField(id: string): boolean {
    const len = this.fields.length;
    this.fields = this.fields.filter(f => f.id !== id);
    return this.fields.length < len;
  }

  public duplicateField(id: string): RegistrationField | undefined {
    const original = this.fields.find(f => f.id === id);
    if (!original) return undefined;
    const duplicated: RegistrationField = {
      ...original,
      id: `f-${Date.now()}`,
      label: `${original.label} (Copy)`,
      sort_order: original.sort_order + 1
    };
    this.fields.push(duplicated);
    return duplicated;
  }
}

const globalForForm = global as unknown as { gamersGuildFormStore: FormStore };
export const formStore = globalForForm.gamersGuildFormStore || new FormStore();
if (process.env.NODE_ENV !== 'production') globalForForm.gamersGuildFormStore = formStore;
