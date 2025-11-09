'use client'
import { ShoppingBag, Package, Crown, Video, Phone, Heart, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '../context/UserContext'

export default function Navigation() {
  const router = useRouter()
  const { user } = useUser()

  const ADMIN_IDS = ['6970790362', '5505526221', '5969166369']

  const menuItems = [
    { icon: ShoppingBag, label: 'Shop', href: '/shop', gradient: 'from-blue-500 to-purple-600' },
    { icon: Package, label: 'Bundles', href: '/bundles', gradient: 'from-purple-500 to-pink-600' },
    { icon: Crown, label: 'Private VIP Channel', href: '/vip', gradient: 'from-yellow-500 to-orange-600' },
    { icon: Video, label: 'Custom Video', href: '/custom-video', gradient: 'from-red-500 to-pink-600' },
    { icon: Phone, label: 'Video Call', href: '/video-call', gradient: 'from-green-500 to-blue-600' },
    { icon: Heart, label: 'Dick Rating', href: '/rating', gradient: 'from-pink-500 to-red-600' },
  ]

  // 👉 Добавляем кнопку "Admin" только для админов
  if (user && ADMIN_IDS.includes(String(user.telegramId))) {
    menuItems.push({
      icon: Shield,
      label: 'Admin Panel',
      href: '/admin',
      gradient: 'from-gray-600 to-gray-800',
    })
  }

  return (
    <div className="px-4 space-y-3">
      {menuItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className={`w-full bg-gradient-to-r ${item.gradient} rounded-xl p-4 flex items-center space-x-3 hover:scale-105 transition-transform shadow-lg`}
          >
            <div className="bg-white/20 rounded-lg p-2">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-medium">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
