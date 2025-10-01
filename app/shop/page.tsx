'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProductPageParams {
  id: string;
}

export default function ProductPage({ params }: { params: ProductPageParams }) {
  const [product, setProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = () => {
    router.push(`/checkout?type=product&id=${params.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="max-w-md mx-auto p-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-6" />
          <div className="aspect-square bg-gray-800 rounded-xl mb-6" />
          <div className="h-6 bg-gray-800 rounded mb-4" />
          <div className="h-4 bg-gray-800 rounded mb-2" />
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-4" />
          <div className="h-12 bg-gray-800 rounded" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <p className="text-gray-400">Product not found</p>
      </div>
    )
  }

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
          <h1 className="text-lg font-semibold truncate">{product.name}</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Product Image */}
          <div className="aspect-square rounded-xl overflow-hidden mb-6">
            <Image
              src={product.image || '/api/placeholder/400/400'}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-3xl font-bold text-purple-400 mb-4">${product.price}</p>
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
          </div>

          {/* Buy Button */}
          <button
            onClick={handleBuy}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}