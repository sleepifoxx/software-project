"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation" // 👈 để điều hướng
import { ArrowLeft, Building, Check, Home, Info, MapPin, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PostListingPage() {
  console.log("✅ Component PostListingPage được render")
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("info")
  const [previewMode, setPreviewMode] = useState(false)
  const router = useRouter() // 👈 hook điều hướng

  // 👉 Kiểm tra đăng nhập
  useEffect(() => {
    const username = Cookies.get("username")
    if (!username) {
      router.push("/login") // chuyển hướng nếu chưa đăng nhập
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string)
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages])
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Giả lập gọi API đăng tin
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      alert("Đăng tin thành công!")
      // Chuyển hướng sau khi đăng tin thành công
      window.location.href = "/"
    } catch (error) {
      console.error("Đăng tin thất bại:", error)
      alert("Có lỗi xảy ra khi đăng tin!")
    } finally {
      setIsLoading(false)
    }
  }

  const amenities = [
    { id: "wifi", label: "Wifi" },
    { id: "ac", label: "Điều hòa" },
    { id: "fridge", label: "Tủ lạnh" },
    { id: "washing", label: "Máy giặt" },
    { id: "parking", label: "Chỗ để xe" },
    { id: "security", label: "An ninh 24/7" },
    { id: "kitchen", label: "Nhà bếp" },
    { id: "bathroom", label: "Nhà vệ sinh riêng" },
    { id: "furniture", label: "Nội thất" },
    { id: "balcony", label: "Ban công" },
    { id: "elevator", label: "Thang máy" },
    { id: "pet", label: "Cho phép thú cưng" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              <span>NhàTrọ</span>
            </Link>
            <h1 className="text-lg font-medium hidden md:block">Đăng tin cho thuê</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Link>
            </Button>
            <Button size="sm" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? "Chỉnh sửa" : "Xem trước"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        {previewMode ? (
          <PreviewListing />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đăng tin</CardTitle>
                  <CardDescription>Vui lòng cung cấp thông tin chi tiết về phòng trọ của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="info" className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span className="hidden sm:inline">Thông tin cơ bản</span>
                        <span className="sm:hidden">Cơ bản</span>
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Chi tiết phòng</span>
                        <span className="sm:hidden">Chi tiết</span>
                      </TabsTrigger>
                      <TabsTrigger value="images" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">Hình ảnh & Vị trí</span>
                        <span className="sm:hidden">Hình ảnh</span>
                      </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit}>
                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">
                            Tiêu đề đăng tin <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            placeholder="VD: Phòng trọ cao cấp quận 1, đầy đủ nội thất"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Mô tả chi tiết <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Mô tả chi tiết về phòng trọ, vị trí, tiện ích xung quanh..."
                            className="min-h-[150px]"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="propertyType">
                              Loại hình <span className="text-red-500">*</span>
                            </Label>
                            <Select required disabled={isLoading}>
                              <SelectTrigger id="propertyType">
                                <SelectValue placeholder="Chọn loại hình" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="room">Phòng trọ</SelectItem>
                                <SelectItem value="apartment">Căn hộ</SelectItem>
                                <SelectItem value="house">Nhà nguyên căn</SelectItem>
                                <SelectItem value="shared">Ở ghép</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="price">
                              Giá thuê (VNĐ/tháng) <span className="text-red-500">*</span>
                            </Label>
                            <Input id="price" type="number" placeholder="VD: 3000000" required disabled={isLoading} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Đặt cọc</Label>
                          <RadioGroup defaultValue="1month" className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1month" id="deposit-1" />
                              <Label htmlFor="deposit-1">1 tháng</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2month" id="deposit-2" />
                              <Label htmlFor="deposit-2">2 tháng</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3month" id="deposit-3" />
                              <Label htmlFor="deposit-3">3 tháng</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="custom" id="deposit-custom" />
                              <Label htmlFor="deposit-custom">Khác</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>Các chi phí khác</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="electricPrice">Tiền điện (VNĐ/kWh)</Label>
                              <Input id="electricPrice" type="number" placeholder="VD: 3500" disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="waterPrice">Tiền nước (VNĐ/m³)</Label>
                              <Input id="waterPrice" type="number" placeholder="VD: 15000" disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="internetPrice">Tiền internet (VNĐ/tháng)</Label>
                              <Input id="internetPrice" type="number" placeholder="VD: 200000" disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="parkingPrice">Tiền giữ xe (VNĐ/tháng)</Label>
                              <Input id="parkingPrice" type="number" placeholder="VD: 100000" disabled={isLoading} />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="button" onClick={() => setActiveTab("details")}>
                            Tiếp theo
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="area">
                              Diện tích (m²) <span className="text-red-500">*</span>
                            </Label>
                            <Input id="area" type="number" placeholder="VD: 25" required disabled={isLoading} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="capacity">Sức chứa (người)</Label>
                            <Input id="capacity" type="number" placeholder="VD: 2" disabled={isLoading} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="floor">Tầng</Label>
                            <Input id="floor" type="number" placeholder="VD: 3" disabled={isLoading} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tiện ích</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {amenities.map((amenity) => (
                              <div key={amenity.id} className="flex items-center space-x-2">
                                <Checkbox id={amenity.id} />
                                <Label htmlFor={amenity.id} className="text-sm">
                                  {amenity.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="address">
                            <AccordionTrigger>Địa chỉ chi tiết</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="province">
                                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                                    </Label>
                                    <Select required disabled={isLoading}>
                                      <SelectTrigger id="province">
                                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                                        <SelectItem value="hn">Hà Nội</SelectItem>
                                        <SelectItem value="dn">Đà Nẵng</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="district">
                                      Quận/Huyện <span className="text-red-500">*</span>
                                    </Label>
                                    <Select required disabled={isLoading}>
                                      <SelectTrigger id="district">
                                        <SelectValue placeholder="Chọn quận/huyện" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="q1">Quận 1</SelectItem>
                                        <SelectItem value="q2">Quận 2</SelectItem>
                                        <SelectItem value="q3">Quận 3</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="ward">
                                      Phường/Xã <span className="text-red-500">*</span>
                                    </Label>
                                    <Select required disabled={isLoading}>
                                      <SelectTrigger id="ward">
                                        <SelectValue placeholder="Chọn phường/xã" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="p1">Phường 1</SelectItem>
                                        <SelectItem value="p2">Phường 2</SelectItem>
                                        <SelectItem value="p3">Phường 3</SelectItem>
                                        <SelectItem value="other">Khác</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="street">
                                      Đường/Phố <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="street" placeholder="VD: Nguyễn Huệ" required disabled={isLoading} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="addressDetail">Số nhà, tên tòa nhà, lối vào</Label>
                                  <Input
                                    id="addressDetail"
                                    placeholder="VD: Số 123, Tòa nhà ABC, ngõ 456"
                                    disabled={isLoading}
                                  />
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("info")}>
                            Quay lại
                          </Button>
                          <Button type="button" onClick={() => setActiveTab("images")}>
                            Tiếp theo
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="images" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="images">
                            Hình ảnh phòng trọ <span className="text-red-500">*</span>
                          </Label>
                          <div className="border-2 border-dashed rounded-lg p-4 text-center">
                            <Input
                              id="images"
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={isLoading}
                            />
                            <Label
                              htmlFor="images"
                              className="cursor-pointer flex flex-col items-center justify-center py-4"
                            >
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <span className="text-sm font-medium">Kéo thả hình ảnh vào đây hoặc click để chọn</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                PNG, JPG hoặc JPEG (tối đa 5MB)
                              </span>
                            </Label>
                          </div>

                          {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                              {images.map((image, index) => (
                                <div key={index} className="relative group">
                                  <Image
                                    src={image || "/placeholder.svg"}
                                    alt={`Uploaded image ${index + 1}`}
                                    width={200}
                                    height={150}
                                    className="w-full h-24 object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mapLocation">Vị trí trên bản đồ</Label>
                          <div className="border rounded-lg overflow-hidden h-[300px] bg-muted flex items-center justify-center">
                            <div className="text-center p-4">
                              <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Tính năng bản đồ sẽ được cập nhật sau</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                            Quay lại
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "Đăng tin"}
                          </Button>
                        </div>
                      </TabsContent>
                    </form>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hướng dẫn đăng tin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm">Cung cấp đầy đủ thông tin để tin đăng hấp dẫn hơn</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm">Đăng ít nhất 3 ảnh chụp rõ nét, đầy đủ các góc phòng</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm">Mô tả chi tiết về phòng, vị trí và các tiện ích xung quanh</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm">Cung cấp đầy đủ thông tin về giá cả và các chi phí khác</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
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

// Component xem trước tin đăng
function PreviewListing() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Phòng trọ cao cấp quận 1, đầy đủ nội thất</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">3.000.000đ/tháng</p>
              <p className="text-sm text-muted-foreground">Đặt cọc: 1 tháng</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Building className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Diện tích</p>
                  <p className="font-medium">25 m²</p>
                </div>
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Sức chứa</p>
                  <p className="font-medium">2 người</p>
                </div>
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Đăng ngày</p>
                  <p className="font-medium">{new Date().toLocaleDateString("vi-VN")}</p>
                </div>
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Mã tin</p>
                  <p className="font-medium">NT{Math.floor(Math.random() * 100000)}</p>
                </div>
              </div>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Chi phí hàng tháng</CardTitle>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tiền điện:</span>
                      <span>3.500đ/kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền nước:</span>
                      <span>15.000đ/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Internet:</span>
                      <span>200.000đ/tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giữ xe:</span>
                      <span>100.000đ/tháng</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h3 className="font-medium">Tiện ích</h3>
                <div className="flex flex-wrap gap-2">
                  {["Wifi", "Điều hòa", "Tủ lạnh", "Máy giặt", "Chỗ để xe", "Nhà bếp"].map((item) => (
                    <div
                      key={item}
                      className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1 flex items-center"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-lg">Mô tả chi tiết</h3>
            <div className="text-sm space-y-2">
              <p>Phòng trọ cao cấp mới xây, đầy đủ nội thất, vị trí trung tâm quận 1, thuận tiện di chuyển.</p>
              <p>
                Phòng rộng 25m², có cửa sổ thoáng mát, ban công rộng rãi. Đầy đủ tiện nghi: điều hòa, tủ lạnh, máy giặt,
                bếp từ, tủ quần áo, giường, bàn làm việc.
              </p>
              <p>
                Khu vực an ninh 24/7, có chỗ để xe rộng rãi, thang máy hiện đại. Gần các tiện ích: siêu thị, trường học,
                bệnh viện, công viên.
              </p>
              <p>Phù hợp với sinh viên, người đi làm. Ưu tiên người sạch sẽ, ý thức tốt.</p>
            </div>

            <h3 className="font-medium text-lg">Liên hệ</h3>
            <div className="flex items-center gap-4">
              <Button>Gọi ngay: 0912.345.678</Button>
              <Button variant="outline">Nhắn tin</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
