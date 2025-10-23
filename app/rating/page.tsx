"use client";
import { useState } from "react";
import { ArrowLeft, Heart, MessageSquare, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RatingPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(null);

  const ratingTypes = [
    {
      id: "text",
      name: "Text Dick Rating",
      description: "Detailed written rating and feedback",
      price: 19.99,
      icon: MessageSquare,
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "voice",
      name: "Voice Dick Rating",
      description: "Personal voice message rating",
      price: 39.99,
      icon: Heart,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "video",
      name: "Video Dick Rating",
      description: "Full video rating and reaction",
      price: 59.99,
      icon: Video,
      color: "from-pink-500 to-red-600",
    },
  ];

  const handleOrder = (typeId: any, price: number) => {
    setSelectedType(typeId);
    router.push(`/payment?type=custom_video&id=${typeId}}&price=${price}`);
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
          <h1 className="text-xl font-bold">Dick Rating</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-pink-500 to-red-600 rounded-xl p-6 mb-6 text-center">
            <Heart className="w-12 h-12 text-white mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Dick Rating Service
            </h2>
            <p className="text-white text-opacity-90">
              Get honest and detailed feedback
            </p>
          </div>

          {/* How it works */}
          <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-6">
            <h3 className="font-semibold mb-3">How it works:</h3>
            <ol className="space-y-2 text-gray-300">
              <li>1. Choose your preferred rating type</li>
              <li>2. Complete the payment</li>
              <li>3. Upload your photo/video in the bot chat</li>
              <li>4. Receive your rating within 24 hours</li>
            </ol>
          </div>

          {/* Rating Types */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-4">Choose Rating Type:</h3>
            {ratingTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className={`bg-gradient-to-r ${type.color} rounded-xl p-5 cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => handleOrder(type.id, type.price)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-white bg-opacity-20 rounded-lg p-2">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      ${type.price}
                    </div>
                  </div>
                  <h4 className="font-semibold text-white text-lg mb-1">
                    {type.name}
                  </h4>
                  <p className="text-white text-opacity-90 text-sm">
                    {type.description}
                  </p>
                  <button className="w-full mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Order Now
                  </button>
                </div>
              );
            })}
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 bg-blue-900 bg-opacity-20 rounded-xl p-4 border border-blue-800">
            <p className="text-sm text-gray-300 text-center">
              🔒 All submissions are 100% private and confidential. Your content
              will be deleted after rating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
