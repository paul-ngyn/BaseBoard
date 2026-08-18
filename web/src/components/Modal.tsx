import type { ReactNode } from 'react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-[440px] flex-col gap-4 overflow-y-auto rounded-xl border border-black/10 bg-bg p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h4 className="m-0 text-base font-semibold">{title}</h4>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded border-none bg-transparent text-lg text-text-muted hover:text-accent"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
