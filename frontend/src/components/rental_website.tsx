"use client"
import { useEffect, useState } from "react"
import { getPosts, getPostImages, addToHistory, getUserFavorites, addToFavorites, removeFavorite } from "@/lib/api"
import { Search, MapPin, Phone, Mail, Star, Heart, ArrowRight, Check, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import Cookies from "js-cookie"
import { districtMap, provinceMap } from "@/lib/locations"
import { ImageIcon } from "lucide-react"
import PostCard from "@/components/post-card"
import Footer from "./footer"

type Post = {
  id: number
  title: string
  content: string
  price: string | number
  address: string
  district?: string
  province?: string
  image?: string
  area?: number
  status?: string
  amenities?: string[]
}

type Room = Post

export default function RentalWebsite() {
  const [locationQuery, setLocationQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("")
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [username, setUsername] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [activeNotification, setActiveNotification] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])

  // Load user favorites
  const loadFavorites = async () => {
    if (!userId) return;
    try {
      const res = await getUserFavorites(userId);
      console.log("Kết quả response full:", res);
      const favoriteIds = res.favourites
        .filter((fav: any) => typeof fav.post_id === "number")
        .map((fav: any) => fav.post_id);
      console.log("FAVOURITE POST IDs:", favoriteIds);
      setFavorites(favoriteIds);
    } catch (err) {
      console.error("Failed to load favorites:", err);
    }
  };

  const fetchMoreRooms = async () => {
    const res = await getPosts(8, offset)
    if (res.status === "success") {
      const postsWithImages = await Promise.all(
        res.posts.map(async (post: Post) => {
          const imgRes = await getPostImages(post.id)
          const image = imgRes.images?.[0]?.image_url || null
          return { ...post, image }
        })
      )
      setRooms((prev) => [...prev, ...postsWithImages])
      setOffset((prev) => prev + res.posts.length)

      if (res.posts.length < 8) {
        setHasMore(false)
      }
    }
  }

  const handleSearch = () => {
    const trimmedLocation = locationQuery.trim();

    let queryParams: string[] = []

    if (trimmedLocation) {
      queryParams.push(`district=${encodeURIComponent(trimmedLocation)}`)
    }

    // Xử lý lọc giá
    switch (priceFilter) {
      case "1":
        queryParams.push("max_price=1000000")
        break
      case "2":
        queryParams.push("min_price=1000000", "max_price=2000000")
        break
      case "3":
        queryParams.push("min_price=2000000", "max_price=3000000")
        break
      case "4":
        queryParams.push("min_price=3000000", "max_price=5000000")
        break
      case "5":
        queryParams.push("min_price=5000000", "max_price=10000000")
        break
    }

    const searchQuery = queryParams.join("&")

    window.location.href = `/search${searchQuery ? `?${searchQuery}` : ""}`
  }


  const handleToggleFavorite = async (postId: number) => {
    if (!userId) {
      setActiveNotification({
        id: postId,
        type: "error",
        message: "Vui lòng đăng nhập để thêm vào danh sách yêu thích"
      });
      setTimeout(() => setActiveNotification(null), 3000);
      return;
    }

    try {
      if (favorites.includes(postId)) {
        await removeFavorite(userId, postId);
        setFavorites(prev => {
          const updated = prev.filter(id => id !== postId);
          console.log("FAVORITES SAU KHI XOÁ:", updated);
          return updated;
        });
        setActiveNotification({
          id: postId,
          type: "success",
          message: "Đã xóa khỏi danh sách yêu thích"
        });
      } else {
        await addToFavorites(userId, postId);
        setFavorites(prev => {
          const updated = [...prev, postId];
          const unique = Array.from(new Set(updated)); // tránh trùng
          console.log("FAVORITES SAU KHI THÊM:", unique);
          return unique;
        });
        setActiveNotification({
          id: postId,
          type: "success",
          message: "Đã thêm vào danh sách yêu thích"
        });
      }

      setTimeout(() => setActiveNotification(null), 3000);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setActiveNotification({
        id: postId,
        type: "error",
        message: "Không thể thực hiện. Vui lòng thử lại sau."
      });
      setTimeout(() => setActiveNotification(null), 3000);
    }
  };



  const handleViewDetails = async (postId: number) => {
    if (userId) {
      try {
        await addToHistory(userId, postId);
      } catch (err) {
        console.error("Error adding to history:", err);
      }
    }
    window.location.href = `/room/${postId}`;
  };

  useEffect(() => {
    if (!locationQuery.trim() && !priceFilter) {
      setHasSearched(false)
    }
  }, [locationQuery, priceFilter])

  useEffect(() => {
    const storedFullName = Cookies.get("fullName")
    const storedUserId = Cookies.get("userId")

    if (storedFullName) setUsername(storedFullName)
    if (storedUserId) setUserId(Number(storedUserId))
    fetchMoreRooms()
  }, [])

  useEffect(() => {
    if (userId) {
      loadFavorites();

      // Gọi thêm API để in danh sách yêu thích
      const fetchFavorites = async () => {
        try {
          const res = await getUserFavorites(userId);
          if (res.status === "success") {
            console.log("DANH SÁCH YÊU THÍCH KHI VỀ TRANG CHỦ:", res.favourites);
          }
        } catch (err) {
          console.error("Lỗi khi in danh sách yêu thích:", err);
        }
      };

      fetchFavorites();
    }
  }, [userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const res = await getPosts(1, 20) // Thêm tham số page và limit
        if (res.status === "success" && res.posts) {
          // Lọc các bài viết trùng lặp dựa trên id
          const uniquePosts = res.posts.reduce((acc: any[], current: any) => {
            const x = acc.find((item: any) => item.id === current.id)
            if (!x) {
              return acc.concat([current])
            } else {
              return acc
            }
          }, [])

          // Sắp xếp bài viết theo thời gian đăng mới nhất
          const sortedPosts = uniquePosts.sort((a: any, b: any) => {
            const dateA = new Date(a.post_date || a.created_at).getTime()
            const dateB = new Date(b.post_date || b.created_at).getTime()
            return dateB - dateA
          })

          setPosts(sortedPosts)
        } else {
          console.error("Không có dữ liệu bài viết hoặc định dạng không đúng:", res)
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách bài viết:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleLogout = () => {
    Cookies.remove("userId")
    Cookies.remove("email")
    Cookies.remove("fullName")
    Cookies.remove("avatarUrl")
    Cookies.remove("contactNumber")
    setUsername("")
    setUserId(null)
    setFavorites([])
    window.location.reload()
  }

  const activeRooms = (!hasSearched || (!locationQuery.trim() && !priceFilter))
    ? rooms
    : filteredRooms

  return (
    <div className="flex flex-col min-h-screen">


      <main className="flex-1">
        <section className="relative h-[500px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: "url('/image.jpg')" }}
          />
          <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Tìm phòng trọ phù hợp với bạn
            </h1>
            <p className="text-lg md:text-xl drop-shadow">
              Hàng ngàn phòng trọ chất lượng đang chờ bạn khám phá
            </p>
          </div>
        </section>

        <div className="relative z-30 -mt-20 mb-12 px-4 w-full flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
            <Tabs defaultValue="rent">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="rent">Thuê phòng</TabsTrigger>
                <TabsTrigger value="post">Đăng tin</TabsTrigger>
              </TabsList>

              <TabsContent value="rent" className="space-y-4">
                <div className="text-center p-4">
                  <p className="mb-4">Tìm kiếm phòng trọ ưng ý ngay hôm nay</p>
                  <Link
                    href="/search"
                    onClick={(e) => {
                      if (!Cookies.get("userId")) {
                        e.preventDefault();
                        window.location.href = `/search`;
                      }
                    }}
                    passHref
                  >
                    <Button>Tới trang tìm kiếm</Button>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="post">
                <div className="text-center p-4">
                  <p className="mb-4">Đăng tin cho thuê phòng trọ của bạn ngay hôm nay</p>
                  <Link
                    href="/post"
                    onClick={(e) => {
                      if (!Cookies.get("userId")) {
                        e.preventDefault();
                        window.location.href = `/login?redirect=/post`;
                      }
                    }}
                    passHref
                  >
                    <Button>Đăng tin ngay</Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <section className="max-w-7xl mx-auto px-4 py-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Phòng trọ nổi bật</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {
              (!hasSearched || (!locationQuery.trim() && !priceFilter)) ? (
                rooms.map((room, index) => (
                  <PostCard
                    key={`room-${room.id}-${index}`}
                    item={{
                      id: room.id,
                      title: room.title,
                      price: Number(room.price),
                      area: room.area ?? 20,
                      address: {
                        district: districtMap[room.district ?? ""] || room.district || "Không rõ",
                        city: provinceMap[room.province ?? ""] || room.province || "TP. Hồ Chí Minh"
                      },
                      image: room.image,
                      status: room.status || "Còn trống",
                      amenities: room.amenities || [],
                      isFavorite: favorites.includes(room.id)
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    activeNotification={activeNotification}
                  />
                ))
              ) : (
                filteredRooms.length > 0 ? (
                  filteredRooms.map((room, index) => (
                    <PostCard
                      key={`filtered-room-${room.id}-${index}`}
                      item={{
                        id: room.id,
                        title: room.title,
                        price: Number(room.price),
                        area: room.area ?? 20,
                        address: {
                          district: districtMap[room.district ?? ""] || room.district || "Không rõ",
                          city: provinceMap[room.province ?? ""] || room.province || "TP. Hồ Chí Minh"
                        },
                        image: room.image,
                        status: room.status || "Còn trống",
                        amenities: room.amenities || [],
                        isFavorite: favorites.includes(room.id)
                      }}
                      onToggleFavorite={handleToggleFavorite}
                      activeNotification={activeNotification}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground">
                    Không tìm thấy phòng trọ phù hợp.
                  </div>
                )
              )
            }
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" className="mt-4" onClick={fetchMoreRooms}>
                Xem thêm <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

        <section className="bg-muted py-12">
          <div className="container mx-auto px-4 space-y-6">
            <h2 className="text-2xl font-bold text-center">Tại sao chọn NhàTrọ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center items-center h-12 w-12 mx-auto bg-primary/10 rounded-full mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Tìm kiếm dễ dàng</h3>
                <p className="text-muted-foreground text-sm">
                  Hệ thống tìm kiếm thông minh giúp bạn nhanh chóng tìm được phòng trọ phù hợp với nhu cầu.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center items-center h-12 w-12 mx-auto bg-primary/10 rounded-full mb-4">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Phòng trọ chất lượng</h3>
                <p className="text-muted-foreground text-sm">
                  Tất cả phòng trọ đều được kiểm duyệt kỹ càng, đảm bảo chất lượng và độ tin cậy cao.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center items-center h-12 w-12 mx-auto bg-primary/10 rounded-full mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Hỗ trợ 24/7</h3>
                <p className="text-muted-foreground text-sm">
                  Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc của bạn trong quá trình tìm phòng.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-bold tracking-tight">
                Đăng tin cho thuê phòng trọ
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Bạn có phòng trọ, căn hộ muốn cho thuê? Đăng tin ngay trên NhàTrọ để tiếp cận hàng ngàn khách hàng tiềm năng.
              </p>
              <ul className="space-y-3">
                {[
                  "Đăng tin miễn phí, không giới hạn số lượng",
                  "Tiếp cận hàng ngàn người tìm phòng mỗi ngày",
                  "Quản lý tin đăng dễ dàng, thuận tiện",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1">
                      <svg
                        className="text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/post"
                onClick={(e) => {
                  if (!Cookies.get("username")) {
                    e.preventDefault();
                    window.location.href = `/login?redirect=/post`;
                  }
                }}
                passHref
              >
                <Button>Đăng tin ngay</Button>
              </Link>
            </div>

            <div className="relative w-full h-[300px] md:h-[400px]">
              <Image
                src="/image2.jpg"
                alt="Đăng tin cho thuê"
                fill
                className="object-contain bg-transparent"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
