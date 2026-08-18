import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Project, Stage, TeamMember } from '../types/database';

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

export function useTeam() {
  return useQuery({
    queryKey: ['team_members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_members').select('*').order('name');
      if (error) throw error;
      return data as TeamMember[];
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

export type ProjectWithMembers = Project & { project_members: { team_members: TeamMember }[] };

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_members(team_members(*))')
        .order('position');
      if (error) throw error;
      return data as ProjectWithMembers[];
    },
  });
}

export function useReorderProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; position: number }[]) => {
      const updates = items.map((p) => supabase.from('projects').update({ position: p.position }).eq('id', p.id));
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Full calendar-grid range for a month: from the Sunday on/before the 1st
// through the Saturday on/after the last day, so the grid always has
// complete weeks.
function monthGridRange(monthAnchor: Date) {
  const firstOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const lastOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(lastOfMonth);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
  return { firstOfMonth, lastOfMonth, gridStart, gridEnd };
}

export function useMonthSchedule(monthAnchor: Date) {
  const { gridStart, gridEnd } = monthGridRange(monthAnchor);
  const startISO = toISODate(gridStart);
  const endISO = toISODate(gridEnd);

  const query = useQuery({
    queryKey: ['schedule_events', startISO, endISO],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*, projects(address, stage_id)')
        .gte('event_date', startISO)
        .lte('event_date', endISO)
        .order('time_label');
      if (error) throw error;
      return data as (import('../types/database').ScheduleEvent & {
        projects: { address: string; stage_id: string } | null;
      })[];
    },
  });

  return { ...query, gridStart, gridEnd };
}

export function useUpdateProjectDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, date }: { projectId: string; date: string | null }) => {
      const { error } = await supabase.from('projects').update({ start_date: date }).eq('id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProjectTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, time }: { projectId: string; time: string | null }) => {
      const { error } = await supabase.from('projects').update({ next_time: time }).eq('id', projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProjectField() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Project>) => {
      const { error } = await supabase.from('projects').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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
    mutationFn: async ({ memberIds, ...project }: Partial<Project> & { memberIds: string[] }) => {
      const { data, error } = await supabase.from('projects').insert(project).select('id').single();
      if (error) throw error;
      if (memberIds.length) {
        const { error: memberError } = await supabase
          .from('project_members')
          .insert(memberIds.map((team_member_id) => ({ project_id: data.id, team_member_id })));
        if (memberError) throw memberError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Replaces the full set of people assigned to a project.
export function useUpdateProjectMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, memberIds }: { projectId: string; memberIds: string[] }) => {
      const { error: deleteError } = await supabase.from('project_members').delete().eq('project_id', projectId);
      if (deleteError) throw deleteError;
      if (memberIds.length) {
        const { error: insertError } = await supabase
          .from('project_members')
          .insert(memberIds.map((team_member_id) => ({ project_id: projectId, team_member_id })));
        if (insertError) throw insertError;
      }
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
      const { data, error } = await supabase.functions.invoke('invite-member', { body: { ...input, mode: 'email' } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
    },
  });
}

// Adds a roster-only team member — no login, same thing as adding a row
// directly in Supabase's Table Editor. No edge function needed since there's
// no auth account to create.
export function useAddRosterMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email?: string | null; role?: string | null; access_level: string }) => {
      const { data, error } = await supabase.from('team_members').insert(input).select('id').single();
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
    mutationFn: async ({ id, ...updates }: { id: string; access_level?: string; role?: string }) => {
      const { error } = await supabase.from('team_members').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
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

export function useUpdateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; bg_color?: string; fg_color?: string }) => {
      const { error } = await supabase.from('stages').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
    },
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (currentStages: Stage[]) => {
      const nextPosition = currentStages.length ? Math.max(...currentStages.map((s) => s.position)) + 1 : 1;
      const { error } = await supabase.from('stages').insert({
        position: nextPosition,
        name: 'New stage',
        bg_color: '#8a6d3b',
        fg_color: '#ffffff',
        is_done: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stages').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') {
          throw new Error('Projects are still on this stage — move them to a different stage first.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
    },
  });
}
