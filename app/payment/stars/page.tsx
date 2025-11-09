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
  const [orderId, setOrderId] = useState<string | null>(null);
  const type = searchParams.get("type"); // "product" или "bundle"

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

  // Check payment status periodically after invoice is opened
  useEffect(() => {
    if (!orderId) {
      console.log("⚠️ No orderId, skipping payment check");
      return;
    }

    console.log("🔍 Starting payment check for order:", orderId);
    let isActive = true;

    const checkPaymentStatus = async () => {
      if (!isActive) return false;

      try {
        console.log("🔄 Checking payment status...");
        const res = await apiFetch(`/api/orders/detail/${orderId}`);
        
        if (!res.ok) {
          console.error("❌ Failed to fetch order");
          return false;
        }

        const order = await res.json();
        console.log("📦 Order status:", order.paymentStatus, order.status);

        if (order.paymentStatus === "CONFIRMED") {
          console.log("✅ PAYMENT CONFIRMED!");
          if (isActive) {
            toast.success("Payment confirmed! ✅");
            setIsLoading(false);
            setTimeout(() => {
              router.push("/");
            }, 1500);
          }
          return true;
        }

        return false;
      } catch (err) {
        console.error("❌ Error checking payment:", err);
        return false;
      }
    };

    // Check immediately after 1 second
    const initialCheck = setTimeout(() => {
      checkPaymentStatus();
    }, 1000);

    // Then check every 2 seconds for up to 5 minutes
    let checks = 0;
    const interval = setInterval(async () => {
      checks++;
      if (checks > 150) {
        clearInterval(interval);
        if (isActive) {
          setIsLoading(false);
          toast("Payment verification timeout. Please check your orders.", {
            icon: "⏱️",
          });
        }
        return;
      }

      const confirmed = await checkPaymentStatus();
      if (confirmed) {
        clearInterval(interval);
      }
    }, 2000);

    return () => {
      console.log("🧹 Cleanup payment check");
      isActive = false;
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [orderId, router]);

  const handleTelegramPay = async () => {
    if (!isTelegramAvailable) {
      toast.error("Telegram WebApp is not available. Open this in Telegram.");
      return;
    }

    if (!user?.telegramId) {
      toast.error("User not found");
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      const data = await res.json();

      if (!data.invoice_url) {
        throw new Error("Invoice URL not received");
      }

      console.log("✅ Invoice received:", data.invoice_url);
      console.log("📦 Order ID:", data.order_id);

      // Save order ID for status checking
      setOrderId(data.order_id);

      const invoiceUrl = data.invoice_url;
      let invoiceSlug = null;

      // Extract slug from different URL formats
      if (invoiceUrl.includes("/invoice/")) {
        invoiceSlug = invoiceUrl.split("/invoice/")[1].split("?")[0];
      } else if (invoiceUrl.includes("start=")) {
        const matches = invoiceUrl.match(/start=([^&]+)/);
        if (matches) {
          invoiceSlug = matches[1];
        }
      }

      console.log("Invoice slug:", invoiceSlug);

      if (invoiceSlug && window.Telegram?.WebApp?.openInvoice) {
        // Open payment form
        window.Telegram.WebApp.openInvoice(invoiceSlug, () => {
          console.log("Payment form closed");
          toast("Checking payment status...", { icon: "🔍" });
        });

        toast("Opening payment form...", { icon: "💫" });
      } else {
        // Fallback: open in Telegram
        console.warn("Using fallback link method");
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(invoiceUrl);
        } else {
          window.Telegram.WebApp.openLink(invoiceUrl);
        }

        toast("Payment opened in Telegram. Return to check status.", {
          icon: "💫",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Invoice creation error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to create invoice"
      );
      setIsLoading(false);
      setOrderId(null);
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
          Stars Payment
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
            <li>💫 Return here - we'll verify payment automatically</li>
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
              {orderId ? "Verifying payment..." : "Processing..."}
            </span>
          ) : (
            "Pay Stars ⭐"
          )}
        </button>

        {/* Payment verification info */}
        {isLoading && orderId && (
          <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg">
            <p className="text-sm text-blue-300 text-center">
              ⏳ Waiting for payment confirmation...
              <br />
              <span className="text-xs text-blue-400">
                This may take a few seconds
              </span>
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-5 p-4 bg-gray-800 bg-opacity-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">
            📌 Important Information:
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Minimum amount: 1 Star</li>
            <li>• Payment verified automatically</li>
            <li>• Stay in the app after payment</li>
            <li>• Refund available within 48 hours</li>
          </ul>
        </div>

        {!isTelegramAvailable && (
          <div className="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
            <p className="text-sm text-red-300">
              ⚠️ Telegram WebApp not detected. Please open this app through
              Telegram.
            </p>
          </div>
        )}
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