"use client"

import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
    return (
        <footer className="bg-muted">
            <div className="container px-4 sm:px-6 py-8 md:py-12">
                <div className="text-center text-xs sm:text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Nhatro.vn. Tất cả quyền được bảo lưu.
                </div>
            </div>
        </footer>
    )
}