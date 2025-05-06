import RoomDetailPage from '@/components/room-detail-page'
import Header from '@/components/header'

export default function RoomDetail({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <RoomDetailPage id={params.id} />
      </main>
    </div>
  )
}
