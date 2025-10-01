'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Home, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [method, setMethod] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setOrderId(params.get('orderId'))
    setMethod(params.get('method'))

    // Тут можно отправить уведомление админу
    console.log('Order completed:', {
      orderId: params.get('orderId'),
      method: params.get('method'),
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-400">
            Your order has been processed successfully.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">
              Order ID: {orderId}
            </p>
          )}
        </div>

        <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-8">
          <h3 className="font-semibold mb-3 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            What's Next?
          </h3>
          <p className="text-gray-300 text-sm">
            Your content will be delivered to your bot chat within a few minutes. 
            You'll receive a notification once it's ready.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          
          <button
            onClick={() => window.Telegram?.WebApp?.close()}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Open Bot Chat</span>
          </button>
        </div>
      </div>
    </div>
  )
}
