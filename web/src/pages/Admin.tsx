import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { InviteMemberForm } from '../components/InviteMemberForm';
import { StageListEditor } from '../components/StageListEditor';
import { Avatar } from '../components/Avatar';
import { useCreateStage, useDeleteTeamMember, useSettings, useStages, useTeam, useUpdateTeamMember } from '../hooks/useData';
import { getErrorMessage } from '../lib/errors';

const ACCESS_STYLES: Record<string, { bg: string; fg: string }> = {
  Full: { bg: '#3c5f34', fg: '#ffffff' },
  Standard: { bg: '#8a6d3b', fg: '#ffffff' },
  'Field only': { bg: '#cbb488', fg: '#3a2e18' },
};
const ACCESS_LEVELS = ['Field only', 'Standard', 'Full'];

export function Admin() {
  const { data: team = [] } = useTeam();
  const { data: stages = [] } = useStages();
  const { data: settings } = useSettings();
  const [showInvite, setShowInvite] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<{ name: string; email: string | null; role: string | null } | null>(null);
  const [editingStages, setEditingStages] = useState(false);
  const [editingTeam, setEditingTeam] = useState(false);
  const createStage = useCreateStage();
  const updateTeamMember = useUpdateTeamMember();
  const deleteTeamMember = useDeleteTeamMember();

  function handleDeleteMember(id: string, name: string) {
    if (!window.confirm(`Remove ${name} from the team? This also un-assigns them from any jobs.`)) return;
    deleteTeamMember.mutate(id, {
      onError: (err) => window.alert(getErrorMessage(err, 'Failed to remove team member')),
    });
  }

  const settingsRows = settings
    ? [
        { label: 'Business name', sub: 'Shown on quotes & invoices', value: settings.business_name },
        { label: 'Service area', sub: 'Default map region', value: settings.service_area },
      ]
    : [];

  return (
    <div className="px-4 pt-[26px] pb-[30px] lg:px-[30px]">
      <h2 className="m-0 mb-1 text-[29px]">Admin</h2>
      <p className="mt-0 mb-6 text-[13px] text-text-secondary">Team, workflow, and company settings</p>

      <div className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="m-0 text-base">Team</h4>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="text-xs" onClick={() => setEditingTeam((v) => !v)}>
                {editingTeam ? 'Done' : 'Edit'}
              </Button>
              <Button variant="secondary" className="text-xs" onClick={() => setShowInvite(true)}>
                + Invite member
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: editingTeam ? '42%' : '46%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '24%' }} />
              {editingTeam && <col style={{ width: '6%' }} />}
            </colgroup>
            <thead>
              <tr className="text-[11px] tracking-[0.06em] text-text-muted uppercase">
                <th className="pb-2 font-semibold">Member</th>
                <th className="pb-2 font-semibold">Role</th>
                <th className="pb-2 text-right font-semibold">Access</th>
                {editingTeam && <th className="pb-2"></th>}
              </tr>
            </thead>
            <tbody>
              {team.map((t) => {
                const access = ACCESS_STYLES[t.access_level] ?? ACCESS_STYLES['Field only'];
                return (
                  <tr key={t.id}>
                    <td className="py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={t.name} size={28} />
                        <div className="min-w-0 leading-tight">
                          <div className="text-[13px] font-semibold">{t.name}</div>
                          <div className="overflow-hidden text-[11px] text-text-secondary-alt text-ellipsis whitespace-nowrap">
                            {t.email ?? <span className="italic">no email</span>}
                            {!t.auth_user_id && (
                              <>
                                <span className="ml-1.5 text-text-muted-alt">· no login ·</span>{' '}
                                <button
                                  onClick={() => setPromoteTarget({ name: t.name, email: t.email, role: t.role })}
                                  className="cursor-pointer border-none bg-transparent p-0 text-[11px] font-semibold text-accent hover:text-accent-600"
                                >
                                  Invite
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-[13px] text-[#4a3d30]">{t.role ?? '—'}</td>
                    <td className="py-2 text-right">
                      {editingTeam ? (
                        <select
                          value={t.access_level}
                          onChange={(e) => updateTeamMember.mutate({ id: t.id, access_level: e.target.value })}
                          className="rounded-full border-none px-2.5 py-1 text-[11px] font-semibold outline-none"
                          style={{ background: access.bg, color: access.fg }}
                        >
                          {ACCESS_LEVELS.map((a) => (
                            <option key={a} value={a} style={{ background: '#fff', color: '#2a2018' }}>
                              {a}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{ background: access.bg, color: access.fg }}
                        >
                          {t.access_level}
                        </span>
                      )}
                    </td>
                    {editingTeam && (
                      <td className="py-2 text-right">
                        <button
                          onClick={() => handleDeleteMember(t.id, t.name)}
                          aria-label={`Remove ${t.name}`}
                          className="cursor-pointer rounded border-none bg-transparent p-1 text-text-muted hover:text-red-700"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="m-0 text-base">Project stages</h4>
              <Button variant="ghost" className="text-xs" onClick={() => setEditingStages((v) => !v)}>
                {editingStages ? 'Done' : 'Edit'}
              </Button>
            </div>
            <StageListEditor stages={stages} editing={editingStages} />
            {editingStages && (
              <button
                onClick={() => createStage.mutate(stages)}
                disabled={createStage.isPending}
                className="mt-2 w-full cursor-pointer rounded-[7px] border border-dashed border-black/15 bg-transparent py-2 text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent"
              >
                + Add stage
              </button>
            )}
          </div>

          <div>
            <h4 className="m-0 mb-3 text-base">Company</h4>
            <div className="flex flex-col gap-0.5">
              {settingsRows.map((g) => (
                <div key={g.label} className="flex items-center justify-between border-b border-black/7 py-2.5">
                  <div className="leading-tight">
                    <div className="text-[13px] font-semibold text-[#4a3d30]">{g.label}</div>
                    <div className="text-[11px] text-text-secondary-alt">{g.sub}</div>
                  </div>
                  <span className="text-xs font-semibold text-accent">{g.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showInvite && (
        <Modal title="Invite member" onClose={() => setShowInvite(false)}>
          <InviteMemberForm onDone={() => setShowInvite(false)} />
        </Modal>
      )}

      {promoteTarget && (
        <Modal title={`Invite ${promoteTarget.name}`} onClose={() => setPromoteTarget(null)}>
          <InviteMemberForm onDone={() => setPromoteTarget(null)} initial={promoteTarget} promoteOnly />
        </Modal>
      )}
    </div>
  );
}
