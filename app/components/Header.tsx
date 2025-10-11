"use client";
import { MessageCircle, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const handleSocialClick = () => {
    // Здесь будет логика для открытия социальных сетей
    console.log("Social clicked");
  };

  const handleMessageClick = () => {
    // Здесь будет логика для открытия чата с ботом
    console.log("Message clicked");
  };

  return (
    <div className="relative">
      {/* Баннер */}
      <div className="h-32  relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1200"
          alt="Profile Banner"
          width={1200}
          height={300}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Профиль */}
      <div className="px-4 pb-4">
        <div className="flex items-start justify-between -mt-16 relative z-10">
          <div className="flex items-end space-x-3">
            {/* Аватар */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                <Image
                  src="https://img.freepik.com/free-photo/attractive-positive-elegant-young-woman-cafe_23-2148071691.jpg?semt=ais_hybrid&w=740&q=80"
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover bg-gray-800"
                />
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
              <h1 className="text-xl font-bold text-white">TASHA MENDI</h1>
              <p className="text-gray-300 text-sm">@TashaMendi</p>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleSocialClick}
              className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg p-2 hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <LinkIcon className="w-5 h-5 text-purple-400" />
            </button>
            <button
              onClick={handleMessageClick}
              className="bg-purple-600 hover:bg-purple-700 rounded-lg p-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
