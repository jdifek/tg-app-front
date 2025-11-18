"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Link as LinkIcon, Copy } from "lucide-react";
import Image from "next/image";
import { apiFetch } from "../http";

interface GirlData {
  banner: string;
  logo: string;
  tgLink: string;
  link: string;
  name: string;
}

export default function Header() {
  const [girl, setGirl] = useState<GirlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function fetchGirl() {
      try {
        const res = await apiFetch("/api/girl", { method: "GET" });
        const data = await res.json();
        if (res.ok) {
          setGirl(data.girl);
        } else {
          console.error("Failed to fetch girl:", data.error);
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGirl();
  }, []);

  const handleSocialClick = () => {
    if (girl?.tgLink) {
      window.open(`https://t.me/${girl.tgLink.replace(/^@/, "")}`, "_blank");
    } else {
      console.log("No Telegram link available");
    }
  };
  const handleMessageClick = () => {
    if (!girl?.link) {
      console.warn("Link is not available");
      return;
    }
  
    // Telegram MiniApp
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(girl.link);
      console.log("Opened link via Telegram WebApp");
      return;
    }
  
    // Обычный браузер: откроем в новой вкладке
    window.open(girl.link, "_blank");
    console.log("Opened link in browser fallback");
  };
  
  return (
    <div className="relative">
      {/* Баннер */}
      <div className="h-32 relative overflow-hidden">
        {girl?.banner ? (
          <Image
            src={girl.banner}
            alt="Profile Banner"
            width={1200}
            height={300}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        )}
      </div>

      {/* Профиль */}
      <div className="px-4 pb-4">
        <div className="flex items-start justify-between -mt-16 relative z-10">
          <div className="flex items-end space-x-3">
            {/* Аватар */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                {girl?.logo ? (
                  <Image
                    src={girl.logo}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full rounded-full object-cover bg-gray-800"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />
                )}
              </div>

              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Имя и юзернейм */}
            <div className="pb-2">
              <h1 className="text-xl font-bold text-white">{girl && girl.name}</h1>
              <p className="text-gray-300 text-sm">{girl && girl.tgLink}</p>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleMessageClick}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-2 hover:bg-white hover:bg-opacity-20 transition-colors"
              title="Open link"
            >
              <LinkIcon className="w-5 h-5 text-purple-400" />
            </button>
            <button
              onClick={handleSocialClick}
              className="bg-purple-600 hover:bg-purple-700 rounded-lg p-2 transition-colors"
              title="Open chat"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded shadow-lg transition-opacity">
          {toast}
        </div>
      )}
    </div>
  );
}
