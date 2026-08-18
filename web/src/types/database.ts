export type AccessLevel = 'Full' | 'Standard' | 'Field only';

export interface Stage {
  id: string;
  position: number;
  name: string;
  bg_color: string;
  fg_color: string;
  is_done: boolean;
}

export interface Crew {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  crew_id: string | null;
  access_level: AccessLevel;
}

export interface Project {
  id: string;
  address: string;
  city: string;
  client_name: string;
  client_contact: string | null;
  sqft: number;
  species: string;
  crew_id: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  stage_id: string;
  materials_list: unknown[];
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEvent {
  id: string;
  project_id: string;
  event_date: string;
  time_label: string;
  label: string;
}

export interface CompanySettings {
  id: true;
  business_name: string;
  service_area: string;
  default_markup: number;
  crew_count: number;
}

// Minimal Supabase Database type — extend with generated types
// (`supabase gen types typescript`) once the project is live.
export type Database = {
  public: {
    Tables: {
      stages: { Row: Stage; Insert: Partial<Stage>; Update: Partial<Stage> };
      crews: { Row: Crew; Insert: Partial<Crew>; Update: Partial<Crew> };
      team_members: { Row: TeamMember; Insert: Partial<TeamMember>; Update: Partial<TeamMember> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
      schedule_events: { Row: ScheduleEvent; Insert: Partial<ScheduleEvent>; Update: Partial<ScheduleEvent> };
      company_settings: { Row: CompanySettings; Insert: Partial<CompanySettings>; Update: Partial<CompanySettings> };
    };
  };
};
