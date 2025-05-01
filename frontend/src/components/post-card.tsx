"use client"

import Link from "next/link"
import { MapPin, Heart, Share, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getUserFavorites } from "@/lib/api"
import Cookies from "js-cookie"

interface PostCardProps {
    item: {
        id: number
        title: string
        price: number
        area: number
        address: {
            district: string
            city: string
        }
        image?: string
        status?: string
        amenities: string[]
        isFavorite: boolean
    }
    onToggleFavorite: (id: number) => void
    activeNotification?: {
        id: number
        type: "success" | "error"
        message: string
    } | null
}

export default function PostCard({ item, onToggleFavorite, activeNotification }: PostCardProps) {
    const [isFavorited, setIsFavorited] = useState(false)
    const userId = Cookies.get("userId")

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!userId) return

            try {
                const res = await getUserFavorites(Number(userId))
                if (res.status === "success" && res.favourites) {
                    const isFavorited = res.favourites.some((fav: any) =>
                        (fav.post_id || fav) === item.id
                    )
                    setIsFavorited(isFavorited)
                }
            } catch (error) {
                console.error("Error checking favorite status:", error)
            }
        }

        checkFavoriteStatus()
    }, [userId, item.id])

    const handleToggleFavorite = async () => {
        await onToggleFavorite(item.id)
        setIsFavorited(!isFavorited)
    }

    return (
        <Card className="overflow-hidden group">
            <div className="relative">
                <div className="aspect-video relative overflow-hidden w-full h-[200px]">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                target.parentElement?.classList.add("bg-muted")
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                    {item.status === "Đã cho thuê" && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm">
                                Đã cho thuê
                            </Badge>
                        </div>
                    )}
                </div>
                {activeNotification && activeNotification.id === item.id && (
                    <div className={`mr-2 py-1 px-2 text-xs rounded-md flex items-center ${activeNotification.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}>
                        {activeNotification.message}
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md"
                        onClick={handleToggleFavorite}
                    >
                        <Heart className={`h-4 w-4 ${isFavorited ? "fill-black text-black" : "text-gray-700"}`} />
                    </Button>
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="text-lg font-semibold line-clamp-2 mb-2 min-h-[3rem]">{item.title}</h3>
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
            <CardFooter className="p-4 pt-1 mt-auto">
                <Link href={`/room/${item.id}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/90">
                        Xem chi tiết
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
} 