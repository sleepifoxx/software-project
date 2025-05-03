"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Filter, Heart, Layers, List, MapPin, Search, Share, Sliders, X } from "lucide-react"
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { searchPosts } from "@/lib/api"
import { getPostImages } from "@/lib/api"
import Cookies from "js-cookie"
import { getUserFavorites, addToFavorites, removeFavorite } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { ImageIcon } from "lucide-react"
import PostCard from "@/components/post-card"
import Footer from "@/components/footer"

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showMap, setShowMap] = useState(false)
  const [savedSearches, setSavedSearches] = useState<string[]>([])
  const [currentSort, setCurrentSort] = useState("newest")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([1000000, 5000000])
  const [areaRange, setAreaRange] = useState([15, 50])
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [username, setUsername] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const postsPerPage = 12
  const searchParams = useSearchParams()

  const [activeNotification, setActiveNotification] = useState<{
    id: number;
    type: "success" | "error";
    message: string;
  } | null>(null)

  useEffect(() => {
    const district = searchParams.get("district")
    const min = searchParams.get("min_price")
    const max = searchParams.get("max_price")

    if (district) setSelectedDistrict(district)
    if (min && max) setPriceRange([Number(min), Number(max)])
  }, [])

  useEffect(() => {
    const uid = Cookies.get("userId")
    const uname = Cookies.get("fullName")

    if (uid) {
      setUserId(Number(uid))
      getUserFavorites(Number(uid)).then((res) => {
        if (res.status === "success") {
          setTotalPosts(res.total) // <- 👈 total từ backend trả về
          const ids = res.favourites.map((fav: any) => fav.post_id)
          setFavorites(ids)
        }
      })
    }

    if (uname) setUsername(uname)
  }, []) // ✅ đảm bảo chỉ chạy một lần khi component mount  

  const handleLogout = () => {
    Cookies.remove("userId")
    Cookies.remove("fullName")
    setUserId(null)
    setUsername("")
    window.location.reload()
  }

  const getAmenityLabel = (key: string) => {
    const map: Record<string, string> = {
      wifi: "Wifi",
      air_conditioner: "Điều hòa",
      fridge: "Tủ lạnh",
      washing_machine: "Máy giặt",
      parking_lot: "Chỗ để xe",
      security: "An ninh 24/7",
      kitchen: "Nhà bếp",
      private_bathroom: "Nhà vệ sinh riêng",
      furniture: "Nội thất",
      bacony: "Ban công",
      elevator: "Thang máy",
      pet_allowed: "Cho phép thú cưng",
    }
    return map[key]
  }
  const labelToKey: Record<string, string> = {
    "Wifi": "wifi",
    "Điều hòa": "air_conditioner",
    "Tủ lạnh": "fridge",
    "Máy giặt": "washing_machine",
    "Chỗ để xe": "parking_lot",
    "An ninh 24/7": "security",
    "Nhà bếp": "kitchen",
    "Nhà vệ sinh riêng": "private_bathroom",
    "Nội thất": "furniture",
    "Ban công": "bacony",
    "Thang máy": "elevator",
    "Cho phép thú cưng": "pet_allowed",
  }
  const handleSearch = async () => {
    setIsLoading(true)
    setHasSearched(true)
    try {
      const currentType = selectedType !== "all" ? selectedType || undefined : undefined
      const res = await searchPosts({
        district: selectedDistrict || undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
        area_min: areaRange[0],
        area_max: areaRange[1],
        type: currentType,
      })
      if (res.status === "success") {
        console.log("Số lượng từ API:", res.posts.length)
        const enrichedPosts = await Promise.all(
          res.posts.map(async (post: any) => {
            const convenienceRes = await fetch(`http://localhost:8000/get-post-convenience/${post.id}`)
            const convenienceData = await convenienceRes.json()
            const convenience = convenienceData.convenience || {}

            const isMatch = selectedAmenities.every(key => convenience[key] === true)
            if (!isMatch) return null

            // Lấy ảnh từ API
            const imageRes = await fetch(`http://localhost:8000/get-post-images/${post.id}`)
            const imageData = await imageRes.json()
            let imageUrl = "/placeholder.svg"
            if (imageData.status === "success" && imageData.images && imageData.images.length > 0) {
              const firstImage = imageData.images[0]
              if (firstImage.image_url) {
                // Xử lý URL ảnh
                if (firstImage.image_url.startsWith('http')) {
                  // URL từ trang web khác
                  imageUrl = firstImage.image_url
                } else if (firstImage.image_url.startsWith('/uploads')) {
                  // URL từ web của chúng ta
                  imageUrl = `http://localhost:3000${firstImage.image_url}`
                } else {
                  // URL không hợp lệ, sử dụng placeholder
                  imageUrl = "/placeholder.svg"
                }
              }
            }

            const amenities: string[] = []
            if (convenience.wifi) amenities.push("Wi-Fi")
            if (convenience.air_conditioner) amenities.push("Điều hòa")
            if (convenience.fridge) amenities.push("Tủ lạnh")
            if (convenience.washing_machine) amenities.push("Máy giặt")
            if (convenience.parking_lot) amenities.push("Chỗ để xe")
            if (convenience.security) amenities.push("An ninh 24/7")
            if (convenience.kitchen) amenities.push("Nhà bếp")
            if (convenience.private_bathroom) amenities.push("Nhà vệ sinh riêng")
            if (convenience.furniture) amenities.push("Nội thất")
            if (convenience.bacony) amenities.push("Ban công")
            if (convenience.elevator) amenities.push("Thang máy")
            if (convenience.pet_allowed) amenities.push("Cho phép thú cưng")

            return {
              ...post,
              image: imageUrl,
              amenities,
              isFavorite: false,
              status: post.status || "Còn trống",
              publishedDate: new Date(post.post_date).toLocaleDateString("vi-VN"),
              address: {
                district: post.district,
                city: post.province,
              },
            }
          })
        )

        setSearchResults(enrichedPosts.filter(Boolean)) // Lọc bỏ null
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err)
    }
    setIsLoading(false)
  }


  const toggleFavorite = async (id: number) => {
    if (!userId) {
      alert("Vui lòng đăng nhập để sử dụng tính năng yêu thích.")
      return
    }

    if (favorites.includes(id)) {
      await removeFavorite(userId, id)
      setFavorites((prev) => prev.filter((fid) => fid !== id))
      setActiveNotification({
        id,
        type: "error",
        message: "Đã xóa khỏi danh sách yêu thích",
      })
    } else {
      await addToFavorites(userId, id)
      setFavorites((prev) => [...prev, id])
      setActiveNotification({
        id,
        type: "success",
        message: "Đã thêm vào danh sách yêu thích",
      })
    }

    setTimeout(() => setActiveNotification(null), 3000)

    setSearchResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    )
  }

  const saveCurrentSearch = () => {
    const searchTerm = "Phòng trọ quận 1"
    setSavedSearches((prev) => [...prev, searchTerm])
    alert(`Đã lưu tìm kiếm: ${searchTerm}`)
  }

  const handleSort = (value: string) => {
    setCurrentSort(value)
    setIsLoading(true)

    // Giả lập sắp xếp
    setTimeout(() => {
      const sortedResults = [...searchResults]
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
          sortedResults.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
          break
      }
      setSearchResults(sortedResults)
      setIsLoading(false)
    }, 500)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price)
  }
  const totalPages = Math.ceil(totalPosts / postsPerPage) // 👈 Thêm dòng này ở đây

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 container py-6">
        <div className="flex flex-col space-y-6">
          {/* Thanh tìm kiếm */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập địa điểm, khu vực..."
                    className="pl-10"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  />
                </div>
              </div>
              <Select defaultValue="all" onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại hình</SelectItem>
                  <SelectItem value="Phòng trọ">Phòng trọ</SelectItem>
                  <SelectItem value="Căn hộ">Căn hộ</SelectItem>
                  <SelectItem value="Nhà nguyên căn">Nhà nguyên căn</SelectItem>
                  <SelectItem value="Ở ghép">Ở ghép</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" /> Tìm kiếm
                </Button>
              </div>
            </div>
          </div>

          {/* Kết quả tìm kiếm */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Bộ lọc - Desktop */}
            <div className="hidden lg:block space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Bộ lọc tìm kiếm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <Label className="text-base">Khoảng giá</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) =>
                            setPriceRange([Number(e.target.value), priceRange[1]])
                          }
                          placeholder="Giá từ"
                        />
                        <Input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([priceRange[0], Number(e.target.value)])
                          }
                          placeholder="Giá đến"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{formatPrice(priceRange[0])}đ</span>
                      <span className="text-sm">{formatPrice(priceRange[1])}đ</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Diện tích</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={areaRange[0]}
                        onChange={(e) =>
                          setAreaRange([Number(e.target.value), areaRange[1]])
                        }
                        placeholder="Từ (m²)"
                      />
                      <Input
                        type="number"
                        value={areaRange[1]}
                        onChange={(e) =>
                          setAreaRange([areaRange[0], Number(e.target.value)])
                        }
                        placeholder="Đến (m²)"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Loại hình</Label>
                    <RadioGroup value={selectedType || "Tất cả"} onValueChange={setSelectedType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Tất cả" id="all" />
                        <Label htmlFor="all">Tất cả</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Phòng trọ" id="room" />
                        <Label htmlFor="room">Phòng trọ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Căn hộ" id="apartment" />
                        <Label htmlFor="apartment">Căn hộ</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Nhà nguyên căn" id="house" />
                        <Label htmlFor="house">Nhà nguyên căn</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Ở ghép" id="shared" />
                        <Label htmlFor="shared">Ở ghép</Label>
                      </div>
                    </RadioGroup>

                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Tiện ích</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(labelToKey).map(([label, key]) => (
                        <div key={label} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${label}`}
                            checked={selectedAmenities.includes(key)}
                            onCheckedChange={(checked) =>
                              setSelectedAmenities((prev) =>
                                checked ? [...prev, key] : prev.filter((item) => item !== key)
                              )
                            }
                          />
                          <Label htmlFor={`amenity-${label}`} className="text-sm">
                            {label}
                          </Label>
                        </div>
                      ))}

                    </div>
                  </div>


                </CardContent>

              </Card>
            </div>

            {/* Bộ lọc - Mobile */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                  <SheetDescription>Tùy chỉnh tìm kiếm của bạn</SheetDescription>
                </SheetHeader>
                <div className="space-y-5 py-4">
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

                  <Collapsible className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Loại hình</Label>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-2">
                      <RadioGroup defaultValue="all">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="m-all" />
                          <Label htmlFor="m-all">Tất cả</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="room" id="m-room" />
                          <Label htmlFor="m-room">Phòng trọ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apartment" id="m-apartment" />
                          <Label htmlFor="m-apartment">Căn hộ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="house" id="m-house" />
                          <Label htmlFor="m-house">Nhà nguyên căn</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shared" id="m-shared" />
                          <Label htmlFor="m-shared">Ở ghép</Label>
                        </div>
                      </RadioGroup>
                    </CollapsibleContent>
                  </Collapsible>

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
                        ].map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox id={`m-amenity-${amenity}`} />
                            <Label htmlFor={`m-amenity-${amenity}`} className="text-sm">
                              {amenity}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button className="w-full">Áp dụng bộ lọc</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Kết quả tìm kiếm */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold">Kết quả tìm kiếm</h1>
                  <p className="text-sm text-muted-foreground">
                    Tìm thấy {searchResults.length} kết quả
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
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
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      className="rounded-none rounded-l-md"
                      onClick={() => setViewMode("grid")}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      className="rounded-none rounded-r-md"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant={showMap ? "default" : "outline"}
                    size="sm"
                    className="hidden md:flex"
                    onClick={() => setShowMap(!showMap)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {showMap ? "Ẩn bản đồ" : "Hiện bản đồ"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setMobileFiltersOpen(true)}
                  >
                    <Sliders className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {hasSearched && (
                isLoading ? (
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
                ) : (
                  <>
                    {showMap ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          {searchResults.slice(0, 4).map((item) => (
                            <PostCard
                              key={item.id}
                              item={item}
                              onToggleFavorite={toggleFavorite}
                              activeNotification={activeNotification}
                            />
                          ))}
                        </div>
                        <div className="sticky top-20 h-[calc(100vh-5rem)] bg-muted rounded-lg overflow-hidden">
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">Bản đồ sẽ được hiển thị tại đây</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={
                          viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                            : "space-y-4"
                        }
                      >
                        {searchResults.length === 0 && hasSearched ? (
                          <div className="flex justify-center items-center h-96 w-full col-span-full">
                            <p className="text-2xl font-semibold text-muted-foreground text-center">
                              Không có kết quả phù hợp.
                            </p>
                          </div>
                        ) : (
                          searchResults.map((item) => (
                            <PostCard
                              key={item.id}
                              item={item}
                              onToggleFavorite={toggleFavorite}
                              activeNotification={activeNotification}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
