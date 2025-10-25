"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ThankYouPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setOrderId(params.get("orderId"));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Order Confirmed</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 bg-opacity-20 rounded-full mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Thank You for Your Order!
              </h2>
              
              {orderId && (
                <p className="text-gray-400 text-sm mb-6">
                  Order ID: <span className="text-purple-400 font-mono">{orderId}</span>
                </p>
              )}
              
              <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 mb-6">
                <p className="text-gray-300 text-lg leading-relaxed">
                  I'll text you soon with payment details
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-4 rounded-xl hover:scale-105 transition-transform"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}