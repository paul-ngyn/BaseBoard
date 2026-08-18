import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'inline-flex items-center gap-1.5 rounded-md font-serif font-semibold cursor-pointer transition-colors ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg px-4 py-2 hover:bg-accent-600 active:bg-accent-700',
  secondary:
    'bg-surface text-text border border-black/12 px-4 py-2 hover:bg-accent-600 hover:text-bg hover:border-accent-600 active:bg-accent-700 active:border-accent-700',
  ghost: 'bg-transparent text-accent px-2 py-1 hover:text-accent-600 active:text-accent-700',
};

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
