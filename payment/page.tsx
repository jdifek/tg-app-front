'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, CreditCard, Smartphone, DollarSign, Star } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentPage() {
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    if (orderId) {
      // В реальном приложении здесь будет запрос к API для получения информации о заказе
      setOrder({
        id: orderId,
        total: 29.99,
        items: [{ name: 'Premium Photo Set', price: 29.99 }]
      })
      setLoading(false)
    }
  }, [orderId])

  const paymentMethods = [
    {
      id: 'card',
      name: 'Card/Crypto',
      description: 'Pay with card or cryptocurrency via Tribute',
      icon: CreditCard,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'usdt',
      name: 'USDT (TRC20)',
      description: 'Pay with USDT on TRON network',
      icon: DollarSign,
      color: 'from-green-500 to-blue-600'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay securely with PayPal',
      icon: Smartphone,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'stars',
      name: 'Telegram Stars',
      description: 'Pay with Telegram Stars',
      icon: Star,
      color: 'from-yellow-500 to-orange-600'
    }
  ]

  const handlePayment = (methodId: any) => {
    setSelectedMethod(methodId)
    // В реальном приложении здесь будет логика для обработки оплаты
    console.log(`Processing payment with ${methodId}`)
    
    // Имитация успешной оплаты
    setTimeout(() => {
      router.push(`/success?orderId=${orderId}&method=${methodId}`)
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="max-w-md mx-auto p-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800 rounded-xl" />
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
          <h1 className="text-xl font-bold">Payment</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Order Summary */}
          {order && (
            <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800 mb-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                {order.items?.map((item: any, index: any) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>${item.price}</span>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-purple-400">${order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-semibold mb-4">Choose Payment Method</h3>
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  onClick={() => handlePayment(method.id)}
                  disabled={selectedMethod === method.id}
                  className={`w-full bg-gradient-to-r ${method.color} rounded-xl p-4 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-white">{method.name}</h4>
                      <p className="text-white text-opacity-80 text-sm">{method.description}</p>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="mt-3 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <p className="text-white text-sm mt-1">Processing...</p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}