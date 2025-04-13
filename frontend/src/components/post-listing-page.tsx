"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building, Check, Home, Info, MapPin, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createPost, addPostImages } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function PostListingPage() {
  console.log("✅ Component PostListingPage được render")
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("info")
  const [previewMode, setPreviewMode] = useState(false)
  const router = useRouter()
  const [userId, setUserId] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    price: "",
    deposit: "1month",
    electricPrice: "",
    waterPrice: "",
    internetPrice: "",
    parkingPrice: "",
    area: "",
    capacity: "",
    floor: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    addressDetail: "",
    amenities: [] as string[]
  })

  // Check if user is logged in
  useEffect(() => {
    const storedUserId = Cookies.get("userId")

    if (storedUserId) {
      setUserId(Number(storedUserId))
      setIsPageLoading(false)
    } else {
      // Only redirect if there's no user ID
      router.push("/login?redirect=/post")
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, id]
        : prev.amenities.filter(item => item !== id)
    }))
  }

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

    if (!userId) {
      toast.error("Vui lòng đăng nhập để đăng tin")
      return
    }

    if (images.length < 1) {
      toast.error("Vui lòng thêm ít nhất 1 hình ảnh")
      return
    }

    setIsLoading(true)

    const fullAddress = `${formData.addressDetail} ${formData.street}, ${formData.ward}, ${formData.district}, ${formData.province}`

    try {
      // Create post first
      const postData = {
        user_id: userId,
        title: formData.title,
        content: formData.description,
        price: formData.price,
        address: fullAddress,
        province: formData.province,
        district: formData.district,
        rural: formData.ward,
        street_address: formData.street,
        house_number: formData.addressDetail,
        type: formData.propertyType,
        area: Number(formData.area),
        room_num: Number(formData.capacity) || 1,
        deposit: formData.deposit,
        // Include extra costs
        electric_cost: formData.electricPrice ? Number(formData.electricPrice) : undefined,
        water_cost: formData.waterPrice ? Number(formData.waterPrice) : undefined,
        internet_cost: formData.internetPrice ? Number(formData.internetPrice) : undefined,
        parking_cost: formData.parkingPrice ? Number(formData.parkingPrice) : undefined,
        floor: formData.floor ? Number(formData.floor) : undefined,
        amenities: formData.amenities.join(',')
      }

      const res = await createPost(postData)

      if (res.status === "success") {
        // If post is created successfully, add images
        if (images.length > 0) {
          await addPostImages(res.post_id, images)
        }

        toast.success("Đăng tin thành công!")
        setTimeout(() => {
          window.location.href = `/post/${res.post_id}`
        }, 1500)
      } else {
        throw new Error(res.message || "Failed to create post")
      }
    } catch (error) {
      console.error("Đăng tin thất bại:", error)
      toast.error("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!")
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

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="mt-4">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

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
          <PreviewListing data={formData} images={images} />
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

                    <form ref={formRef} onSubmit={handleSubmit}>
                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">
                            Tiêu đề đăng tin <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            name="title"
                            placeholder="VD: Phòng trọ cao cấp quận 1, đầy đủ nội thất"
                            required
                            disabled={isLoading}
                            value={formData.title}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">
                            Mô tả chi tiết <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            placeholder="Mô tả chi tiết về phòng trọ, vị trí, tiện ích xung quanh..."
                            className="min-h-[150px]"
                            required
                            disabled={isLoading}
                            value={formData.description}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="propertyType">
                              Loại hình <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              required
                              disabled={isLoading}
                              value={formData.propertyType}
                              onValueChange={(value) => handleSelectChange("propertyType", value)}
                            >
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
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              placeholder="VD: 3000000"
                              required
                              disabled={isLoading}
                              value={formData.price}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Đặt cọc</Label>
                          <RadioGroup
                            value={formData.deposit}
                            onValueChange={(value) => handleSelectChange("deposit", value)}
                            className="flex flex-wrap gap-4"
                          >
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
                            <Input
                              id="area"
                              name="area"
                              type="number"
                              placeholder="VD: 25"
                              required
                              disabled={isLoading}
                              value={formData.area}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="capacity">Sức chứa (người)</Label>
                            <Input
                              id="capacity"
                              name="capacity"
                              type="number"
                              placeholder="VD: 2"
                              disabled={isLoading}
                              value={formData.capacity}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="floor">Tầng</Label>
                            <Input
                              id="floor"
                              name="floor"
                              type="number"
                              placeholder="VD: 3"
                              disabled={isLoading}
                              value={formData.floor}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tiện ích</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {amenities.map((amenity) => (
                              <div key={amenity.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={amenity.id}
                                  checked={formData.amenities.includes(amenity.id)}
                                  onCheckedChange={(checked) => handleCheckboxChange(amenity.id, checked as boolean)}
                                />
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
                                    <Select
                                      required
                                      disabled={isLoading}
                                      value={formData.province}
                                      onValueChange={(value) => handleSelectChange("province", value)}
                                    >
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
                                    <Select
                                      required
                                      disabled={isLoading}
                                      value={formData.district}
                                      onValueChange={(value) => handleSelectChange("district", value)}
                                    >
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
                                    <Select
                                      required
                                      disabled={isLoading}
                                      value={formData.ward}
                                      onValueChange={(value) => handleSelectChange("ward", value)}
                                    >
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
                                    <Input
                                      id="street"
                                      name="street"
                                      placeholder="VD: Nguyễn Huệ"
                                      required
                                      disabled={isLoading}
                                      value={formData.street}
                                      onChange={handleInputChange}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="addressDetail">Số nhà, tên tòa nhà, lối vào</Label>
                                  <Input
                                    id="addressDetail"
                                    name="addressDetail"
                                    placeholder="VD: Số 123, Tòa nhà ABC, ngõ 456"
                                    disabled={isLoading}
                                    value={formData.addressDetail}
                                    onChange={handleInputChange}
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
function PreviewListing({ data, images }: { data: any, images: string[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{data.title || "Phòng trọ cao cấp quận 1, đầy đủ nội thất"}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {data.street ?
                  `${data.street}, ${data.ward}, ${data.district}, ${data.province}` :
                  "Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"}
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{data.price ? `${Number(data.price).toLocaleString('vi-VN')}đ/tháng` : "3.000.000đ/tháng"}</p>
              <p className="text-sm text-muted-foreground">Đặt cọc: {
                data.deposit === "1month" ? "1 tháng" :
                  data.deposit === "2month" ? "2 tháng" :
                    data.deposit === "3month" ? "3 tháng" : "Thỏa thuận"
              }</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {images.length > 0 ? (
                  <Image
                    src={images[0]}
                    alt="Preview image"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <Building className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Image
                      src={image}
                      alt={`Preview image ${index + 2}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Diện tích</p>
                  <p className="font-medium">{data.area || "25"} m²</p>
                </div>
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm text-muted-foreground">Sức chứa</p>
                  <p className="font-medium">{data.capacity || "2"} người</p>
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
                      <span>{data.electricPrice ? `${Number(data.electricPrice).toLocaleString('vi-VN')}đ/kWh` : "3.500đ/kWh"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tiền nước:</span>
                      <span>{data.waterPrice ? `${Number(data.waterPrice).toLocaleString('vi-VN')}đ/m³` : "15.000đ/m³"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Internet:</span>
                      <span>{data.internetPrice ? `${Number(data.internetPrice).toLocaleString('vi-VN')}đ/tháng` : "200.000đ/tháng"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giữ xe:</span>
                      <span>{data.parkingPrice ? `${Number(data.parkingPrice).toLocaleString('vi-VN')}đ/tháng` : "100.000đ/tháng"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h3 className="font-medium">Tiện ích</h3>
                <div className="flex flex-wrap gap-2">
                  {data.amenities.length > 0 ? data.amenities.map((item) => (
                    <div
                      key={item}
                      className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1 flex items-center"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      {item}
                    </div>
                  )) : (
                    ["Wifi", "Điều hòa", "Tủ lạnh", "Máy giặt", "Chỗ để xe", "Nhà bếp"].map((item) => (
                      <div
                        key={item}
                        className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1 flex items-center"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-lg">Mô tả chi tiết</h3>
            <div className="text-sm space-y-2">
              <p>{data.description || "Phòng trọ cao cấp mới xây, đầy đủ nội thất, vị trí trung tâm quận 1, thuận tiện di chuyển."}</p>
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
