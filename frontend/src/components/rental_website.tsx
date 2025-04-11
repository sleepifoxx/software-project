  "use client"
  import { useEffect, useState } from "react"
  import axios from "axios"
  import { getPosts, getPostImages } from "@/lib/api"
  import { Search, MapPin, Phone, Mail, Star, Filter, Heart, Share, ArrowRight } from "lucide-react"
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
  import { searchPosts } from "@/lib/api" 

  type Post = {
    id: number
    title: string
    content: string
    price: string
    address: string
    image?: string
    area?: number 
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
    const [rooms, setRooms] = useState<Room[]>([])
    const fetchMoreRooms = async () => {
      const res = await getPosts(8, offset)
      if (res.status === "success") {
        const postsWithImages = await Promise.all(
          res.posts.map(async (post: Post) => {
            const imgRes = await getPostImages(post.id)
            const image = imgRes.images?.[0]?.image_url || ""
            return { ...post, image }
          })
        )
        // ✅ Gộp bài mới vào cuối danh sách hiện tại
        setRooms((prev) => [...prev, ...postsWithImages])
    
        // ✅ Tăng offset dựa theo số lượng thực tế
        setOffset((prev) => prev + res.posts.length)
    
        if (res.posts.length < 8) {
          setHasMore(false) // Hết dữ liệu
        }
      }
    }
    const handleSearch = async () => {
      const trimmedLocation = locationQuery.trim()
    
      // Nếu không nhập gì ➜ quay lại trạng thái ban đầu
      if (!trimmedLocation && !priceFilter) {
        setFilteredRooms([])
        setHasSearched(false)
        return
      }
    
      try {
        const res = await searchPosts(trimmedLocation, priceFilter)
        if (res.status === "success") {
          const postsWithImages = await Promise.all(
            res.posts.map(async (post: Post) => {
              const imgRes = await getPostImages(post.id)
              const image = imgRes.images?.[0]?.image_url || ""
              return { ...post, image }
            })
          )
          setFilteredRooms(postsWithImages)
          setHasSearched(true)
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err)
        setFilteredRooms([])
        setHasSearched(true)
      }
    }
    useEffect(() => {
      if (!locationQuery.trim() && !priceFilter) {
        setHasSearched(false)
      }
    }, [locationQuery, priceFilter])    
    useEffect(() => {
      const storedUsername = Cookies.get("username")
      if (storedUsername) setUsername(storedUsername)
      fetchMoreRooms()
    }, [])
  const handleLogout = () => {
    Cookies.remove("username") // ✅ Xoá cookie
    window.location.reload()  
  }
  const activeRooms = (!hasSearched || (!locationQuery.trim() && !priceFilter))
  ? rooms
  : filteredRooms
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              <span>NhàTrọ</span>
            </div>
            <nav className="hidden md:flex gap-6">
              <Link href="#" className="text-sm font-medium hover:text-primary">
                Trang chủ
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-primary">
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
        <Button variant="outline" onClick={handleLogout}>
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
            Đăng kí
          </Button>
        </Link>
      </>
    )}
  </div>
          </div>
        </header>

        <main className="flex-1">
        {/* Hero section với ảnh nền và tiêu đề */}
  <section className="relative h-[500px] w-full overflow-hidden">
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/40 z-10" />

    {/* Background image */}
    <div
      className="absolute inset-0 bg-cover bg-center z-0"
      style={{ backgroundImage: "url('/image.jpg')" }}
    />

    {/* Nội dung chữ */}
    <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-white text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
        Tìm phòng trọ phù hợp với bạn
      </h1>
      <p className="text-lg md:text-xl drop-shadow">
        Hàng ngàn phòng trọ chất lượng đang chờ bạn khám phá
      </p>
    </div>
  </section>

  {/* Form tìm kiếm – TÁCH RIÊNG để tránh bị cắt nội dung */}
  <div className="relative z-30 -mt-20 mb-12 px-4 w-full flex justify-center">
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
      <Tabs defaultValue="rent">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="rent">Thuê phòng</TabsTrigger>
          <TabsTrigger value="post">Đăng tin</TabsTrigger>
        </TabsList>

        <TabsContent value="rent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
            <Input
  placeholder="Nhập địa điểm, khu vực..."
  className="h-10"
  value={locationQuery}
  onChange={(e) => setLocationQuery(e.target.value)}
/>
            </div>
            <Select
  value={priceFilter === "" ? undefined : priceFilter}
  onValueChange={(val) => {
    if (val === "0") {
      setPriceFilter("")
    } else {
      setPriceFilter(val)
    }
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Giá tiền" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="0">-- Bỏ chọn --</SelectItem>
    <SelectItem value="1">&lt; 1 triệu</SelectItem>
    <SelectItem value="2">1 - 2 triệu</SelectItem>
    <SelectItem value="3">2 - 3 triệu</SelectItem>
    <SelectItem value="4">3 - 5 triệu</SelectItem>
    <SelectItem value="5">&gt; 5 triệu</SelectItem>
  </SelectContent>
</Select>
<Button className="h-10" onClick={handleSearch}>
  <Search className="mr-2 h-4 w-4" /> Tìm kiếm
</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Quận 1</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Quận 2</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Quận 3</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Quận Bình Thạnh</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">Quận Gò Vấp</Badge>
          </div>
        </TabsContent>

        <TabsContent value="post">
          <div className="text-center p-4">
            <p className="mb-4">Đăng tin cho thuê phòng trọ của bạn ngay hôm nay</p>
            <Link
    href={
      Cookies.get("username")
        ? "/post"
        : `/login?redirect=/post`
    }
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
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" /> Lọc
                </Button>
                <Select>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {
  (!hasSearched || (!locationQuery.trim() && !priceFilter)) ? (
    rooms.map((room) => (
      <Card key={room.id} className="overflow-hidden group h-full flex flex-col">
        <div className="relative">
          <img
            src={room.image}
            alt={`Phòng trọ ${room.title}`}
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <Badge className="absolute bottom-2 left-2">Mới</Badge>
        </div>

        <CardHeader className="p-4">
          <CardTitle className="text-lg">{room.title}</CardTitle>
          <CardDescription className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            {room.address}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-primary">{room.price}</span>
            <span className="text-sm text-muted-foreground">{room.area ?? "20"}m²</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <Star className="h-4 w-4 fill-primary text-primary" />
            <Star className="h-4 w-4 fill-primary text-primary" />
            <Star className="h-4 w-4 fill-primary text-primary" />
            <Star className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground ml-1">(12 đánh giá)</span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 mt-auto">
          <Button variant="outline" className="w-full">
            Xem chi tiết
          </Button>
        </CardFooter>
      </Card>
    ))
  ) : (
    filteredRooms.length > 0 ? (
      filteredRooms.map((room) => (
        <Card key={room.id} className="overflow-hidden group h-full flex flex-col">
          <div className="relative">
            <img
              src={room.image}
              alt={`Phòng trọ ${room.title}`}
              className="w-full h-48 object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <Badge className="absolute bottom-2 left-2">Mới</Badge>
          </div>

          <CardHeader className="p-4">
            <CardTitle className="text-lg">{room.title}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              {room.address}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-primary">{room.price}</span>
              <span className="text-sm text-muted-foreground">{room.area ?? "20"}m²</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <Star className="h-4 w-4 fill-primary text-primary" />
              <Star className="h-4 w-4 fill-primary text-primary" />
              <Star className="h-4 w-4 fill-primary text-primary" />
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground ml-1">(12 đánh giá)</span>
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-0 mt-auto">
            <Button variant="outline" className="w-full">
              Xem chi tiết
            </Button>
          </CardFooter>
        </Card>
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
        {/* Item 1 */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center items-center h-12 w-12 mx-auto bg-primary/10 rounded-full mb-4">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Tìm kiếm dễ dàng</h3>
          <p className="text-muted-foreground text-sm">
            Hệ thống tìm kiếm thông minh giúp bạn nhanh chóng tìm được phòng trọ phù hợp với nhu cầu.
          </p>
        </div>

        {/* Item 2 */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center items-center h-12 w-12 mx-auto bg-primary/10 rounded-full mb-4">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Phòng trọ chất lượng</h3>
          <p className="text-muted-foreground text-sm">
            Tất cả phòng trọ đều được kiểm duyệt kỹ càng, đảm bảo chất lượng và độ tin cậy cao.
          </p>
        </div>

        {/* Item 3 */}
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
      {/* Nội dung bên trái */}
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
    href={
      Cookies.get("username")
        ? "/post"
        : `/login?redirect=/post`
    }
    passHref
  >
    <Button>Đăng tin ngay</Button>
  </Link>
      </div>

      <div className="relative w-full h-[300px] md:h-[400px]">
    <Image
      src="/image2.jpg" // đảm bảo ảnh nằm trong thư mục public
      alt="Đăng tin cho thuê"
      fill
      className="object-contain bg-transparent" // không thêm bo góc, bóng
    />
  </div>
    </div>
  </section>
          <section className="bg-primary text-primary-foreground py-12">
            <div className="container text-center space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Bạn đang tìm phòng trọ?</h2>
              <p className="max-w-2xl mx-auto">
                Hàng ngàn phòng trọ chất lượng đang chờ bạn khám phá. Đăng ký ngay để nhận thông báo về các phòng trọ mới
                nhất.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Input placeholder="Email của bạn" className="bg-primary-foreground text-primary" />
                <Button variant="secondary">Đăng ký</Button>
              </div>
            </div>
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