"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Filter, Heart, MapPin, Phone, Mail, Star, Share, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Cookies from "js-cookie"
import { getUserFavorites, getPostImages, removeFavorite as removeFromFavorites } from "@/lib/api"
import { getPostById } from "@/lib/api"
import { ImageIcon } from "lucide-react"
import PostCard from "@/components/post-card"
import Footer from "@/components/footer"

export default function FavoritesPage() {
  const [favoriteListings, setFavoriteListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSort, setCurrentSort] = useState("newest")
  const [username, setUsername] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ id: number, type: "success" | "error", message: string } | null>(null)

  useEffect(() => {
    const storedFullName = Cookies.get("fullName")
    if (storedFullName) setUsername(storedFullName)
  }, [])

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = Cookies.get("userId")
      if (!userId) return

      try {
        const res = await getUserFavorites(Number(userId))
        if (res.status === "success" && res.favourites) {
          const posts = await Promise.all(
            res.favourites.map(async (fav: any) => {
              try {
                const postRes = await getPostById(fav.post_id || fav)
                const post = postRes.post

                const imgRes = await getPostImages(fav.post_id || fav)
                const rawImage = imgRes.images?.[0]?.image_url || ""
                const fullImageUrl = rawImage.startsWith("http")
                  ? rawImage
                  : `http://localhost:3000${rawImage}`

                return {
                  ...post,
                  image: fullImageUrl,
                  address: {
                    district: post.district || post.address || "Không rõ",
                    city: post.province || "TP. Hồ Chí Minh",
                  },
                  area: post.area ?? 20,
                  price: Number(post.price) ?? 1000000,
                  type: post.type || "Phòng trọ",
                  dateAdded: post.post_date || post.created_at || new Date().toISOString(),
                  status: post.status || "Còn trống",
                  rating: post.avg_rating ?? 4,
                  reviewCount: 10,
                  amenities: post.amenities || [],
                  isFavorite: true
                }
              } catch (error) {
                console.error(`Lỗi khi lấy bài viết ${fav.post_id || fav}:`, error)
                return null
              }
            })
          )
          setFavoriteListings(posts.filter((item) => item !== null))
        } else {
          console.error("Không có dữ liệu yêu thích hoặc định dạng không đúng:", res)
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách yêu thích:", err)
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  const handleToggleFavorite = async (id: number) => {
    const userId = Cookies.get("userId")
    if (!userId) return

    try {
      setRemovingId(id.toString())
      const response = await removeFromFavorites(Number(userId), id)

      if (response.status === "success") {
        setFavoriteListings((prev) => prev.filter((item) => item.id !== id))
        setNotification({
          id: id,
          type: "success",
          message: "Đã xóa khỏi danh sách yêu thích"
        })
      } else {
        setNotification({
          id: id,
          type: "error",
          message: "Không thể xóa khỏi danh sách yêu thích"
        })
      }
    } catch (error) {
      console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error)
      setNotification({
        id: id,
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại"
      })
    } finally {
      setRemovingId(null)
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleSort = (value: string) => {
    setCurrentSort(value)
    setIsLoading(true)

    setTimeout(() => {
      const sortedResults = [...favoriteListings]
      switch (value) {
        case "price-asc":
          sortedResults.sort((a, b) => a.price - b.price)
          break
        case "price-desc":
          sortedResults.sort((a, b) => b.price - a.price)
          break
        case "area":
          sortedResults.sort((a, b) => b.area - a.area)
          break
        case "newest":
          sortedResults.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
          break
      }
      setFavoriteListings(sortedResults)
      setIsLoading(false)
    }, 500)
  }

  const handleClearFavorites = () => {
    // Implementation of handleClearFavorites function
  }

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container py-6">

        {/* Show notification if exists */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            <p>{notification.message}</p>
          </div>
        )}

        {/* Tiêu đề trang */}
        <section className="bg-muted py-12">
          <div className="container text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Phòng trọ yêu thích</h1>
            <p className="text-muted-foreground max-w-[700px] mx-auto">
              Danh sách các phòng trọ bạn đã lưu để xem lại sau
            </p>
          </div>
        </section>

        {/* Danh sách phòng trọ yêu thích */}
        <section className="container py-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Danh sách yêu thích của bạn</h2>
            <div className="flex items-center gap-2">
              <Select value={currentSort} onValueChange={handleSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                  <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                  <SelectItem value="area">Diện tích</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Card key={item} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : favoriteListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-3 mb-4">
                <Heart className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Chưa có phòng trọ yêu thích</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Hãy thêm phòng trọ vào danh sách yêu thích để xem lại sau.
              </p>
              <Button asChild>
                <Link href="/search">Tìm phòng trọ</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favoriteListings.map((item) => (
                  <PostCard
                    key={item.id}
                    item={item}
                    onToggleFavorite={handleToggleFavorite}
                    activeNotification={notification && notification.id === item.id ? {
                      id: item.id,
                      type: notification.type,
                      message: notification.message
                    } : null}
                  />
                ))}
              </div>

              {favoriteListings.length > 8 && (
                <div className="flex justify-center">
                  <Button variant="outline" className="mt-4">
                    Xem thêm <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}