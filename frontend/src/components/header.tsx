"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, User, Heart, LogOut, Menu, X } from "lucide-react"
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
        Cookies.remove('userId')
        Cookies.remove('fullName')
        setIsLoggedIn(false)
        setUserName("")
        router.push('/')
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 sm:px-6 flex h-16 items-center justify-between">
                {/* Logo and Site Name */}
                <div className="flex items-center gap-3 font-bold text-xl">
                    <Link href="/" className="flex items-center">
                        <img src="/favicon.ico" alt="Nhatro.vn" className="h-8 w-8 sm:h-10 sm:w-10" />
                        <span className="ml-2 hidden md:inline">Nhatro.vn</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Trang chủ
                    </Link>
                    <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">
                        Tìm phòng
                    </Link>
                    <Link href="/post" className="text-sm font-medium hover:text-primary transition-colors">
                        Đăng tin
                    </Link>
                </nav>

                {/* User Menu or Auth Buttons */}
                <div className="flex items-center">
                    {isLoggedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">Xin chào, {userName}</span>
                                    <span className="sm:hidden">Menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center gap-2 w-full">
                                        <User className="h-4 w-4" />
                                        Tài khoản
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/favorites" className="flex items-center gap-2 w-full">
                                        <Heart className="h-4 w-4" />
                                        Yêu thích
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/my-listings" className="flex items-center gap-2 w-full">
                                        <MapPin className="h-4 w-4" />
                                        Quản lý bài đăng
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                                <Link href="/login">Đăng nhập</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Đăng ký</Link>
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 md:hidden"
                        onClick={toggleMobileMenu}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden p-4 pt-0 bg-background border-b">
                    <nav className="flex flex-col space-y-4">
                        <Link
                            href="/"
                            className="text-sm font-medium py-2 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>
                        <Link
                            href="/search"
                            className="text-sm font-medium py-2 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Tìm phòng
                        </Link>
                        <Link
                            href="/post"
                            className="text-sm font-medium py-2 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Đăng tin
                        </Link>
                        {!isLoggedIn && (
                            <Link
                                href="/login"
                                className="text-sm font-medium py-2 hover:text-primary sm:hidden"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    )
}