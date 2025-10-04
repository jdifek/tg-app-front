'use client'
import { useState } from 'react'
import { Package, ShoppingBag, Heart, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  const sections = [
    {
      id: 'products',
      name: 'Products',
      icon: ShoppingBag,
      color: 'from-blue-500 to-purple-600',
      path: '/admin/products'
    },
    {
      id: 'bundles',
      name: 'Bundles',
      icon: Package,
      color: 'from-purple-500 to-pink-600',
      path: '/admin/bundles'
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      icon: Heart,
      color: 'from-pink-500 to-red-600',
      path: '/admin/wishlist'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: ShoppingCart,
      color: 'from-green-500 to-blue-600',
      path: '/admin/orders'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage your shop content and orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => router.push(section.path)}
                className={`bg-gradient-to-r ${section.color} rounded-xl p-6 hover:scale-105 transition-transform`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">{section.name}</h3>
                    <p className="text-white text-opacity-80 text-sm">
                      Manage {section.name.toLowerCase()}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
