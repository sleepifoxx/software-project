"use client"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { getUserInfo, updateUserInfo } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, User, MapPin, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cookies } from "next/headers"

type UserInfo = {
  id: number
  email: string
  full_name: string
  contact_number: string
  address: string
  gender: string
  birthday: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    address: "",
    gender: "",
    birthday: "",
    password: "", // Add password field
  })

  // Hàm tải thông tin người dùng
  const loadUserInfo = async () => {
    const userId = Number(Cookies.get("userId"))

    if (!userId) {
      setError("Vui lòng đăng nhập lại")
      setUser(null)
      return false
    }

    try {
      const response = await getUserInfo(userId)
      if (response.status === "success") {
        const userInfo: UserInfo = response.user

        // Lưu vào cookie để đồng bộ
        Cookies.set("userId", userInfo.id.toString(), { expires: 7 })
        Cookies.set("email", userInfo.email, { expires: 7 })

        setUser(userInfo)
        setFormData({
          full_name: userInfo.full_name || "",
          email: userInfo.email || "",
          contact_number: userInfo.contact_number || "",
          address: userInfo.address || "",
          gender: userInfo.gender || "",
          birthday: userInfo.birthday || "",
          password: "", // Reset password field
        })
        setError("")
        return true
      } else {
        throw new Error(response.message || "Không thể tải thông tin người dùng")
      }
    } catch (err) {
      console.error("Lỗi tải thông tin:", err)
      setError("Không thể tải thông tin người dùng")
      return false
    }
  }

  // Tải thông tin khi component mount
  useEffect(() => {
    loadUserInfo()
  }, [])

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Xử lý select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Xử lý lưu thông tin
  const handleSave = async () => {
    if (!user) return

    // Kiểm tra mật khẩu
    if (!formData.password.trim()) {
      setError("Vui lòng nhập mật khẩu để xác nhận thay đổi")
      return
    }

    try {
      const response = await updateUserInfo(user.id, {
        password: formData.password, // Include password for verification
        full_name: formData.full_name.trim(),
        contact_number: formData.contact_number.trim(),
        address: formData.address.trim(),
        gender: formData.gender,
        birthday: formData.birthday,
      })

      if (response.status === "success") {
        // Tải lại dữ liệu
        await loadUserInfo()
        setIsEditing(false)
        // Reset password field
        setFormData(prev => ({ ...prev, password: "" }))
      } else {
        setError(response.message || "Cập nhật thông tin thất bại")
      }
    } catch (err) {
      console.error("Lỗi cập nhật thông tin:", err)
      setError("Cập nhật thông tin thất bại")
    }
  }

  const handleCancel = () => {
    if (!user) return
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      contact_number: user.contact_number || "",
      address: user.address || "",
      gender: user.gender || "",
      birthday: user.birthday || "",
      password: "", // Reset password field
    })
    setIsEditing(false)
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          {error}.{" "}
          <Link href="/login" className="underline text-blue-500">
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (không thể thay đổi)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    className="pl-10 bg-muted"
                    readOnly
                  />
                </div>
              </div>

              {/* Password field for verification */}
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu (để xác nhận thay đổi)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-3"
                    placeholder="Nhập mật khẩu để xác nhận"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="0912345678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="123 Đường ABC, Quận XYZ"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Ngày sinh</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birthday"
                    name="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="w-1/2">
                  Lưu
                </Button>
                <Button variant="outline" onClick={handleCancel} className="w-1/2">
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>
                  <strong>Họ và tên:</strong>{" "}
                  {user.full_name || "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>
                  <strong>Email:</strong> {user.email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>
                  <strong>Số điện thoại:</strong>{" "}
                  {user.contact_number || "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  <strong>Địa chỉ:</strong>{" "}
                  {user.address || "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>
                  <strong>Giới tính:</strong>{" "}
                  {user.gender === "male" ? "Nam" :
                    user.gender === "female" ? "Nữ" :
                      user.gender === "other" ? "Khác" : "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>
                  <strong>Ngày sinh:</strong>{" "}
                  {user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : "Chưa cập nhật"}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <Link href="/">
              <Button variant="outline" className="w-full flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại trang chủ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}