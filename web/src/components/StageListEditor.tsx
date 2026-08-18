import { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Stage } from '../types/database';
import { useReorderStages } from '../hooks/useData';

function SortableStageRow({ stage, index }: { stage: Stage; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex items-center gap-2.5 border-b border-black/7 py-1.5"
    >
      <span className="tabular-nums w-[22px] text-right text-[11px] text-text-muted-alt">{String(index + 1).padStart(2, '0')}</span>
      <span className="h-[13px] w-[13px] flex-none rounded-[3px]" style={{ background: stage.bg_color }} />
      <span className="flex-1 text-[13px] text-[#4a3d30]">{stage.name}</span>
      <span {...attributes} {...listeners} className="cursor-grab text-sm text-[#c4b498] select-none" aria-label="Drag to reorder">
        ⋮⋮
      </span>
    </div>
  );
}

export function StageListEditor({ stages }: { stages: Stage[] }) {
  const [items, setItems] = useState(stages);
  const reorder = useReorderStages();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => setItems(stages), [stages]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((s) => s.id === active.id);
    const newIndex = items.findIndex((s) => s.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorder.mutate(next.map((s, i) => ({ id: s.id, position: i + 1 })));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-0.5">
          {items.map((s, i) => (
            <SortableStageRow key={s.id} stage={s} index={i} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
