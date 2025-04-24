"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, User, Heart, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userName, setUserName] = useState("")
    const router = useRouter()

    useEffect(() => {
        const checkLoginStatus = () => {
            const userId = Cookies.get('userId')
            const name = Cookies.get('fullName')
            setIsLoggedIn(!!userId)
            setUserName(name || "")
        }
        checkLoginStatus()
    }, [])

    const handleLogout = () => {
        Cookies.remove('token')
        Cookies.remove('fullName')
        setIsLoggedIn(false)
        setUserName("")
        router.push('/')
    }

    return (
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
                    <Link href="/post" className="text-sm font-medium hover:text-primary">
                        Đăng tin
                    </Link>
                    <Link href="#" className="text-sm font-medium hover:text-primary">
                        Tin tức
                    </Link>
                    <Link href="#" className="text-sm font-medium hover:text-primary">
                        Liên hệ
                    </Link>
                </nav>
                {isLoggedIn ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Xin chào, {userName}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Tài khoản
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/favorites" className="flex items-center gap-2">
                                    <Heart className="h-4 w-4" />
                                    Yêu thích
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="hidden md:flex" asChild>
                            <Link href="/login">Đăng nhập</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/register">Đăng ký</Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    )
} 