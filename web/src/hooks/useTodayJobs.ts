import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface TodayJob {
  id: string;
  time: string;
  addr: string;
  city: string;
  client: string;
  crew: string;
  note: string;
  stage: string;
  pillBg: string;
  pillFg: string;
  lat: number | null;
  lng: number | null;
}

function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function useTodayJobs() {
  return useQuery({
    queryKey: ['schedule_events', 'today'],
    queryFn: async () => {
      const todayISO = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('schedule_events')
        .select('*, projects(address, city, client_name, lat, lng, crews(name), stages(name, bg_color, fg_color))')
        .eq('event_date', todayISO)
        .order('time_label');
      if (error) throw error;

      const jobs: TodayJob[] = (data as any[]).map((e) => {
        const stage = e.projects?.stages;
        return {
          id: e.id,
          time: e.time_label,
          addr: e.projects?.address ?? '',
          city: e.projects?.city ?? '',
          client: e.projects?.client_name ?? '',
          crew: e.projects?.crews?.name ?? 'Unassigned',
          note: e.label,
          stage: stage?.name ?? '',
          pillBg: stage?.bg_color ?? '#c39a5a',
          pillFg: stage?.fg_color ?? '#ffffff',
          lat: e.projects?.lat ?? null,
          lng: e.projects?.lng ?? null,
        };
      });

      const withCoords = jobs.filter((j) => j.lat != null && j.lng != null) as (TodayJob & { lat: number; lng: number })[];
      let milesToDrive = 0;
      for (let i = 1; i < withCoords.length; i++) {
        milesToDrive += haversineMiles(withCoords[i - 1], withCoords[i]);
      }

      return {
        jobs,
        stats: {
          stops: jobs.length,
          milesToDrive: Math.round(milesToDrive),
          crewCount: new Set(jobs.map((j) => j.crew)).size,
        },
      };
    },
  });
}
