"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingBag, Heart, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../http";

export default function AdminPage() {
  const router = useRouter();

  const sections = [
    {
      id: "products",
      name: "Products",
      icon: ShoppingBag,
      color: "from-blue-500 to-purple-600",
      path: "/admin/products",
    },
    {
      id: "bundles",
      name: "Bundles",
      icon: Package,
      color: "from-purple-500 to-pink-600",
      path: "/admin/bundles",
    },
    {
      id: "wishlist",
      name: "Wishlist",
      icon: Heart,
      color: "from-pink-500 to-red-600",
      path: "/admin/wishlist",
    },
    {
      id: "orders",
      name: "Orders",
      icon: ShoppingCart,
      color: "from-green-500 to-blue-600",
      path: "/admin/orders",
    },
  ];

  // ✅ State для платежей
  const [usdt, setUsdt] = useState("");
  const [paypal, setPaypal] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      const res = await apiFetch("/api/orders/payments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsdt(data.payments.USDT)
        setPaypal(data.payments.PayPal)
      } else {
        setMessage(`Error: ${data.error || "Failed to get"}`);
      }
      console.log(data, data);
      
    }
    fetchPayments()
  }, []);
  const handleSavePayments = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await apiFetch("/api/admin/change-payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usdt, paypal }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Payments updated successfully ✅");
      } else {
        setMessage(`Error: ${data.error || "Failed to update"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Network error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage your shop content and orders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
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
                    <h3 className="text-xl font-bold text-white">
                      {section.name}
                    </h3>
                    <p className="text-white text-opacity-80 text-sm">
                      Manage {section.name.toLowerCase()}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ✅ Форма для платежей */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Payment Settings
          </h2>
          <div className="mb-4">
            <label className="block text-white mb-1">USDT Wallet</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={usdt}
              onChange={(e) => setUsdt(e.target.value)}
              placeholder="Enter USDT wallet"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1">PayPal</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white"
              value={paypal}
              onChange={(e) => setPaypal(e.target.value)}
              placeholder="Enter PayPal ID"
            />
          </div>
          <button
            onClick={handleSavePayments}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Payments"}
          </button>
          {message && <p className="mt-2 text-white">{message}</p>}
        </div>
      </div>
    </div>
  );
}
