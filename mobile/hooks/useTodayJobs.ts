import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { stageColors } from '../lib/theme';

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
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function useTodayJobs() {
  const [jobs, setJobs] = useState<TodayJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [milesToDrive, setMilesToDrive] = useState(0);

  useEffect(() => {
    const todayISO = new Date().toISOString().slice(0, 10);

    supabase
      .from('schedule_events')
      .select('*, projects(address, city, client_name, lat, lng, crews(name), stages(name))')
      .eq('event_date', todayISO)
      .order('time_label')
      .then(({ data, error }) => {
        if (error || !data) {
          setLoading(false);
          return;
        }
        const mapped: TodayJob[] = data.map((e: any) => {
          const stageName = e.projects?.stages?.name ?? '';
          const colors = stageColors[stageName] ?? { bg: '#c39a5a', fg: '#ffffff' };
          return {
            id: e.id,
            time: e.time_label,
            addr: e.projects?.address ?? '',
            city: e.projects?.city ?? '',
            client: e.projects?.client_name ?? '',
            crew: e.projects?.crews?.name ?? 'Unassigned',
            note: e.label,
            stage: stageName,
            pillBg: colors.bg,
            pillFg: colors.fg,
            lat: e.projects?.lat ?? null,
            lng: e.projects?.lng ?? null,
          };
        });
        setJobs(mapped);

        const withCoords = mapped.filter((j) => j.lat != null && j.lng != null) as (TodayJob & {
          lat: number;
          lng: number;
        })[];
        let total = 0;
        for (let i = 1; i < withCoords.length; i++) {
          total += haversineMiles(withCoords[i - 1], withCoords[i]);
        }
        setMilesToDrive(Math.round(total));
        setLoading(false);
      });
  }, []);

  const crewCount = new Set(jobs.map((j) => j.crew)).size;

  return { jobs, loading, stats: { stops: jobs.length, milesToDrive, crewCount } };
}
