"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Building,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  Home,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  Share,
  Square,
  Star,
  User,
  Mail,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"

export default function RoomDetailPage({ id }: { id: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [roomData, setRoomData] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy dữ liệu bài viết
        const res = await axios.get(`http://localhost:8000/get-post-by-id?post_id=${id}`)
  
        if (res.data.status === "success") {
          const post = res.data.post
  
          // Lấy hình ảnh từ API riêng
          const imageRes = await axios.get(`http://localhost:8000/get-post-images/${id}`)
          const images = imageRes.data.status === "success"
            ? imageRes.data.images.map((img: any) => img.image_url)
            : []
  
          // Tạo đối tượng roomData hoàn chỉnh
          const processedPost = {
            ...post,
            address: {
              street: post.street,
              ward: post.rural,
              district: post.district,
              city: post.province,
            },
            images: images,
            area: post.room_num,
            capacity: 2, // giả định
            floor: post.floor_num,
            type: "Phòng trọ",
            status: "Còn trống",
            publishedDate: post.post_date.split("T")[0],
            expiredDate: "2025-05-20", // bạn có thể sửa phần này
            amenities: [],
            utilities: {
              electric: post.electricity_fee,
              water: post.water_fee,
              internet: post.internet_fee,
              parking: post.vehicle_fee,
            },
            owner: {
              name: "Chủ trọ",
              phone: "0123456789",
              avatar: "/placeholder.svg",
              responseRate: 95,
              responseTime: "Trong 1 giờ",
              memberSince: "01/2023",
              verified: true,
            },
            reviews: [],
            similarListings: [],
          }
  
          setRoomData(processedPost)
        } else {
          console.error("Không tìm thấy bài viết")
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu phòng:", error)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [id])
  
  const nextImage = () => {
    if (!roomData) return
    setCurrentImageIndex((prevIndex) => (prevIndex === roomData.images.length - 1 ? 0 : prevIndex + 1))
  }

  const prevImage = () => {
    if (!roomData) return
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? roomData.images.length - 1 : prevIndex - 1))
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Đã sao chép vào clipboard!")
  }

  if (isLoading) {
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
              <Button variant="outline" className="hidden md:flex">
                Đăng nhập
              </Button>
              <Button>Đăng ký</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-12">
          <div className="space-y-8">
            <div className="h-[400px] bg-muted animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div className="h-8 bg-muted animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-[200px] bg-muted animate-pulse rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-muted">
          <div className="container py-8 md:py-12">
            <div className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} NhàTrọ. Tất cả quyền được bảo lưu.
            </div>
          </div>
        </footer>
      </div>
    )
  }

  if (!roomData) {
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
              <Button variant="outline" className="hidden md:flex">
                Đăng nhập
              </Button>
              <Button>Đăng ký</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-12">
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Không tìm thấy phòng trọ</h1>
            <p className="text-muted-foreground mb-6">Phòng trọ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button asChild>
              <Link href="/search">Tìm phòng trọ khác</Link>
            </Button>
          </div>
        </main>

        <footer className="bg-muted">
          <div className="container py-8 md:py-12">
            <div className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} NhàTrọ. Tất cả quyền được bảo lưu.
            </div>
          </div>
        </footer>
      </div>
    )
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
            <Button variant="outline" className="hidden md:flex">
              Đăng nhập
            </Button>
            <Button>Đăng ký</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/search" className="hover:text-primary">
              Tìm phòng
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground">{roomData.title}</span>
          </div>
        </div>

        {/* Hình ảnh và thông tin cơ bản */}
        <section className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hình ảnh */}
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
    src={images[currentImageIndex] || "/placeholder.svg"}
    alt={`Ảnh ${currentImageIndex + 1}`}
    className="w-full h-full object-cover"
  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {currentImageIndex + 1} / {images.length}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
  {images.map((image: string, index: number) => (
    <div
      key={index}
      className={`aspect-video overflow-hidden rounded-lg cursor-pointer ${
        index === currentImageIndex ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => setCurrentImageIndex(index)}
    >
      <img
        src={image || "/placeholder.svg"}
        alt={`Ảnh ${index + 1}`}
        className="w-full h-full object-cover"
      />
    </div>
  ))}
</div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={roomData.status === "Còn trống" ? "default" : "secondary"}>{roomData.status}</Badge>
                  <Badge variant="outline">{roomData.type}</Badge>
                </div>
                <h1 className="text-2xl font-bold">{roomData.title}</h1>
                <p className="text-muted-foreground flex items-center mt-1">
  <MapPin className="h-4 w-4 mr-1" />
  {[
    roomData.address.street,
    roomData.address.ward,
    roomData.address.district,
    roomData.address.city,
  ]
    .filter((part) => part && part.trim() !== "" && part !== "Không")
    .join(", ")}
</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Giá thuê</p>
                  <p className="text-2xl font-bold text-primary">{roomData.price.toLocaleString()}đ/tháng</p>
                  <p className="text-sm">Đặt cọc: {roomData.deposit}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant={isFavorite ? "default" : "outline"} onClick={toggleFavorite}>
                    <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "Đã lưu" : "Lưu tin"}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Share className="mr-2 h-4 w-4" />
                        Chia sẻ
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Chia sẻ bài đăng</DialogTitle>
                        <DialogDescription>Sao chép đường dẫn hoặc chia sẻ qua mạng xã hội</DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                          <Label htmlFor="link" className="sr-only">
                            Link
                          </Label>
                          <Input id="link" defaultValue={`https://nhatro.vn/room/${roomData.id}`} readOnly />
                        </div>
                        <Button
                          size="sm"
                          className="px-3"
                          onClick={() => copyToClipboard(`https://nhatro.vn/room/${roomData.id}`)}
                        >
                          <span className="sr-only">Copy</span>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                          >
                            <path
                              d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </div>
                      <div className="flex justify-center gap-4 mt-4">
                        <Button variant="outline" size="icon" className="rounded-full">
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
                        <Button variant="outline" size="icon" className="rounded-full">
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
                        <Button variant="outline" size="icon" className="rounded-full">
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
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <Square className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Diện tích</span>
                  <span className="font-medium">{roomData.area} m²</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Sức chứa</span>
                  <span className="font-medium">{roomData.capacity} người</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <Building className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Tầng</span>
                  <span className="font-medium">{roomData.floor}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                  <Home className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Loại hình</span>
                  <span className="font-medium">{roomData.type}</span>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={roomData.owner.avatar || "/placeholder.svg"} alt={roomData.owner.name} />
                      <AvatarFallback>{roomData.owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium flex items-center">
                        {roomData.owner.name}
                        {roomData.owner.verified && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="ml-2 px-1">
                                  <Check className="h-3 w-3 text-primary" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Đã xác thực</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Thành viên từ {roomData.owner.memberSince}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Tỉ lệ phản hồi: {roomData.owner.responseRate}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Thời gian phản hồi: {roomData.owner.responseTime}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      {roomData.owner.phone}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setShowContactForm(!showContactForm)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Nhắn tin
                    </Button>
                  </div>

                  {showContactForm && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <Label htmlFor="name">Họ tên</Label>
                        <Input id="name" placeholder="Nhập họ tên của bạn" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input id="phone" placeholder="Nhập số điện thoại" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="message">Tin nhắn</Label>
                        <Textarea
                          id="message"
                          placeholder="Tôi quan tâm đến phòng trọ này và muốn biết thêm thông tin..."
                          className="min-h-[100px]"
                        />
                      </div>
                      <Button className="w-full">Gửi tin nhắn</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Thông tin chi tiết */}
        <section className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="description">Mô tả</TabsTrigger>
                      <TabsTrigger value="amenities">Tiện ích</TabsTrigger>
                      <TabsTrigger value="location">Vị trí</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-4 space-y-4">
                      <div className="whitespace-pre-line text-sm">{roomData.description}</div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Chi phí hàng tháng</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Tiền điện</p>
                            <p className="font-medium">{roomData.utilities.electric.toLocaleString()}đ/kWh</p>
                          </div>
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Tiền nước</p>
                            <p className="font-medium">{roomData.utilities.water.toLocaleString()}đ/m³</p>
                          </div>
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Internet</p>
                            <p className="font-medium">{roomData.utilities.internet.toLocaleString()}đ/tháng</p>
                          </div>
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Giữ xe</p>
                            <p className="font-medium">{roomData.utilities.parking.toLocaleString()}đ/tháng</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="amenities" className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {roomData.amenities.map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="bg-primary/10 rounded-full p-1">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="location" className="mt-4">
                      <div className="border rounded-lg overflow-hidden h-[300px] bg-muted flex items-center justify-center">
                        <div className="text-center p-4">
                          <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Bản đồ sẽ được hiển thị tại đây</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {`${roomData.address.street}, ${roomData.address.ward}, ${roomData.address.district}, ${roomData.address.city}`}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <h3 className="font-medium">Địa điểm lân cận</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 rounded-full p-1">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                            <span>Siêu thị (200m)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 rounded-full p-1">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                            <span>Trường học (500m)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 rounded-full p-1">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                            <span>Bệnh viện (1km)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 rounded-full p-1">
                              <Check className="h-4 w-4 text-primary" />
                            </div>
                            <span>Công viên (300m)</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Đánh giá */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                    Đánh giá ({roomData.reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roomData.reviews.length > 0 ? (
                    roomData.reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.user.name}</p>
                              <p className="text-xs text-muted-foreground">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">Chưa có đánh giá nào</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Viết đánh giá
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Thông tin bài đăng */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin bài đăng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mã tin</span>
                    <span className="font-medium">{roomData.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ngày đăng</span>
                    <span>{roomData.publishedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ngày hết hạn</span>
                    <span>{roomData.expiredDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lượt xem</span>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{roomData.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Đặt lịch xem phòng */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Đặt lịch xem phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="visit-date">Ngày xem</Label>
                    <Input id="visit-date" type="date" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="visit-time">Thời gian</Label>
                    <Select>
                      <SelectTrigger id="visit-time">
                        <SelectValue placeholder="Chọn thời gian" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Buổi sáng (8:00 - 11:00)</SelectItem>
                        <SelectItem value="afternoon">Buổi chiều (13:00 - 17:00)</SelectItem>
                        <SelectItem value="evening">Buổi tối (18:00 - 20:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="visit-note">Ghi chú</Label>
                    <Textarea
                      id="visit-note"
                      placeholder="Thông tin thêm về lịch xem phòng..."
                      className="min-h-[80px]"
                    />
                  </div>
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch xem
                  </Button>
                </CardContent>
              </Card>

              {/* Báo cáo */}
              <div className="text-center">
                <Button variant="link" size="sm" className="text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  Báo cáo bài đăng này
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Phòng trọ tương tự */}
        <section className="container py-6">
          <h2 className="text-2xl font-bold mb-6">Phòng trọ tương tự</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {roomData.similarListings.map((item: any) => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {item.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-primary">{(item.price / 1000000).toFixed(1)} triệu/tháng</span>
                    <span className="text-sm text-muted-foreground">{item.area}m²</span>
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
                <Link href="/" className="hover:text-primary">
                  Trang chủ
                </Link>
                <Link href="/search" className="hover:text-primary">
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
