import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger'

// Each variant is a complete className string. Extra classes passed via
// `className` are appended, so callers can layer on layout tweaks
// (e.g. flex + gap for an icon button) without redefining the base look.
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50',
  secondary: 'rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100',
  ghost: 'text-sm text-zinc-400 hover:text-zinc-100 transition-colors',
  link: 'text-sm text-zinc-300 hover:underline',
  danger: 'rounded-md border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-50',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`${variantStyles[variant]} ${className}`.trim()} {...props} />
}
