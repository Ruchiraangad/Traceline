import UploadDetailPage from '@/components/UploadDetailPage'

export default async function UploadDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <UploadDetailPage uploadId={id} />
}
