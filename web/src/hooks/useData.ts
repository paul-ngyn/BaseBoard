import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Project, Stage } from '../types/database';

export function useStages() {
  return useQuery({
    queryKey: ['stages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stages').select('*').order('position');
      if (error) throw error;
      return data as Stage[];
    },
  });
}

export function useCrews() {
  return useQuery({
    queryKey: ['crews'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crews').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useTeam() {
  return useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_members').select('*, crews(name)').order('name');
      if (error) throw error;
      return data as (import('../types/database').TeamMember & { crews: { name: string } | null })[];
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['company_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('company_settings').select('*').single();
      if (error) throw error;
      return data;
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, crews(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as (Project & { crews: { name: string } | null })[];
    },
  });
}

function mondayOf(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function useWeekSchedule(anchor: Date = new Date()) {
  const monday = mondayOf(anchor);
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  const mondayISO = toISODate(monday);
  const fridayISO = toISODate(friday);

  return useQuery({
    queryKey: ['schedule_events', mondayISO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*, projects(address, stage_id)')
        .gte('event_date', mondayISO)
        .lte('event_date', fridayISO)
        .order('time_label');
      if (error) throw error;
      return {
        monday,
        events: data as (import('../types/database').ScheduleEvent & {
          projects: { address: string; stage_id: string } | null;
        })[],
      };
    },
  });
}

export function useUpdateProjectStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, stageId }: { projectId: string; stageId: string }) => {
      const { error } = await supabase.from('projects').update({ stage_id: stageId }).eq('id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const { error } = await supabase.from('projects').insert(project);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; name: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('invite-member', { body: input });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; crew_id?: string | null; access_level?: string; role?: string }) => {
      const { error } = await supabase.from('team_members').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stages: { id: string; position: number }[]) => {
      const updates = stages.map((s) => supabase.from('stages').update({ position: s.position }).eq('id', s.id));
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
    },
  });
}
