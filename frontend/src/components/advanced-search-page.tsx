"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Filter, Heart, MapPin, Search, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function AdvancedSearchPage() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([1000000, 5000000])
  const [areaRange, setAreaRange] = useState([15, 50])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [totalResults, setTotalResults] = useState(0)

  // Giả lập dữ liệu tìm kiếm
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("http://localhost:8000/search-posts?limit=100&offset=0")
        const data = await res.json()
  
        if (data.status === "success") {
          const posts = data.posts
          const postsWithAddress = data.posts.map((post: any) => ({
            ...post,
            address: {
              district: post.district,
              city: post.province,
            },
          }))
          // Gọi API lấy tiện ích nếu cần
          const postsWithConvenience = await Promise.all(
            postsWithAddress.map(async (post: any) => {
              const res = await fetch(`http://localhost:8000/get-post-convenience/${post.id}`)
              const convenienceData = await res.json()
              return {
                ...post,
                amenities: convenienceData.convenience?.amenities || [],
              }
            })
          )          
  
          setSearchResults(postsWithConvenience)
          setTotalResults(postsWithConvenience.length)
        }
      } catch (err) {
        console.error("Lỗi khi fetch bài đăng:", err)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [])
  

  const toggleFavorite = (id: string) => {
    setSearchResults((prev) => prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const queryParams = new URLSearchParams({
        ...(selectedDistrict !== "all" && { district: selectedDistrict }),
        ...(selectedType !== "all" && { type: selectedType }),
        min_price: priceRange[0].toString(),
        max_price: priceRange[1].toString(),
        limit: "100",
        offset: "0",
      })
  
      const res = await fetch(`http://localhost:8000/search-posts?${queryParams}`)
      const data = await res.json()
  
      if (data.status === "success") {
        const posts = data.posts
        const postsWithAddress = data.posts.map((post: any) => ({
          ...post,
          address: {
            district: post.district,
            city: post.province,
          },
        }))
        // Nếu có lọc tiện ích thì gọi tiếp API để lọc tiếp
        let finalPosts = posts
  
        if (selectedAmenities.length > 0) {
          const postsWithConvenience = await Promise.all(
            postsWithAddress.map(async (post: any) => {
              const res = await fetch(`http://localhost:8000/get-post-convenience/${post.id}`)
              const data = await res.json()
              return {
                ...post,
                amenities: data.convenience?.amenities || [],
              }
            })
          )
        
          finalPosts = postsWithConvenience.filter((post) =>
            selectedAmenities.every((a) => post.amenities.includes(a))
          )
        }
  
        setSearchResults(finalPosts)
        setTotalResults(finalPosts.length)
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error)
    } finally {
      setIsLoading(false)
    }
  }
  

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDistrict("all")
    setSelectedType("all")
    setPriceRange([1000000, 5000000])
    setAreaRange([15, 50])
    setSelectedAmenities([])
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

      <main className="flex-1 container py-6">
        <div className="flex flex-col space-y-6">
          {/* Tiêu đề trang */}
          <div>
            <h1 className="text-2xl font-bold">Tìm kiếm phòng trọ nâng cao</h1>
            <p className="text-muted-foreground">Tìm kiếm phòng trọ phù hợp với nhu cầu của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Bộ lọc - Cột trái */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      Bộ lọc tìm kiếm
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                      Xóa bộ lọc
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <form onSubmit={handleSearch}>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="search">Từ khóa</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="Nhập từ khóa..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="district">Khu vực</Label>
                        <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                          <SelectTrigger id="district">
                            <SelectValue placeholder="Chọn khu vực" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả khu vực</SelectItem>
                            <SelectItem value="quận 1">Quận 1</SelectItem>
                            <SelectItem value="quận 2">Quận 2</SelectItem>
                            <SelectItem value="quận 3">Quận 3</SelectItem>
                            <SelectItem value="quận bình thạnh">Quận Bình Thạnh</SelectItem>
                            <SelectItem value="quận gò vấp">Quận Gò Vấp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-base">Khoảng giá</Label>
                        <div className="pt-4">
                          <Slider
                            defaultValue={[1000000, 5000000]}
                            max={10000000}
                            step={100000}
                            value={priceRange}
                            onValueChange={setPriceRange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{formatPrice(priceRange[0])}đ</span>
                          <span className="text-sm">{formatPrice(priceRange[1])}đ</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-base">Diện tích</Label>
                        <div className="pt-4">
                          <Slider
                            defaultValue={[15, 50]}
                            max={100}
                            step={1}
                            value={areaRange}
                            onValueChange={setAreaRange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{areaRange[0]} m²</span>
                          <span className="text-sm">{areaRange[1]} m²</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-base">Loại hình</Label>
                        <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all">Tất cả</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="phòng trọ" id="room" />
                            <Label htmlFor="room">Phòng trọ</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="căn hộ" id="apartment" />
                            <Label htmlFor="apartment">Căn hộ</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nhà nguyên căn" id="house" />
                            <Label htmlFor="house">Nhà nguyên căn</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ở ghép" id="shared" />
                            <Label htmlFor="shared">Ở ghép</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Separator />

                      <Collapsible className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">Tiện ích</Label>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-2">
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              "Wifi",
                              "Điều hòa",
                              "Tủ lạnh",
                              "Máy giặt",
                              "Chỗ để xe",
                              "An ninh 24/7",
                              "Nhà bếp",
                              "Nhà vệ sinh riêng",
                              "Nội thất",
                              "Ban công",
                            ].map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`amenity-${amenity}`}
                                  checked={selectedAmenities.includes(amenity)}
                                  onCheckedChange={() => handleAmenityChange(amenity)}
                                />
                                <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                                  {amenity}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Button type="submit" className="w-full">
                        Tìm kiếm
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Tìm kiếm phổ biến</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      Quận 1 dưới 3 triệu
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      Gần ĐH Bách Khoa
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      Phòng có gác lửng
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      Phòng có ban công
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                      Phòng mới xây
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kết quả tìm kiếm - Cột phải */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold">Kết quả tìm kiếm</h2>
                  <p className="text-sm text-muted-foreground">Tìm thấy {totalResults} phòng trọ phù hợp</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Select defaultValue="newest">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="h-48 bg-muted animate-pulse" />
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2 mb-4" />
                        <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : totalResults === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted rounded-full p-3 mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Không tìm thấy phòng trọ phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với các tiêu chí
                    khác.
                  </p>
                  <Button onClick={clearFilters}>Xóa bộ lọc</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {searchResults.map((item) => (
                    <Card key={item.id} className="overflow-hidden group">
                      <div className="relative">
                        <div className="aspect-video relative overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                          />
                          {item.status === "Đã cho thuê" && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge variant="destructive" className="text-sm">
                                Đã cho thuê
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full"
                            onClick={() => toggleFavorite(item.id)}
                          >
                            <Heart className={`h-4 w-4 ${item.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                          </Button>
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-1">
                          <Link href={`/room/${item.id}`} className="hover:text-primary">
                            {item.title}
                          </Link>
                        </h3>
                        <div className="flex justify-between items-center mt-1">
                          <p className="font-medium text-primary">
                            {new Intl.NumberFormat("vi-VN").format(item.price)}đ/tháng
                          </p>
                          <p className="text-sm text-muted-foreground">{item.area}m²</p>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.address.district}, {item.address.city}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.amenities.slice(0, 3).map((amenity: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {item.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.amenities.length - 3}
                            </Badge>
                          )}
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
              )}

              {totalResults > 0 && (
                <div className="flex justify-center mt-8">
                  <div className="flex">
                    <Button variant="outline" size="icon" className="rounded-r-none">
                      1
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-none">
                      2
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-none">
                      3
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-l-none">
                      ...
                    </Button>
                  </div>
                </div>
              )}
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
