"use client"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, User } from "lucide-react"
import Link from "next/link"

type UserInfo = {
  username: string
  firstName: string
  lastName: string
  phone: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })

  // Hàm tải thông tin người dùng
  const loadUserInfo = async () => {
    const username = Cookies.get("username")
    const firstName = Cookies.get("firstName")
    const lastName = Cookies.get("lastName")
    const phone = Cookies.get("phone")

    console.log("Cookie values:", { username, firstName, lastName, phone })

    if (!username) {
      setError("Vui lòng đăng nhập lại")
      setUser(null)
      return false
    }

    // Ưu tiên dùng cookie nếu đầy đủ
    if (firstName && lastName && phone) {
      const userInfo: UserInfo = {
        username,
        firstName,
        lastName,
        phone,
      }
      setUser(userInfo)
      setFormData({ firstName, lastName, phone })
      setError("")
      console.log("Dùng dữ liệu từ cookie:", userInfo)
      return true
    }

    // Nếu thiếu cookie, gọi API
    try {
      const response = await axios.get("http://localhost:8000/user", {
        params: { email: username },
      })
      console.log("API /user response:", response.data)

      const userInfo: UserInfo = {
        username,
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phone: response.data.phone || "",
      }
      // Lưu vào cookie để đồng bộ
      Cookies.set("firstName", userInfo.firstName, { expires: 7 })
      Cookies.set("lastName", userInfo.lastName, { expires: 7 })
      Cookies.set("phone", userInfo.phone, { expires: 7 })

      setUser(userInfo)
      setFormData({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phone: userInfo.phone,
      })
      setError("")
      return true
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

  // Xử lý lưu thông tin
  const handleSave = async () => {
    if (!user) return

    // Lưu vào cookie
    Cookies.set("firstName", formData.firstName.trim(), { expires: 7 })
    Cookies.set("lastName", formData.lastName.trim(), { expires: 7 })
    Cookies.set("phone", formData.phone.trim(), { expires: 7 })

    // Cập nhật backend
    try {
      await axios.put("http://localhost:8000/update-profile", {
        email: user.username,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      })
      console.log("Cập nhật backend thành công")
    } catch (err) {
      console.error("Lỗi cập nhật backend:", err)
      setError("Cập nhật backend thất bại, nhưng cookie đã lưu")
    }

    // Tải lại dữ liệu
    await loadUserInfo()
    setIsEditing(false)
  }

  // Xử lý hủy chỉnh sửa
  const handleCancel = () => {
    if (!user) return
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
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
                <Label htmlFor="firstName">Họ</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Nguyễn"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Tên</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Văn A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="0912345678"
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
                  <strong>Họ:</strong>{" "}
                  {user.firstName.trim() || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span>
                  <strong>Tên:</strong>{" "}
                  {user.lastName.trim() || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>
                  <strong>Số điện thoại:</strong>{" "}
                  {user.phone.trim() || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>
                  <strong>Email:</strong> {user.username}
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
        </CardContent>
      </Card>
    </div>
  )
}