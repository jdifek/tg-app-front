"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { apiFetch } from "@/app/http";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
export const dynamic = "force-dynamic"; 
export default function StarsPayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [starsPrice, setStarsPrice] = useState<number>(0);

  // цена в долларах из параметров
  const priceUSD = searchParams.get("price")
    ? parseFloat(searchParams.get("price")!)
    : 0;

  // курс Stars → USD
  const USD_TO_STARS = 100; // 1 USD ≈ 100 Stars

  useEffect(() => {
    setStarsPrice(Math.round(priceUSD * USD_TO_STARS));
  }, [priceUSD]);

  const handleTelegramPay = async () => {
    try {
      const res = await apiFetch("/api/orders/stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Оплата заказа",
          description: `Покупка за ${starsPrice} Stars`,
          amount: starsPrice * 100,
        }),
      });
  
      const data = await res.json();
      if (!data.invoice_url) {
        toast.error("Не удалось создать счёт");
        return;
      }
  
      // Проверка существования Telegram WebApp
      if (typeof window.Telegram !== "undefined" && window.Telegram.WebApp) {
        window.Telegram.WebApp.openInvoice?.(data.invoice_url, async (status: string) => {
          if (status === "paid") {
            toast.success("Оплата прошла успешно ⭐");
  
            const orderId = new URLSearchParams(window.location.search).get("orderId");
            if (!orderId) return;
  
            const confirmRes = await apiFetch(`/api/orders/${orderId}/payment-status`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentStatus: "CONFIRMED" }),
            });
  
            if (!confirmRes.ok) throw new Error("Ошибка при подтверждении");
            router.push("/");
          } else if (status === "cancelled") {
            toast("Платёж отменён ❌");
          } else if (status === "failed") {
            toast.error("Ошибка при оплате");
          }
        });
      } else {
        toast.error("Telegram WebApp недоступен");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при создании счёта");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          Stars
          <Star className="w-5 h-5 text-yellow-400" />
        </h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-5">
        <div className="bg-gray-900 bg-opacity-50 border border-indigo-500 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-indigo-400 mb-3">
            Сумма платежа:{" "}
            <span className="text-white">
              {starsPrice} ⭐ ({priceUSD}$)
            </span>
          </h2>

          <ul>
            <li>💫 Оплата осуществляется через Telegram Stars</li>
            <li>💫 Нажмите кнопку "Оплатить в Telegram"</li>
            <li>💫 После успешной оплаты подтвердите платёж ниже</li>
          </ul>

          <p className="text-yellow-400 font-semibold mt-3">
            * Stars списываются с вашего Telegram Wallet
          </p>
        </div>

        {/* Pay & Confirm Buttons */}
        <button
          onClick={() =>
            toast("Здесь будет вызов Telegram.paymentInvoice()", {
              icon: "⭐",
            })
          }
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3 font-semibold text-white transition"
        >
          Оплатить в Telegram
        </button>

        <button
          onClick={handleTelegramPay}
          className="w-full mt-3 bg-purple-600 hover:bg-purple-700 rounded-xl py-3 font-semibold text-white transition"
        >
          Подтвердить платёж
        </button>
      </div>
    </div>
  );
}
