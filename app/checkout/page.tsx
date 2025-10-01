'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const [item, setItem] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    const id = params.get('id')

    if (type && id) {
      fetchItem(type, id)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchItem = async (type: string, id: string) => {
    try {
      const endpoint = type === 'product' ? `/api/products/${id}` : `/api/bundles/${id}`
      const response = await fetch(endpoint)
      const data = await response.json()
      setItem(data)
    } catch (error) {
      console.error('Error fetching item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const id = params.get('id')

      const orderData = {
        userId: '123456789', // TODO: заменить на реального пользователя из Telegram WebApp
        items: [{ id, type, quantity: 1 }],
        ...formData
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const order = await response.json()
        router.push(`/payment?orderId=${order.id}`)
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="max-w-md mx-auto p-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
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
          <h1 className="text-xl font-bold">Checkout</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Order Summary */}
          {item && (
            <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800 mb-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="font-bold text-purple-400">${item.price}</span>
              </div>
            </div>
          )}

          {/* Shipping Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>{submitting ? 'Processing...' : 'Continue to Payment'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
