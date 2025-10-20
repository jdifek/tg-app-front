"use client";
import { ArrowLeft, Crown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { apiFetch } from "../http";

export default function VIPPage() {
  const router = useRouter();
  const { user } = useUser();

  const features = [
    "Exclusive daily content",
    "Behind the scenes photos and videos",
    "Priority DM responses",
    "Early access to new releases",
    "Special discounts on bundles",
    "Monthly exclusive livestreams",
  ];

  const plans = [
    { id: "monthly", name: "Monthly VIP", price: 49.99, period: "/month" },
    {
      id: "quarterly",
      name: "3 Months VIP",
      price: 129.99,
      period: "/3 months",
      discount: "Save 13%",
    },
    {
      id: "yearly",
      name: "Yearly VIP",
      price: 449.99,
      period: "/year",
      discount: "Save 25%",
    },
  ];

  const handleSubscribe = async (planId: any, price: any) => {
    const orderData = {
      userId: user.id, // 👈 пока мок, потом заменишь на реального пользователя
      orderType: "VIP",
      items: [{ type: "VIP", quantity: 1, price: price }],
    };

    const response = await apiFetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create order");
    }
    const order = await response.json();
    router.push(`/payment?orderId=${order.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" color="white" />
          </button>
          <h1 className="text-xl font-bold">Private VIP Channel</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 mb-6 text-center">
            <Crown className="w-12 h-12 text-white mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Become a VIP Member
            </h2>
            <p className="text-white text-opacity-90">
              Get exclusive access to premium content
            </p>
          </div>

          {/* Features */}
          <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-6">
            <h3 className="font-semibold mb-4">What you get:</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Choose your plan:</h3>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{plan.name}</h4>
                    {plan.discount && (
                      <span className="text-sm text-green-400">
                        {plan.discount}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">
                      ${plan.price}
                    </div>
                    <div className="text-sm text-gray-400">{plan.period}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleSubscribe(plan.id, plan.price)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
