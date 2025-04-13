"use client"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

interface PageTransitionProps {
    children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
    const [isTransitioning, setIsTransitioning] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Track current route for transitions
    useEffect(() => {
        // On mount, we're not transitioning
        setIsTransitioning(false)

        // Function to handle navigation start
        const handleNavigationStart = () => {
            setIsTransitioning(true)
        }

        // Function to handle navigation end
        const handleNavigationEnd = () => {
            setIsTransitioning(false)
        }

        // Handle link clicks for client-side navigation
        const handleLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const link = target.closest('a')

            if (
                link &&
                link.href &&
                link.href.startsWith(window.location.origin) &&
                !link.href.includes('#') &&
                !e.ctrlKey &&
                !e.metaKey &&
                !(link as HTMLAnchorElement).target
            ) {
                setIsTransitioning(true)
            }
        }

        // Add event listeners
        window.addEventListener('beforeunload', handleNavigationStart)
        window.addEventListener('click', handleLinkClick)
        document.addEventListener('navigationStart', handleNavigationStart)
        document.addEventListener('navigationComplete', handleNavigationEnd)

        // Clean up event listeners
        return () => {
            window.removeEventListener('beforeunload', handleNavigationStart)
            window.removeEventListener('click', handleLinkClick)
            document.removeEventListener('navigationStart', handleNavigationStart)
            document.removeEventListener('navigationComplete', handleNavigationEnd)
        }
    }, [])

    // Listen for route changes via Next.js router
    useEffect(() => {
        setIsTransitioning(false)
    }, [pathname, searchParams])

    return (
        <>
            {isTransitioning && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col items-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium">Loading</p>
                    </div>
                </div>
            )}
            {children}
        </>
    )
}
