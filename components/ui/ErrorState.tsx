import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

type ErrorStateProps = {
  message: string
  detail: string
  onRetry: () => void
}

export default function ErrorState({ message, detail, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Card className="max-w-sm p-8 text-center">
        <p className="text-red-400">{message}</p>
        <p className="mt-2 text-xs text-zinc-500">{detail}</p>
        <Button className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      </Card>
    </div>
  )
}
