"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { apiFetch } from "@/app/http";
import { toast } from "react-hot-toast";
import { useState, useEffect, Suspense } from "react";

export const dynamic = "force-dynamic"; 

function StarsPayPageContent() {
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
      console.log("Создаём счёт на Stars...", starsPrice);
  
      const res = await apiFetch("/api/orders/stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Оплата заказа",
          description: `Покупка за ${starsPrice} Stars`,
          amount: starsPrice,
        }),
      });
  
      console.log("Ответ от API:", res);
  
      const data = await res.json();
      console.log("Данные счёта:", data);
  
      if (!data.invoice_url) {
        toast.error("Не удалось создать счёт");
        console.error("invoice_url отсутствует в ответе API");
        return;
      }
      const tg = window.Telegram?.WebApp;

      if (!tg) {
        toast.error("Telegram WebApp недоступен");
        console.error("window.Telegram.WebApp не найден");
        return;
      }
  
      const invoiceId = data.invoice_url.split("/").pop();
      console.log("Извлечён invoiceId:", invoiceId);
  
      if (!invoiceId) {
        toast.error("Некорректная ссылка на счёт");
        console.error("Не удалось извлечь invoiceId из invoice_url");
        return;
      }
  
      console.log("Открываем оплату через Telegram WebApp...");
      tg.openInvoice?.(invoiceId, async (status: string) => {
        console.log("Статус оплаты:", status);
  
        if (status === "paid") {
          toast.success("Оплата прошла успешно ⭐");
  
          const orderId = searchParams.get("orderId");
          if (!orderId) return;
  
          console.log("Подтверждаем оплату на сервере для orderId:", orderId);
          const confirmRes = await apiFetch(`/api/orders/${orderId}/payment-status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "CONFIRMED" }),
          });
  
          console.log("Ответ на подтверждение оплаты:", confirmRes);
          if (!confirmRes.ok) throw new Error("Ошибка при подтверждении");
          router.push("/");
        } else if (status === "cancelled") {
          toast("Платёж отменён ❌");
        } else if (status === "failed") {
          toast.error("Ошибка при оплате");
        }
      });
    } catch (err) {
      console.error("Ошибка в handleTelegramPay:", err);
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

        {/* Pay Button */}
        <button
          onClick={handleTelegramPay}
          className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3 font-semibold text-white transition"
        >
          Оплатить Stars ⭐
        </button>
      </div>
    </div>
  );
}

export default function StarsPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    }>
      <StarsPayPageContent />
    </Suspense>
  );
}