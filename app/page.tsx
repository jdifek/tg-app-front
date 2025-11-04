import Header from './components/Header'
import Navigation from './components/Navigation'
import WishList from './components/WishList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-md mx-auto relative">
        <Header />
        <Navigation />
        <WishList />

      </div>
    </div>
  )
}