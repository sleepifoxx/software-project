import RentalWebsite from '@/components/rental_website'
import Header from '@/components/header'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <RentalWebsite />
      </main>
    </div>
  )
}