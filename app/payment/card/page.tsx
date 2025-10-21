"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/app/http";
import { toast } from "react-hot-toast";
import { Suspense } from "react";

export const dynamic = "force-dynamic"; 

function PayPalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const price = searchParams.get("price")
    ? parseFloat(searchParams.get("price")!)
    : 0;

  const handleConfirmPayment = async () => {
    const orderId = searchParams.get("orderId");
    
    if (!orderId) {
      toast.error("Order ID не найден");
      return;
    }

    try {
      const res = await apiFetch(`/api/orders/${orderId}/payment-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "AWAITING_CHECK" }),
      });

      if (!res.ok) throw new Error("Failed to update payment status");

      toast.success("Платёж отправлен на проверку");
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при обновлении статуса платежа");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold">Card</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-5">
        <div className="bg-gray-900 bg-opacity-50 border border-pink-600 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-pink-400 mb-3">
            Сумма платежа: <span className="text-white">{price}$</span>
          </h2>
          <ul>
            <li>🌸 Оплата осуществляется через сервис Tribute</li>
            <li>🌸 Перейдите по ссылке:</li>
            <li className="text-purple-400 font-semibold">
              https://tribute.to/username
            </li>
            <li>🌸 После оплаты прикрепите скриншот и подтвердите платёж</li>
          </ul>

          <p className="text-red-500 font-bold mt-3">
            ❗ За другие комментарии получите БАН ❗
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmPayment}
          className="w-full mt-5 bg-pink-600 hover:bg-pink-700 rounded-xl py-3 font-semibold text-white transition"
        >
          Подтвердить платёж
        </button>
      </div>
    </div>
  );
}

export default function PayPalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    }>
      <PayPalPageContent />
    </Suspense>
  );
}