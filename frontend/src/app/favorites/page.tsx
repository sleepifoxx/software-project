import FavoritesPage from '@/components/favorites-page'
import Header from '@/components/header'

export default function Favorites() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <FavoritesPage />
      </main>
    </div>
  )
}
