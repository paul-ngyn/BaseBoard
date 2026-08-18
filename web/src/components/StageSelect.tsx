import type { Stage } from '../types/database';
import { useUpdateProjectStage } from '../hooks/useData';

export function StageSelect({
  projectId,
  currentStageId,
  stages,
}: {
  projectId: string;
  currentStageId: string;
  stages: Stage[];
}) {
  const updateStage = useUpdateProjectStage();
  const current = stages.find((s) => s.id === currentStageId);
  if (!current) return null;

  return (
    <select
      value={currentStageId}
      onChange={(e) => updateStage.mutate({ projectId, stageId: e.target.value })}
      disabled={updateStage.isPending}
      aria-label="Project stage"
      className="cursor-pointer appearance-none rounded-full border-none px-3 py-[5px] text-[11.5px] font-semibold tracking-[0.01em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ background: current.bg_color, color: current.fg_color }}
    >
      {stages.map((s) => (
        <option key={s.id} value={s.id} style={{ background: '#fff', color: '#2a2018' }}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
