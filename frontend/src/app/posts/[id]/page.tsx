import ListingDetailPage from "linhtinh/listing-detail-page"
import { notFound } from "next/navigation"

type Props = {
  params: {
    id: string
  }
}

export default async function PostDetailPage({ params }: Props) {
  const postId = Number(params.id)

  if (isNaN(postId)) return notFound()

  return <ListingDetailPage postId={postId} />
}
