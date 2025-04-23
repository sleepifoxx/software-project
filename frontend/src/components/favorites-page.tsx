"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Filter, Heart, MapPin, Phone, Mail, Star, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Cookies from "js-cookie"
import { getUserFavorites, getPostImages, removeFavorite as removeFromFavorites } from "@/lib/api"
import { getPostById } from "@/lib/api"

export default function FavoritesPage() {
  const [favoriteListings, setFavoriteListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSort, setCurrentSort] = useState("newest")
  const [username, setUsername] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error", message: string } | null>(null)

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
                  : `http://localhost:8000/${rawImage}`

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

  const removeFavorite = async (id: string) => {
    const userId = Cookies.get("userId")
    if (!userId) return

    try {
      setRemovingId(id) // Set the ID being removed for UI feedback

      // Call the API to remove from favorites
      const response = await removeFromFavorites(Number(userId), Number(id))

      if (response.status === "success") {
        // Update local state only after successful API call
        setFavoriteListings((prev) => prev.filter((item) => item.id !== id))
        setNotification({
          type: "success",
          message: "Đã xóa khỏi danh sách yêu thích"
        })
      } else {
        setNotification({
          type: "error",
          message: "Không thể xóa khỏi danh sách yêu thích"
        })
      }
    } catch (error) {
      console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error)
      setNotification({
        type: "error",
        message: "Có lỗi xảy ra, vui lòng thử lại"
      })
    } finally {
      setRemovingId(null)
      // Auto-hide notification after 3 seconds
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            <span>NhàTrọ</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Trang chủ
            </Link>
            <Link href="/search" className="text-sm font-medium hover:text-primary">
              Tìm phòng
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Đăng tin
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Tin tức
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Liên hệ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {username ? (
              <>
                <span className="text-sm font-medium">Xin chào, {username}</span>
                <Link href="/profile">
                  <Button variant="outline">Tài khoản</Button>
                </Link>
                <Button variant="outline" onClick={() => {
                  Cookies.remove("userId")
                  Cookies.remove("email")
                  Cookies.remove("fullName")
                  Cookies.remove("avatarUrl")
                  Cookies.remove("contactNumber")
                  setUsername("")
                  window.location.reload()
                }}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="hidden md:flex">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button>
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
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
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Lọc
              </Button>
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
                  <Card key={item.id} className="overflow-hidden group">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                        className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full"
                          onClick={() => removeFavorite(item.id)}
                          disabled={removingId === item.id}
                        >
                          {removingId === item.id ? (
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          ) : (
                            <Heart className="h-4 w-4 fill-primary text-primary" />
                          )}
                        </Button>
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge className="absolute bottom-2 left-2">
                        {item.status === "Đã cho thuê" ? "Đã cho thuê" : item.type}
                      </Badge>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        {`${item.address.district}, ${item.address.city}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-primary">
                          {(item.price / 1000000).toFixed(1)} triệu/tháng
                        </span>
                        <span className="text-sm text-muted-foreground">{item.area}m²</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < item.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({item.reviewCount} đánh giá)</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/room/${item.id}`}>Xem chi tiết</Link>
                      </Button>
                    </CardFooter>
                  </Card>
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

      <footer className="bg-muted">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                <span>NhàTrọ</span>
              </div>
              <p className="text-muted-foreground">
                Nền tảng kết nối chủ trọ và người thuê trọ uy tín, chất lượng hàng đầu Việt Nam.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Liên kết nhanh</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="#" className="hover:text-primary">
                  Trang chủ
                </Link>
                <Link href="#" className="hover:text-primary">
                  Tìm phòng
                </Link>
                <Link href="#" className="hover:text-primary">
                  Đăng tin
                </Link>
                <Link href="#" className="hover:text-primary">
                  Tin tức
                </Link>
                <Link href="#" className="hover:text-primary">
                  Liên hệ
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Hỗ trợ</h3>
              <nav className="flex flex-col space-y-2">
                <Link href="#" className="hover:text-primary">
                  Trung tâm hỗ trợ
                </Link>
                <Link href="#" className="hover:text-primary">
                  Câu hỏi thường gặp
                </Link>
                <Link href="#" className="hover:text-primary">
                  Hướng dẫn đăng tin
                </Link>
                <Link href="#" className="hover:text-primary">
                  Quy chế hoạt động
                </Link>
                <Link href="#" className="hover:text-primary">
                  Chính sách bảo mật
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Liên hệ</h3>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>0123 456 789</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>info@nhatro.vn</span>
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} NhàTrọ. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  )
}
