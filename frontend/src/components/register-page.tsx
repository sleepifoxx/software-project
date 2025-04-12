"use client"
import Cookies from "js-cookie"
import type React from "react"
import { signup } from "@/lib/api" 
import { useState } from "react"
import { Eye, EyeOff, Facebook, Lock, Mail, MapPin, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordMessage, setPasswordMessage] = useState("")

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    let message = ""

    if (password.length === 0) {
      setPasswordStrength(0)
      setPasswordMessage("")
      return
    }

    // Kiểm tra độ dài
    if (password.length >= 8) strength += 25

    // Kiểm tra chữ thường
    if (password.match(/[a-z]/)) strength += 25

    // Kiểm tra chữ hoa
    if (password.match(/[A-Z]/)) strength += 25

    // Kiểm tra số và ký tự đặc biệt
    if (password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/)) strength += 25

    // Thiết lập thông báo dựa trên độ mạnh
    if (strength <= 25) {
      message = "Yếu"
    } else if (strength <= 50) {
      message = "Trung bình"
    } else if (strength <= 75) {
      message = "Khá"
    } else {
      message = "Mạnh"
    }

    setPasswordStrength(strength)
    setPasswordMessage(message)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    checkPasswordStrength(newPassword)
  }

  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
  
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      setIsLoading(false)
      return
    }
  
    try {
      const res = await signup(email, password)
        if (res.status === "success") {
            Cookies.set("username", email) // ✅ Lưu bằng cookie
            Cookies.set("firstName", firstName)
            Cookies.set("lastName", lastName)
            Cookies.set("phone", phone)
            window.location.href = "/login"
      } else {
        setError(res.message || "Đăng ký thất bại")
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("Lỗi kết nối máy chủ")
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            <span>NhàTrọ</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Đăng ký tài khoản</CardTitle>
            <CardDescription className="text-center">Nhập thông tin của bạn để tạo tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="firstName" placeholder="Nguyễn" className="pl-10" required disabled={isLoading} value={firstName}
        onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input id="lastName" placeholder="Văn A" required disabled={isLoading} value={lastName}
      onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
  id="email"
  type="email"
  placeholder="example@gmail.com"
  className="pl-10"
  required
  disabled={isLoading}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" type="tel" placeholder="0912345678" required disabled={isLoading} value={phone}
    onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                  </Button>
                </div>
                {password && (
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between text-xs">
                      <span>Độ mạnh mật khẩu:</span>
                      <span
                        className={
                          passwordStrength <= 25
                            ? "text-red-500"
                            : passwordStrength <= 50
                              ? "text-orange-500"
                              : passwordStrength <= 75
                                ? "text-yellow-500"
                                : "text-green-500"
                        }
                      >
                        {passwordMessage}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-1" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
  id="confirmPassword"
  type={showPassword ? "text" : "password"}
  placeholder="••••••••"
  className="pl-10"
  required
  disabled={isLoading}
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
/>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đăng ký"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>
          </CardFooter>
        </Card>
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
