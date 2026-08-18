import type { Icon } from '@phosphor-icons/react';

export function MobilePlaceholder({ title, subtitle, Icon }: { title: string; subtitle: string; Icon: Icon }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-6 text-center">
      <Icon size={32} weight="duotone" className="text-text-muted" />
      <div className="text-lg font-semibold">{title}</div>
      <p className="m-0 text-[13px] text-text-secondary">{subtitle}</p>
    </div>
  );
}
