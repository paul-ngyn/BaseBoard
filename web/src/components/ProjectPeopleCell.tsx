import { useState } from 'react';
import { Modal } from './Modal';
import { PeoplePicker } from './PeoplePicker';
import { Button } from './Button';
import { useTeam, useUpdateProjectMembers } from '../hooks/useData';
import type { TeamMember } from '../types/database';

export function ProjectPeopleCell({ projectId, people }: { projectId: string; people: TeamMember[] }) {
  const [editing, setEditing] = useState(false);
  const { data: team = [] } = useTeam();
  const updateMembers = useUpdateProjectMembers();
  const [selected, setSelected] = useState<string[]>([]);

  function open() {
    setSelected(people.map((p) => p.id));
    setEditing(true);
  }

  async function handleSave() {
    await updateMembers.mutateAsync({ projectId, memberIds: selected });
    setEditing(false);
  }

  return (
    <>
      <button
        onClick={open}
        className="w-full cursor-pointer truncate border-none bg-transparent p-0 text-left text-[13px] text-[#4a3d30] hover:text-accent"
        title={people.map((p) => p.name).join(', ') || 'Unassigned'}
      >
        {people.length ? people.map((p) => p.name).join(', ') : <span className="text-text-muted">— assign —</span>}
      </button>

      {editing && (
        <Modal title="People on this job" onClose={() => setEditing(false)}>
          <div className="flex flex-col gap-3 text-sm">
            <PeoplePicker people={team} selected={selected} onChange={setSelected} />
            <Button variant="primary" onClick={handleSave} disabled={updateMembers.isPending} className="justify-center">
              {updateMembers.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
