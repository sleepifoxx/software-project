"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  AlertCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  MapPin,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import Cookies from "js-cookie"
import { getPostsByUser } from "@/lib/api"
// Định nghĩa kiểu dữ liệu cho tin đăng
interface Listing {
  id: string
  title: string
  price: number
  address: {
    district: string
    city: string
  }
  type: string
  area: number
  image: string
  status: "active" | "expired" | "pending" | "rejected" | "paused"
  publishedDate: string
  expiryDate: string
  views: number
  contacts: number
  featured: boolean
  remainingDays: number
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentTab, setCurrentTab] = useState("all")

  // Giả lập dữ liệu tin đăng
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const userId = Cookies.get("userId")
  
      if (!userId) {
        setListings([])
        setFilteredListings([])
        setIsLoading(false)
        return
      }
  
      try {
        const res = await getPostsByUser(Number(userId))
        if (res.status === "success") {
          const formattedData: Listing[] = res.posts.map((post: any) => {
            const publishedDate = new Date(post.post_date)
            const expiryDate = new Date(publishedDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            const remainingDays = Math.floor((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  
            return {
              id: String(post.id),
              title: post.title,
              price: post.price,
              address: {
                district: post.district,
                city: post.province,
              },
              type: post.type,
              area: post.area,
              image: `/placeholder.svg?height=200&width=300&text=Phòng+${post.id}`, // bạn có thể thay bằng ảnh thật nếu có
              status: "active", // hoặc cập nhật theo logic cụ thể
              publishedDate: publishedDate.toLocaleDateString("vi-VN"),
              expiryDate: expiryDate.toLocaleDateString("vi-VN"),
              views: post.views || 0,
              contacts: 0, // backend chưa có
              featured: false, // backend chưa có
              remainingDays,
            }
          })
  
          setListings(formattedData)
          setFilteredListings(formattedData)
        } else {
          setListings([])
          setFilteredListings([])
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bài đăng:", error)
        setListings([])
        setFilteredListings([])
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [])
  
  // Lọc tin đăng theo tab và tìm kiếm
  useEffect(() => {
    let filtered = [...listings]

    // Lọc theo tab
    if (currentTab !== "all") {
      filtered = filtered.filter((listing) => listing.status === currentTab)
    }

    // Lọc theo trạng thái nếu có
    if (statusFilter !== "all") {
      filtered = filtered.filter((listing) => listing.status === statusFilter)
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(query) ||
          listing.address.district.toLowerCase().includes(query) ||
          listing.id.toLowerCase().includes(query),
      )
    }

    setFilteredListings(filtered)
  }, [listings, currentTab, statusFilter, searchQuery])

  // Xử lý xóa tin đăng
  const handleDeleteListing = (id: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id))
  }

  // Xử lý gia hạn tin đăng
  const handleRenewListing = (id: string) => {
    setListings((prev) =>
      prev.map((listing) => {
        if (listing.id === id) {
          const newExpiryDate = new Date()
          newExpiryDate.setDate(newExpiryDate.getDate() + 30)
          return {
            ...listing,
            status: "active" as const,
            expiryDate: newExpiryDate.toLocaleDateString("vi-VN"),
            remainingDays: 30,
          }
        }
        return listing
      }),
    )
  }

  // Xử lý tạm dừng/tiếp tục tin đăng
  const handleTogglePauseListing = (id: string) => {
    setListings((prev) =>
      prev.map((listing) => {
        if (listing.id === id) {
          return {
            ...listing,
            status: listing.status === "paused" ? "active" : "paused",
          } as Listing
        }
        return listing
      }),
    )
  }

  // Hiển thị trạng thái tin đăng
  const renderStatus = (status: Listing["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Đang hiển thị
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Đã hết hạn
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Đang chờ duyệt
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Bị từ chối
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            <PauseCircle className="h-3.5 w-3.5 mr-1" />
            Tạm dừng
          </Badge>
        )
      default:
        return null
    }
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
            <Link href="/my-listings" className="text-sm font-medium text-primary">
              Quản lý tin
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
              Nguyễn Văn A
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <div className="flex flex-col space-y-6">
          {/* Tiêu đề trang và thống kê */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Quản lý tin đăng</h1>
              <p className="text-muted-foreground">Quản lý tất cả các tin đăng của bạn</p>
            </div>
            <Button asChild>
              <Link href="/post-listing">
                <Plus className="h-4 w-4 mr-2" />
                Đăng tin mới
              </Link>
            </Button>
          </div>

          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Tổng số tin đăng</p>
                  <p className="text-2xl font-bold">{listings.length}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+2</span> so với tháng trước
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Tin đang hiển thị</p>
                  <p className="text-2xl font-bold">
                    {listings.filter((listing) => listing.status === "active").length}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">70%</span> tổng số tin
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Tổng lượt xem</p>
                  <p className="text-2xl font-bold">{listings.reduce((total, listing) => total + listing.views, 0)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+15%</span> so với tháng trước
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Tổng lượt liên hệ</p>
                  <p className="text-2xl font-bold">
                    {listings.reduce((total, listing) => total + listing.contacts, 0)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+8%</span> so với tháng trước
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs và bộ lọc */}
          <div className="space-y-4">
          <Tabs defaultValue="all" onValueChange={setCurrentTab}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="active">Đang hiển thị</TabsTrigger>
                  <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                  <TabsTrigger value="expired">Hết hạn</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm tin đăng..."
                      className="pl-10 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Lọc theo trạng thái</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setStatusFilter("all")}>Tất cả</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("active")}>Đang hiển thị</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Chờ duyệt</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("expired")}>Hết hạn</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Bị từ chối</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("paused")}>Tạm dừng</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <TabsContent value="all" className="mt-6">
                {renderListingsTable()}
              </TabsContent>
              <TabsContent value="active" className="mt-6">
                {renderListingsTable()}
              </TabsContent>
              <TabsContent value="pending" className="mt-6">
                {renderListingsTable()}
              </TabsContent>
              <TabsContent value="expired" className="mt-6">
                {renderListingsTable()}
              </TabsContent>
            </Tabs>
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

  // Hàm render bảng tin đăng
  function renderListingsTable() {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      )
    }

    if (filteredListings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted rounded-full p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Không có tin đăng nào</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {searchQuery
              ? "Không tìm thấy tin đăng phù hợp với từ khóa tìm kiếm."
              : "Bạn chưa có tin đăng nào trong mục này."}
          </p>
          <Button asChild>
            <Link href="/post-listing">
              <Plus className="h-4 w-4 mr-2" />
              Đăng tin mới
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Tin đăng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày đăng</TableHead>
                <TableHead>Ngày hết hạn</TableHead>
                <TableHead className="text-right">Lượt xem</TableHead>
                <TableHead className="text-right">Liên hệ</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md">
                        <Image
                          src={listing.image || "/placeholder.svg"}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium line-clamp-1">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {listing.price.toLocaleString()}đ/tháng · {listing.area}m²
                        </div>
                      </div>
                      {listing.featured && (
                        <Badge variant="secondary" className="ml-2">
                          Nổi bật
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{renderStatus(listing.status)}</TableCell>
                  <TableCell>{listing.publishedDate}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{listing.expiryDate}</span>
                      {listing.status === "active" && (
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={Math.max(0, (listing.remainingDays / 30) * 100)} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">
                            {listing.remainingDays > 0 ? `Còn ${listing.remainingDays} ngày` : "Hết hạn"}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{listing.views}</TableCell>
                  <TableCell className="text-right">{listing.contacts}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/room/${listing.id}`} className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/edit-listing/${listing.id}`} className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </Link>
                        </DropdownMenuItem>
                        {(listing.status === "expired" || listing.remainingDays < 5) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Gia hạn
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Gia hạn tin đăng</DialogTitle>
                                <DialogDescription>Chọn thời gian gia hạn cho tin đăng của bạn.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Select defaultValue="30">
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="7">7 ngày (70.000đ)</SelectItem>
                                      <SelectItem value="15">15 ngày (130.000đ)</SelectItem>
                                      <SelectItem value="30">30 ngày (250.000đ)</SelectItem>
                                      <SelectItem value="90">90 ngày (700.000đ)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="rounded-md bg-muted p-4">
                                  <div className="flex justify-between text-sm">
                                    <span>Phí gia hạn:</span>
                                    <span className="font-medium">250.000đ</span>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => handleRenewListing(listing.id)}>
                                  Gia hạn
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        <DropdownMenuItem onClick={() => handleTogglePauseListing(listing.id)}>
                          {listing.status === "paused" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Tiếp tục hiển thị
                            </>
                          ) : (
                            <>
                              <PauseCircle className="h-4 w-4 mr-2" />
                              Tạm dừng
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa tin
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Tin đăng sẽ bị xóa vĩnh viễn khỏi hệ thống.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600" onClick={() => handleDeleteListing(listing.id)}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị <span className="font-medium">{filteredListings.length}</span> trong tổng số{" "}
            <span className="font-medium">{listings.length}</span> tin đăng
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Trước
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Sau
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
