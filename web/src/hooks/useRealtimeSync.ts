import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const WATCHED_TABLES = ['projects', 'schedule_events', 'stages', 'team_members'] as const;
const QUERY_KEYS_BY_TABLE: Record<(typeof WATCHED_TABLES)[number], string[]> = {
  projects: ['projects'],
  schedule_events: ['schedule_events'],
  stages: ['stages'],
  team_members: ['team_members'],
};

// Keeps every open tab (desktop and crew mobile view alike) in sync without a
// manual refresh: any insert/update/delete on a watched table invalidates the
// matching React Query cache, which triggers a refetch wherever that data is
// currently rendered.
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel('db-changes');

    for (const table of WATCHED_TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        for (const key of QUERY_KEYS_BY_TABLE[table]) {
          queryClient.invalidateQueries({ queryKey: [key] });
        }
      });
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
