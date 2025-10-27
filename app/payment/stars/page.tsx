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
  const { user } = useUser();

  const searchParams = useSearchParams();
  const [starsPrice, setStarsPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false);

  const priceUSD = searchParams.get("price")
    ? parseFloat(searchParams.get("price")!)
    : 0;

  const USD_TO_STARS = 100;

  useEffect(() => {
    setStarsPrice(Math.round(priceUSD * USD_TO_STARS));

    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        setIsTelegramAvailable(true);
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        console.log("✅ Telegram WebApp initialized");
        console.log("Platform:", window.Telegram.WebApp.platform);
      } else {
        setIsTelegramAvailable(false);
        console.warn("⚠️ Telegram WebApp not found");
      }
    };

    if (typeof window !== "undefined") {
      setTimeout(checkTelegram, 100);
    }
  }, [priceUSD]);

  const handleTelegramPay = async () => {
    if (!isTelegramAvailable) {
      toast.error("Telegram WebApp is not available. Open this in Telegram.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Creating invoice for Stars...", starsPrice);

      const res = await apiFetch("/api/orders/stars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.telegramId,
          title: "Order Payment",
          description: `Purchase for ${starsPrice} Stars`,
          amount: starsPrice,
        }),
      });

      const data = await res.json();

      if (!data.invoice_url && !data.invoice_link) {
        throw new Error("Failed to create invoice");
      }

      console.log("✅ Invoice received:", data);

      const invoiceUrl = data.invoice_url || data.invoice_link;
      let invoiceSlug = null;

      if (invoiceUrl.includes('/invoice/')) {
        invoiceSlug = invoiceUrl.split('/invoice/')[1];
      } else if (invoiceUrl.includes('start=')) {
        invoiceSlug = invoiceUrl.split('start=')[1];
      }

      console.log("Invoice slug:", invoiceSlug);

      if (invoiceSlug && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(invoiceSlug, (status) => {
          console.log("Payment status:", status);

          setIsLoading(false);

          if (status === "paid") {
            toast.success("Payment successful! ✅");
            setTimeout(() => {
              router.push("/success");
            }, 1500);
          } else if (status === "cancelled") {
            toast.error("Payment cancelled");
          } else if (status === "failed") {
            toast.error("Payment failed");
          } else if (status === "pending") {
            toast("Waiting for payment...", { icon: "⏳" });
          }
        });

        toast("Opening payment form...", { icon: "💫" });
      } else {
        console.warn("Failed to extract invoice slug, using fallback link");
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(invoiceUrl);
        } else {
          window.Telegram.WebApp.openLink(invoiceUrl);
        }
        setIsLoading(false);
      }

    } catch (err) {
      console.error("Invoice creation error:", err);
      toast.error("Failed to create invoice");
      setIsLoading(false);
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
        <div className="bg-gray-900 bg-opacity-50 border border-indigo-500 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-indigo-400 mb-3">
            Amount to pay:{" "}
            <span className="text-white">
              {starsPrice} ⭐ (${priceUSD})
            </span>
          </h2>

          <ul className="space-y-2 text-sm">
            <li>💫 Pay via Telegram Stars</li>
            <li>💫 Click the "Pay Stars" button</li>
            <li>💫 Complete payment in the opened form</li>
            <li>💫 After payment, you will return to the app</li>
          </ul>

          <p className="text-yellow-400 font-semibold mt-3 text-sm">
            * Stars will be deducted from your Telegram wallet
          </p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handleTelegramPay}
          disabled={isLoading || !isTelegramAvailable}
          className={`w-full mt-5 rounded-xl py-3 font-semibold text-white transition ${
            isLoading || !isTelegramAvailable
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            "Pay Stars ⭐"
          )}
        </button>

        {/* Additional Info */}
        <div className="mt-5 p-4 bg-gray-800 bg-opacity-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            📌 Important Information:
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Minimum amount: 1 Star</li>
            <li>• Instant payment</li>
            <li>• You will stay in the app after payment</li>
            <li>• Refund available within 48 hours</li>
            <li>• Support: @support_bot</li>
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
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <StarsPayPageContent />
    </Suspense>
  );
}
