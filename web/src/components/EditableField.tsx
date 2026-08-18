import { useEffect, useRef, useState } from 'react';
import { PencilSimple } from '@phosphor-icons/react';

export function EditableField({
  value,
  onSave,
  type = 'text',
  placeholder = '—',
  className = '',
  inputClassName = '',
}: {
  value: string;
  onSave: (next: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        autoComplete="off"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={
          inputClassName ||
          'w-full rounded border border-black/12 bg-bg px-1.5 py-0.5 text-inherit outline-none focus-visible:outline-2 focus-visible:outline-accent'
        }
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-left ${className}`}
    >
      <span className={value ? '' : 'text-text-muted'}>{value || placeholder}</span>
      <PencilSimple size={11} className="flex-none text-text-muted opacity-0 group-hover:opacity-100" />
    </button>
  );
}
