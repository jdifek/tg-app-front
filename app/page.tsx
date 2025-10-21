import Header from './components/Header'
import Navigation from './components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-md mx-auto relative">
        <Header />
        <Navigation />
      </div>
    </div>
  )
}