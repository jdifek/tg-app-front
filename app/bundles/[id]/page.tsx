'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Package, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface BundlePageParams {
  id: string;
}

export default function BundlePage({ params }: { params: BundlePageParams }) {
  const [bundle, setBundle] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchBundle()
  }, [params.id])

  const fetchBundle = async () => {
    try {
      const response = await fetch(`/api/bundles/${params.id}`)
      const data = await response.json()
      setBundle(data)
    } catch (error) {
      console.error('Error fetching bundle:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = () => {
    router.push(`/checkout?type=bundle&id=${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="max-w-md mx-auto p-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-6" />
          <div className="aspect-square bg-gray-800 rounded-xl mb-6" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-800 rounded" />
            <div className="h-4 bg-gray-800 rounded" />
            <div className="h-4 bg-gray-800 rounded w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <p className="text-gray-400">Bundle not found</p>
      </div>
    )
  }

  const content = bundle.content ? JSON.parse(bundle.content) : {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold truncate">{bundle.name}</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Bundle Image */}
          <div className="aspect-square rounded-xl overflow-hidden mb-6">
            <Image
              src={bundle.image || '/api/placeholder/400/400'}
              alt={bundle.name}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bundle Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{bundle.name}</h1>
            <p className="text-3xl font-bold text-purple-400 mb-4">${bundle.price}</p>
            <p className="text-gray-300 mb-4">{bundle.description}</p>
            
            {/* Content Details */}
            {content && Object.keys(content).length > 0 && (
              <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  What's included:
                </h3>
                <div className="space-y-2">
                  {content.photos && (
                    <p className="text-gray-300">📸 {content.photos} Photos</p>
                  )}
                  {content.videos && (
                    <p className="text-gray-300">🎥 {content.videos} Videos</p>
                  )}
                  {content.exclusive && (
                    <p className="text-purple-400">⭐ Exclusive Content</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Info */}
          <div className="bg-blue-900 bg-opacity-20 rounded-xl p-4 border border-blue-800 mb-6">
            <h3 className="font-semibold mb-2 flex items-center text-blue-400">
              <Download className="w-4 h-4 mr-2" />
              Delivery Information
            </h3>
            <p className="text-gray-300 text-sm">
              Digital content will be sent to your bot chat immediately after payment confirmation.
            </p>
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>Buy Bundle</span>
          </button>
        </div>
      </div>
    </div>
  )
}