import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger'

// Each variant is a complete className string. Extra classes passed via
// `className` are appended, so callers can layer on layout tweaks
// (e.g. flex + gap for an icon button) without redefining the base look.
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'text-sm text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  link: 'text-sm text-zinc-300 hover:underline disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'rounded-md border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  // When true, the label is hidden (but still occupies space, so the
  // button doesn't change size) and a spinner is centered over it.
  loading?: boolean
}

export default function Button({ variant = 'primary', className = '', loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={`relative ${variantStyles[variant]} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      <span className={loading ? 'invisible' : ''}>{children}</span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
    </button>
  )
}
