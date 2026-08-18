export type AccessLevel = 'Full' | 'Standard' | 'Field only';

export interface Stage {
  id: string;
  position: number;
  name: string;
  bg_color: string;
  fg_color: string;
  is_done: boolean;
}

export interface TeamMember {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  role: string | null;
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
  start_date: string | null;
  end_date: string | null;
  next_time: string | null;
  stage_id: string;
  materials_list: unknown[];
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  project_id: string;
  team_member_id: string;
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
  crew_count: number;
}

// Minimal Supabase Database type — extend with generated types
// (`supabase gen types typescript`) once the project is live.
export type Database = {
  public: {
    Tables: {
      stages: { Row: Stage; Insert: Partial<Stage>; Update: Partial<Stage> };
      team_members: { Row: TeamMember; Insert: Partial<TeamMember>; Update: Partial<TeamMember> };
      projects: { Row: Project; Insert: Partial<Project>; Update: Partial<Project> };
      project_members: { Row: ProjectMember; Insert: Partial<ProjectMember>; Update: Partial<ProjectMember> };
      schedule_events: { Row: ScheduleEvent; Insert: Partial<ScheduleEvent>; Update: Partial<ScheduleEvent> };
      company_settings: { Row: CompanySettings; Insert: Partial<CompanySettings>; Update: Partial<CompanySettings> };
    };
  };
};
