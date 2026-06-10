type LogoProps = {
  className?: string
}

// App mark: a circle with a 4-pointed compass star inside, on a white
// rounded-square badge — same white-on-dark contrast as the primary
// button. `className` controls the badge size (e.g. h-10 w-10).
export default function Logo({ className = '' }: LogoProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-white ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-2/3 w-2/3">
        <circle cx="12" cy="12" r="9.5" stroke="#18181b" strokeWidth="1.5" />
        <path
          d="M12 5 L14.2 9.8 L19 12 L14.2 14.2 L12 19 L9.8 14.2 L5 12 L9.8 9.8 Z"
          fill="#18181b"
        />
      </svg>
    </div>
  )
}
