import { useMemo } from 'react';
import { useProjects, useStages } from '../hooks/useData';

function usePinPositions(projects: { id: string; lat: number | null; lng: number | null }[]) {
  return useMemo(() => {
    const withCoords = projects.filter((p) => p.lat != null && p.lng != null) as {
      id: string;
      lat: number;
      lng: number;
    }[];
    if (withCoords.length === 0) return new Map<string, { x: string; y: string }>();

    const lats = withCoords.map((p) => p.lat);
    const lngs = withCoords.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = maxLat - minLat || 1;
    const lngSpan = maxLng - minLng || 1;

    const positions = new Map<string, { x: string; y: string }>();
    for (const p of withCoords) {
      const xPct = 10 + ((p.lng - minLng) / lngSpan) * 80;
      const yPct = 10 + ((maxLat - p.lat) / latSpan) * 80; // north = up
      positions.set(p.id, { x: `${xPct.toFixed(1)}%`, y: `${yPct.toFixed(1)}%` });
    }
    return positions;
  }, [projects]);
}

export function MapView() {
  const { data: projects = [] } = useProjects();
  const { data: stages = [] } = useStages();
  const stageById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const positions = usePinPositions(projects);

  return (
    <div className="px-4 pt-[26px] pb-[30px] lg:px-[30px]">
      <h2 className="m-0 mb-1 text-[29px]">Map</h2>
      <p className="mt-0 mb-5 text-[13px] text-text-secondary">
        Job sites across the service area · placeholder — wire to a real map service (Mapbox / Google / Leaflet)
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="relative h-[440px] overflow-hidden rounded-xl border border-black/12 bg-[#e9e0cf]">
          <svg width="100%" height="100%" viewBox="0 0 600 440" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
            <rect width="600" height="440" fill="#e9e0cf" />
            <g stroke="#d3c5ac" strokeWidth="14" fill="none" strokeLinecap="round">
              <path d="M-20 120 L620 90" />
              <path d="M-20 260 L620 300" />
              <path d="M120 -20 L90 460" />
              <path d="M380 -20 L440 460" />
            </g>
            <g stroke="#ddd0b8" strokeWidth="6" fill="none">
              <path d="M-20 60 L620 40" />
              <path d="M-20 350 L620 380" />
              <path d="M240 -20 L260 460" />
              <path d="M520 -20 L540 460" />
            </g>
            <path d="M-20 200 Q200 240 300 180 T620 220" stroke="#bcd0c0" strokeWidth="10" fill="none" opacity=".8" />
          </svg>
          {projects.map((p) => {
            const pos = positions.get(p.id);
            if (!pos) return null;
            const stage = stageById.get(p.stage_id);
            return (
              <div
                key={p.id}
                className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
                style={{ left: pos.x, top: pos.y }}
                title={p.address}
              >
                <div
                  className="h-[26px] w-[26px] rotate-[-45deg] rounded-tl-full rounded-tr-full rounded-br-full border-2 border-bg shadow-[0_2px_6px_rgba(42,32,24,0.3)]"
                  style={{ background: stage?.bg_color ?? '#c39a5a' }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-0.5">
          {projects.map((p) => {
            const stage = stageById.get(p.stage_id);
            return (
              <div key={p.id} className="flex items-center gap-2.5 border-b border-black/8 px-1.5 py-2.5">
                <div className="h-[11px] w-[11px] flex-none rounded-full" style={{ background: stage?.bg_color ?? '#c39a5a' }} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="overflow-hidden text-[13px] font-semibold text-ellipsis whitespace-nowrap">{p.address}</div>
                  <div className="text-[11px] text-text-secondary-alt">{p.city}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
