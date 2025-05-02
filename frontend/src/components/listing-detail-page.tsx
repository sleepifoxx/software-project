"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, Building, Calendar, Check, ChevronLeft, ChevronRight, Clock, Copy,
  Eye, Heart, Home, Info, MapPin, MessageCircle, Phone, Share, Square, Star, User,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

interface Review {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  date: string;
  comment: string;
}
interface SimilarListing {
  id: string;
  title: string;
  price: number;
  area: number;
  address: string;
  image: string;
}

export default function ListingDetailPage({ postId }: { postId: number }) {
  const [listing, setListing] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  useEffect(() => {
    if (postId) {
      fetch(`http://localhost:8000/get-post-by-id?post_id=${postId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setListing(data.post)
          }
        })
        .catch(err => console.error(err))
    }
  }, [postId])

  if (!listing) {
    return <div className="text-center py-20 text-muted-foreground">Đang tải thông tin bài đăng...</div>
  }

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === listing.images.length - 1 ? 0 : prevIndex + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? listing.images.length - 1 : prevIndex - 1))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Đã sao chép vào clipboard!")
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }
  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <MapPin className="h-5 w-5 text-primary" />
                <span>NhàTrọ</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFavorite}>
                <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                {isFavorite ? "Đã lưu" : "Lưu tin"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
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
                      <Input id="link" defaultValue={`https://nhatro.vn/listings/${listing.id}`} readOnly />
                    </div>
                    <Button
                      size="sm"
                      className="px-3"
                      onClick={() => copyToClipboard(`https://nhatro.vn/listings/${listing.id}`)}
                    >
                      <span className="sr-only">Copy</span>
                      <Copy className="h-4 w-4" />
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
        </header>

        <main className="flex-1 container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Hình ảnh và thông tin cơ bản */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <Image
                      src={listing.images[currentImageIndex] || "/placeholder.svg"}
                      alt={listing.title}
                      fill
                      className="object-cover"
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
                      {currentImageIndex + 1} / {listing.images.length}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {listing.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      className={`aspect-video relative overflow-hidden rounded-lg cursor-pointer ${index === currentImageIndex ? "ring-2 ring-primary" : ""
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${listing.title} - Ảnh ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2">{listing.status}</Badge>
                      <CardTitle className="text-2xl">{listing.title}</CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {`${listing.address.street}, ${listing.address.ward}, ${listing.address.district}, ${listing.address.city}`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{listing.price.toLocaleString()}đ/tháng</p>
                      <p className="text-sm text-muted-foreground">Đặt cọc: {listing.deposit}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <Square className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Diện tích</span>
                      <span className="font-medium">{listing.area} m²</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Sức chứa</span>
                      <span className="font-medium">{listing.capacity} người</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <Building className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Tầng</span>
                      <span className="font-medium">{listing.floor}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <Home className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-sm text-muted-foreground">Loại hình</span>
                      <span className="font-medium">{listing.type}</span>
                    </div>
                  </div>

                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="description">Mô tả</TabsTrigger>
                      <TabsTrigger value="amenities">Tiện ích</TabsTrigger>
                      <TabsTrigger value="location">Vị trí</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-4 space-y-4">
                      <div className="whitespace-pre-line text-sm">{listing.description}</div>

                      <div className="space-y-2">
                        <h3 className="font-medium">Chi phí hàng tháng</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Tiền điện</p>
                            <p className="font-medium">{listing.utilities.electric.toLocaleString()}đ/kWh</p>
                          </div>
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Tiền nước</p>
                            <p className="font-medium">{listing.utilities.water.toLocaleString()}đ/m³</p>
                          </div>
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Internet</p>
                            <p className="font-medium">{listing.utilities.internet.toLocaleString()}đ/tháng</p>
                          </div>
                          <div className="border rounded-lg p-3 space-y-1">
                            <p className="text-sm text-muted-foreground">Giữ xe</p>
                            <p className="font-medium">{listing.utilities.parking.toLocaleString()}đ/tháng</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="amenities" className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {listing.amenities.map((amenity: string, index: number) => (
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
                            {`${listing.address.street}, ${listing.address.ward}, ${listing.address.district}, ${listing.address.city}`}
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
                    Đánh giá ({listing.reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {listing.reviews.length > 0 ? (
                    listing.reviews.map((review: Review) => (
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

              {/* Phòng trọ tương tự */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Phòng trọ tương tự</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {listing.similarListings.map((item: SimilarListing) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative h-40">
                        <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-1">{item.title}</h3>
                        <p className="text-primary font-medium mt-1">{item.price.toLocaleString()}đ/tháng</p>
                        <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                          <span>{item.area}m²</span>
                          <span>{item.address}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`/listings/${item.id}`}>Xem chi tiết</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Thông tin liên hệ */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.owner.avatar || "/placeholder.svg"} alt={listing.owner.name} />
                      <AvatarFallback>{listing.owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium flex items-center">
                        {listing.owner.name}
                        {listing.owner.verified && (
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
                      <p className="text-xs text-muted-foreground">Thành viên từ {listing.owner.memberSince}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Tỉ lệ phản hồi: {listing.owner.responseRate}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Thời gian phản hồi: {listing.owner.responseTime}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      {listing.owner.phone}
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

              {/* Thông tin bài đăng */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin bài đăng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Mã tin</span>
                    <span className="font-medium">{listing.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ngày đăng</span>
                    <span>{listing.publishedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ngày hết hạn</span>
                    <span>{listing.expiredDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lượt xem</span>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{listing.views}</span>
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
        </main>

        <footer className="border-t py-4 bg-background">
          <div className="container flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NhàTrọ. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </footer>
      </div>
    )
  }
}