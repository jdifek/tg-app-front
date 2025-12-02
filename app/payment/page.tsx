"use client";

import { Suspense, useState, useEffect } from "react";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  DollarSign,
  Star,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../http";
import { useUser } from "../context/UserContext";

export enum PaymentMethod {
  CARD_CRYPTO = "card",
  USDT_TRC20 = "usdt",
  PAYPAL = "paypal",
  DONATION = "donation",
  STARS = "stars",
  MANUAL = "MANUAL",
}

export default function PaymentPageWrapper() {
  return (
    <Suspense
      fallback={<div className="text-center text-white p-10">Loading...</div>}
    >
      <PaymentPage />
    </Suspense>
  );
}

function PaymentPage() {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [selectedMethod, setSelectedMethod] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const priceParam = searchParams.get("price");
  const message = searchParams.get("message");
  const totalPrice = priceParam ? parseFloat(priceParam) : 0;
  const shippingParam = searchParams.get("shipping");
  const shippingData = shippingParam ? JSON.parse(shippingParam) : {};

  const mapPaymentMethodToBackend = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CARD_CRYPTO:
        return "CARD_CRYPTO";
      case PaymentMethod.USDT_TRC20:
        return "USDT_TRC20";
      case PaymentMethod.DONATION:
        return "DONATION";
      case PaymentMethod.PAYPAL:
        return "PAYPAL";
      case PaymentMethod.STARS:
        return "STARS";
      case PaymentMethod.MANUAL:
        return "MANUAL";
      default:
        return "MANUAL";
    }
  };

  useEffect(() => {
    if (type === "donation") {
      setOrder({
        id: null,
        total: totalPrice,
        items: [{ name: "Donation", price: totalPrice }],
      });
      setLoading(false);
      return;
    }

    if (id) {
      setOrder({
        id: id,
        total: totalPrice,
        items: [{ name: type, price: totalPrice }],
      });
      setLoading(false);
    }
  }, [id, totalPrice, type]);

  const paymentMethods = [
    {
      id: PaymentMethod.CARD_CRYPTO,
      name: "Card/Crypto",
      description: "Pay with card or cryptocurrency via Tribute",
      icon: CreditCard,
      color: "from-blue-500 to-purple-600",
    },
    {
      id: PaymentMethod.USDT_TRC20,
      name: "USDT (TRC20)",
      description: "Pay with USDT on TRON network",
      icon: DollarSign,
      color: "from-green-500 to-blue-600",
    },
    {
      id: PaymentMethod.PAYPAL,
      name: "PayPal",
      description: "Pay securely with PayPal",
      icon: Smartphone,
      color: "from-blue-600 to-indigo-600",
    },
    {
      id: PaymentMethod.STARS,
      name: "Telegram Stars",
      description: "Pay with Telegram Stars",
      icon: Star,
      color: "from-yellow-500 to-orange-600",
    },
  ];

  const handlePayment = async (methodId: PaymentMethod) => {
    if (type !== "donation" && (!id || !type)) {
      return alert("Invalid order parameters");
    }

    setSelectedMethod(methodId);

    try {
      // ✅ ДЛЯ STARS: просто переходим на страницу оплаты БЕЗ создания заказа
      if (methodId === PaymentMethod.STARS) {
        console.log("🌟 Redirecting to Stars payment page...");
        
        // Формируем URL с параметрами
        const params = new URLSearchParams({
          type: type || "",
          id: id || "",
          price: totalPrice.toString(),
        });

        // Добавляем message если есть
        if (message) {
          params.append("message", message);
        }

        // Добавляем shipping если есть
        if (Object.keys(shippingData).length > 0) {
          params.append("shipping", JSON.stringify(shippingData));
        }

        router.push(`/payment/stars?${params.toString()}`);
        return; // ⚠️ ВАЖНО: выходим здесь, не создаем заказ
      }

      // ✅ ДЛЯ ОСТАЛЬНЫХ МЕТОДОВ: создаем заказ как раньше
      console.log(`💳 Creating order for payment method: ${methodId}`);

      const orderData = {
        userId: user.id,
        telegramId: user.telegramId,
        firstName: user.first_name,
        username: user.username,
        orderType:
          type === "product"
            ? "PRODUCT"
            : type === "bundle"
            ? "BUNDLE"
            : type === "vip"
            ? "VIP"
            : type === "custom_video"
            ? "CUSTOM_VIDEO"
            : type === "video_call"
            ? "VIDEO_CALL"
            : type === "rating"
            ? "RATING"
            : type === "donation"
            ? "DONATION"
            : "PRODUCT",
        items: [
          {
            id: type === "donation" ? "DONATION" : id,
            type,
            quantity: 1,
            price: totalPrice,
          },
        ],
        paymentMethod: mapPaymentMethodToBackend(methodId),
        shipping: shippingData,
        donationMessage: message,
      };

      const response = await apiFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create payment");
      }

      const paymentResult = await response.json();

      if (type === "rating") {
        router.push(
          `/payment/${methodId}?orderId=${paymentResult.id}&price=${totalPrice}&rating=true`
        );
      } else {
        router.push(
          `/payment/${methodId}?orderId=${paymentResult.id}&price=${totalPrice}`
        );
      }
    } catch (error) {
      console.error("Payment creation failed:", error);
      alert("Failed to create payment. Please try again.");
      setSelectedMethod(""); // Сбрасываем состояние
    }
  };

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
    );
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
            <ArrowLeft className="w-6 h-6 text-white" color="white" />
          </button>
          <h1 className="text-xl font-bold text-white">Payment</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Order Summary */}
          {order && (
            <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800 mb-6">
              <h3 className="font-semibold mb-3 text-white">Order Summary</h3>
              <div className="space-y-2 text-white">
                {order.items?.map((item: any, index: number) => (
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
            <h3 className="font-semibold mb-4 text-white">
              Choose Payment Method
            </h3>
            {paymentMethods.map((method) => {
              const Icon = method.icon;
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
                      <h4 className="font-semibold text-white">
                        {method.name}
                      </h4>
                      <p className="text-white text-opacity-80 text-sm">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="mt-3 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <p className="text-white text-sm mt-1">Processing...</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}