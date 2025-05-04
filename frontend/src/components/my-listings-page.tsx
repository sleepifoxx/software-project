"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  XCircle,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"
import RoomDetailPage from "./room-detail-page"
import Header from "./header"
import Footer from "./footer"

interface Post {
  id: number
  title: string
  description: string
  price: number
  status: string
  is_report: boolean
  post_date: string
  user_id: number
}

export default function MyListingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("approved")
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedPost, setSelectedPost] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [activeTab])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      setError("")
      setSuccess("")

      // Get userId from cookie
      const cookies = document.cookie.split(';')
      const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('userId='))
      const userId = userIdCookie ? parseInt(userIdCookie.split('=')[1]) : null

      if (!userId) {
        router.push('/login')
        return
      }

      let response
      if (activeTab === "approved") {
        // Lấy bài viết đã duyệt của người dùng
        response = await axios.get(`http://localhost:8000/get-posts-by-user?user_id=${userId}`)
        if (response?.data.status === "success") {
          // Lọc chỉ lấy bài viết có status là 'approved'
          const approvedPosts = response.data.posts.filter((post: Post) => post.status === 'approved')
          setPosts(approvedPosts)
        }
      } else if (activeTab === "pending") {
        // Lấy bài viết chờ duyệt của người dùng
        response = await axios.get(`http://localhost:8000/get-posts-by-user?user_id=${userId}`)
        if (response?.data.status === "success") {
          // Lọc chỉ lấy bài viết có status là 'pending'
          const pendingPosts = response.data.posts.filter((post: Post) => post.status === 'pending')
          setPosts(pendingPosts)
        }
      } else if (activeTab === "rejected") {
        // Lấy bài viết bị từ chối của người dùng
        response = await axios.get(`http://localhost:8000/get-posts-by-user?user_id=${userId}`)
        if (response?.data.status === "success") {
          // Lọc chỉ lấy bài viết có status là 'rejected'
          const rejectedPosts = response.data.posts.filter((post: Post) => post.status === 'rejected')
          setPosts(rejectedPosts)
        }
      }

      if (response?.data.status !== "success") {
        setError(response?.data.message || "Có lỗi xảy ra khi tải danh sách bài đăng")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải danh sách bài đăng")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return

    try {
      const cookies = document.cookie.split(';')
      const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('userId='))
      const userId = userIdCookie ? parseInt(userIdCookie.split('=')[1]) : null

      if (!userId) {
        router.push('/login')
        return
      }

      const response = await axios.delete(`http://localhost:8000/delete-post/${postId}`, {
        headers: { Authorization: userId.toString() }
      })

      if (response.data.status === "success") {
        setSuccess("Đã xóa bài đăng thành công")
        fetchPosts()
      } else {
        setError(response.data.message || "Có lỗi xảy ra khi xóa bài đăng")
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa bài đăng")
      console.error(err)
    }
  }

  const getStatusBadge = (status: string, isReport: boolean) => {
    if (isReport) return <Badge variant="destructive">Bị báo cáo</Badge>

    switch (status) {
      case "approved":
        return <Badge variant="default">Đã duyệt</Badge>
      case "pending":
        return <Badge variant="secondary">Chờ duyệt</Badge>
      case "rejected":
        return <Badge variant="destructive">Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (selectedPost) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="container py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPost(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <RoomDetailPage id={selectedPost.toString()} />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Quản lý bài đăng</h1>
            <p className="text-muted-foreground">
              Xem và quản lý các bài đăng của bạn
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-6">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Thành công</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="approved">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Đã duyệt
              </TabsTrigger>
              <TabsTrigger value="pending">
                <Clock className="h-4 w-4 mr-2" />
                Chờ duyệt
              </TabsTrigger>
              <TabsTrigger value="rejected">
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6 mt-2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Không có bài đăng nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>
                          {new Date(post.post_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(post.status, post.is_report)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{post.description}</p>
                    <p className="font-semibold mt-2">
                      {post.price.toLocaleString()}đ/tháng
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPost(post.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem trước
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
