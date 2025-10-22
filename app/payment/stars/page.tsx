"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { apiFetch } from "@/app/http";
import { toast } from "react-hot-toast";
import { useState, useEffect, Suspense } from "react";
import { useUser } from "@/app/context/UserContext";

export const dynamic = "force-dynamic";

function StarsPayPageContent() {
  const router = useRouter();
  const { user } = useUser(); // берём из контекста пользователя

  const searchParams = useSearchParams();
  const [starsPrice, setStarsPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  // цена в долларах из параметров
  const priceUSD = searchParams.get("price")
    ? parseFloat(searchParams.get("price")!)
    : 0;

  // курс Stars → USD
  const USD_TO_STARS = 100; // 1 USD ≈ 100 Stars

  useEffect(() => {
    setStarsPrice(Math.round(priceUSD * USD_TO_STARS));
    
    // Проверяем доступность Telegram WebApp
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        setIsTelegramAvailable(true);
        window.Telegram.WebApp.ready();
        console.log("✅ Telegram WebApp инициализирован");
      } else {
        setIsTelegramAvailable(false);
        console.warn("⚠️ Telegram WebApp не найден");
      }
    };

    // Даем время на загрузку скрипта
    if (typeof window !== "undefined") {
      setTimeout(checkTelegram, 100);
    }
  }, [priceUSD]);


  const handleTelegramPay = async () => {
    try {
      console.log("Создаём счёт на Stars...", starsPrice);
  
      const res = await apiFetch("/api/orders/stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.telegramId, // <-- обязательно
          title: "Оплата заказа",
          description: `Покупка за ${starsPrice} Stars`,
          amount: starsPrice,
        }),
      });
  
      const data = await res.json();
      if (!data.invoice_url) throw new Error("Не удалось создать счёт");
  
      window.open(data.invoice_url, "_blank"); // просто открываем ссылку
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
          disabled={isLoading}
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
        {/* Статус Telegram WebApp */}
        <div className="mb-4 p-3 bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isTelegramAvailable ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm">
              {isTelegramAvailable
                ? "✅ Telegram WebApp активен"
                : "⚠️ Telegram WebApp недоступен"}
            </span>
          </div>
          {!isTelegramAvailable && (
            <p className="text-xs text-gray-400 mt-2">
              Откройте приложение через Telegram для лучшего опыта
            </p>
          )}
        </div>

        <div className="bg-gray-900 bg-opacity-50 border border-indigo-500 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-indigo-400 mb-3">
            Сумма платежа:{" "}
            <span className="text-white">
              {starsPrice} ⭐ ({priceUSD}$)
            </span>
          </h2>

          <ul className="space-y-2">
            <li>💫 Оплата осуществляется через Telegram Stars</li>
            <li>💫 Нажмите кнопку "Оплатить в Telegram"</li>
            <li>💫 После успешной оплаты подтвердите платёж</li>
          </ul>

          <p className="text-yellow-400 font-semibold mt-3 text-sm">
            * Stars списываются с вашего Telegram Wallet
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleTelegramPay}
          disabled={isLoading}
          className={`w-full mt-5 rounded-xl py-3 font-semibold text-white transition ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Обработка...
            </span>
          ) : (
            "Оплатить Stars ⭐"
          )}
        </button>

        {/* Дополнительная информация */}
        <div className="mt-5 p-4 bg-gray-800 bg-opacity-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            📌 Важная информация:
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Минимальная сумма: 1 Star</li>
            <li>• Оплата мгновенная</li>
            <li>• Возврат возможен в течение 48 часов</li>
            <li>• Поддержка: @support_bot</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function StarsPayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Загрузка...</div>
        </div>
      }
    >
      <StarsPayPageContent />
    </Suspense>
  );
}