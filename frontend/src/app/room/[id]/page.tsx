import RoomDetailPage from "@/components/room-detail-page"
import { notFound } from "next/navigation"

type Props = {
  params: {
    id: string
  }
}

export default function Page({ params }: Props) {
  const postId = params.id

  if (isNaN(Number(postId))) return notFound()

  return <RoomDetailPage id={postId} />  // ✅ truyền đúng tên props là "id"
}
