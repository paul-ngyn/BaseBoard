import { useState } from 'react';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { InviteMemberForm } from '../components/InviteMemberForm';
import { StageListEditor } from '../components/StageListEditor';
import { Avatar } from '../components/Avatar';
import { useSettings, useStages, useTeam } from '../hooks/useData';

const ACCESS_STYLES: Record<string, { bg: string; fg: string }> = {
  Full: { bg: '#3c5f34', fg: '#ffffff' },
  Standard: { bg: '#8a6d3b', fg: '#ffffff' },
  'Field only': { bg: '#cbb488', fg: '#3a2e18' },
};

export function Admin() {
  const { data: team = [] } = useTeam();
  const { data: stages = [] } = useStages();
  const { data: settings } = useSettings();
  const [showInvite, setShowInvite] = useState(false);

  const settingsRows = settings
    ? [
        { label: 'Business name', sub: 'Shown on quotes & invoices', value: settings.business_name },
        { label: 'Service area', sub: 'Default map region', value: settings.service_area },
        { label: 'Default markup', sub: 'Applied to new estimates', value: `${settings.default_markup}%` },
        { label: 'Crews', sub: 'Active field teams', value: `${settings.crew_count} active` },
      ]
    : [];

  return (
    <div className="px-[30px] pt-[26px] pb-[30px]">
      <h2 className="m-0 mb-1 text-[29px]">Admin</h2>
      <p className="mt-0 mb-6 text-[13px] text-text-secondary">Team, workflow, and company settings</p>

      <div className="grid grid-cols-[1.35fr_1fr] items-start gap-9">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="m-0 text-base">Team &amp; crews</h4>
            <Button variant="secondary" className="text-xs" onClick={() => setShowInvite(true)}>
              + Invite member
            </Button>
          </div>
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: '38%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <thead>
              <tr className="text-[11px] tracking-[0.06em] text-text-muted uppercase">
                <th className="pb-2 font-semibold">Member</th>
                <th className="pb-2 font-semibold">Role</th>
                <th className="pb-2 font-semibold">Crew</th>
                <th className="pb-2 text-right font-semibold">Access</th>
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
                            {t.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-[13px] text-[#4a3d30]">{t.role}</td>
                    <td className="py-2 text-[13px] text-[#4a3d30]">{t.crews?.name ?? '—'}</td>
                    <td className="py-2 text-right">
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ background: access.bg, color: access.fg }}
                      >
                        {t.access_level}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="m-0 text-base">Project stages</h4>
              <Button variant="ghost" className="text-xs" title="Rename or recolor stages — coming soon" disabled>
                Edit
              </Button>
            </div>
            <StageListEditor stages={stages} />
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
    </div>
  );
}
