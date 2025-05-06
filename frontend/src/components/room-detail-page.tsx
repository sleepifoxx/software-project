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
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { provinceMap, districtMap } from "@/lib/locations"
import Footer from "@/components/footer"

export default function RoomDetailPage({ id }: { id: string }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [roomData, setRoomData] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [approvedReviews, setApprovedReviews] = useState<any[]>([])

  const typeMap: Record<string, string> = {
    room: "Phòng trọ",
    apartment: "Căn hộ",
    house: "Nhà nguyên căn",
    shared: "Ở ghép",
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/get-post-by-id?post_id=${id}`)
        if (res.data.status === "success") {
          const post = res.data.post

          const imageRes = await axios.get(`http://localhost:8000/get-post-images/${id}`)
          let images = []
          if (imageRes.data.status === "success" && imageRes.data.images) {
            images = imageRes.data.images.map((img: any) => {
              if (img.image_url) {
                if (!img.image_url.startsWith('http')) {
                  return `http://localhost:3000${img.image_url}`
                }
                return img.image_url
              }
              return null
            }).filter(Boolean)
          }
          setImages(images)

          const convenienceRes = await axios.get(`http://localhost:8000/get-post-convenience/${id}`)
          const convenience = convenienceRes.data.status === "success" ? convenienceRes.data.convenience : {}

          const amenities: string[] = []
          if (convenience.wifi) amenities.push("Wi-Fi")
          if (convenience.air_conditioner) amenities.push("Điều hòa")
          if (convenience.fridge) amenities.push("Tủ lạnh")
          if (convenience.washing_machine) amenities.push("Máy giặt")
          if (convenience.parking_lot) amenities.push("Chỗ để xe")
          if (convenience.security) amenities.push("An ninh")
          if (convenience.kitchen) amenities.push("Bếp")
          if (convenience.private_bathroom) amenities.push("WC riêng")
          if (convenience.furniture) amenities.push("Nội thất")
          if (convenience.bacony) amenities.push("Ban công")
          if (convenience.elevator) amenities.push("Thang máy")
          if (convenience.pet_allowed) amenities.push("Thú cưng được phép")

          const userRes = await axios.get(`http://localhost:8000/get-user-info?user_id=${post.user_id}`)
          const user = userRes.data.status === "success" ? userRes.data.user : null

          const commentRes = await axios.get(`http://localhost:8000/get-post-comments/${id}`)
          const comments = commentRes.data.status === "success" ? commentRes.data.comments : []
          console.log("All comments:", comments)
          const approvedComments = comments.filter((comment: any) => comment.status === "approved")
          console.log("Approved comments:", approvedComments)
          setApprovedReviews(approvedComments)

          const processedPost = {
            ...post,
            address: {
              street: post.street,
              ward: post.rural,
              district: post.district,
              city: post.province,
            },
            images: images,
            area: post.area,
            capacity: 2,
            floor: post.floor_num,
            type: typeMap[post.type] || post.type,
            status: "Còn trống",
            publishedDate: post.post_date.split("T")[0],
            expiredDate: "2025-05-20",
            amenities: amenities,
            utilities: {
              electric: post.electricity_fee,
              water: post.water_fee,
              internet: post.internet_fee,
              parking: post.vehicle_fee,
            },
            owner: {
              name: user ? user.full_name : "Chủ trọ",
              phone: user ? user.contact_number : "0123456789",
              avatar: "/placeholder.svg",
              responseRate: 95,
              responseTime: "Trong 1 giờ",
              memberSince: "01/2023",
              verified: true,
            },
            reviews: approvedComments,
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

  const submitReview = async () => {
    if (!rating) {
      alert("Vui lòng chọn số sao đánh giá")
      return
    }

    setIsSubmittingReview(true)
    try {
      // Get userId from cookie
      const cookies = document.cookie.split(';')
      const userIdCookie = cookies.find(cookie => cookie.trim().startsWith('userId='))
      const userId = userIdCookie ? parseInt(userIdCookie.split('=')[1]) : null

      if (!userId) {
        alert("Vui lòng đăng nhập để đánh giá")
        return
      }

      const res = await axios.post("http://localhost:8000/add-comment", null, {
        params: {
          post_id: parseInt(id),
          user_id: userId,
          rating,
          comment
        }
      })

      if (res.data.status === "success") {
        alert("Đánh giá của bạn đã được gửi và đang chờ duyệt!")
        setComment("")
        setRating(5)
      } else {
        alert("Có lỗi xảy ra: " + res.data.message)
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error)
      alert("Không thể gửi đánh giá. Vui lòng thử lại sau.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
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

        <Footer />
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="flex flex-col min-h-screen">
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

        <Footer />
      </div>
    )
  }
  const province = provinceMap[roomData.address.city] || roomData.address.city
  const district = districtMap[roomData.address.district] || roomData.address.district
  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-1">

        <section className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  {images[currentImageIndex] ? (
                    <img
                      src={images[currentImageIndex]}
                      alt={`Ảnh ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
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
                    className={`aspect-video overflow-hidden rounded-lg cursor-pointer ${index === currentImageIndex ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`Ảnh ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={roomData.status === "Còn trống" ? "default" : "secondary"}>{roomData.status}</Badge>
                  <Badge variant="outline">{roomData.type}</Badge>
                </div>
                <h1 className="text-2xl font-bold">{roomData.title}</h1>
                <p className="text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {[roomData.address.street, roomData.address.ward, district, province]
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

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={roomData.owner.avatar} alt={roomData.owner.name} />
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
                  <Button
                    className="w-full"
                    onClick={() => window.open(`tel:${roomData.owner.phone}`)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {roomData.owner.phone}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

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
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                    Đánh giá ({approvedReviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {approvedReviews && approvedReviews.length > 0 ? (
                    approvedReviews.map((review: any, index: number) => {
                      console.log("Rendering review:", review)
                      return (
                        <div key={review.id || index} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {review.user_id?.toString().charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">Người dùng #{review.user_id}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(review.comment_date).toLocaleDateString()}
                                </p>
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
                          <p className="mt-2 text-sm">{review.comment || "Không có nội dung"}</p>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Chưa có đánh giá nào</p>
                  )}

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-4">Đánh giá của bạn</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rating" className="block mb-2">Số sao</Label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                              key={star}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto"
                              onClick={() => setRating(star)}
                            >
                              <Star
                                className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                              />
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comment">Nội dung</Label>
                        <Textarea
                          id="comment"
                          placeholder="Chia sẻ trải nghiệm của bạn..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>Lưu ý: Đánh giá của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.</p>
                      </div>

                      <Button
                        onClick={submitReview}
                        disabled={isSubmittingReview}
                        className="w-full"
                      >
                        {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
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

              <div className="text-center">
                <Button variant="link" size="sm" className="text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  Báo cáo bài đăng này
                </Button>
              </div>
            </div>
          </div>
        </section>

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

      <Footer />
    </div>
  )
}
