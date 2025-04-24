import SearchPage from '@/components/search-page'
import Header from '@/components/header'

export default function Search() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <SearchPage />
            </main>
        </div>
    )
} 