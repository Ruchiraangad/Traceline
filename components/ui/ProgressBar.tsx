// Thin indeterminate progress bar — used when an operation is in
// progress but there's no real percentage to show.
export default function ProgressBar() {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
      <div className="h-full w-1/3 animate-progress-indeterminate rounded-full bg-zinc-400" />
    </div>
  )
}
