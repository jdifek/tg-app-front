"use client";
import { useState } from "react";
import { ArrowLeft, Video, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomVideoPage() {
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState<any | null>(null);

  const durations = [
    { id: "5min", duration: "5 minutes", price: 99.99 },
    { id: "10min", duration: "10 minutes", price: 179.99 },
    { id: "15min", duration: "15 minutes", price: 249.99 },
  ];

  const handleOrder = () => {
    if (selectedDuration) {
      router.push(`/checkout?type=custom-video&id=${selectedDuration}`);
    }
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
          <h1 className="text-xl font-bold">Custom Video</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 mb-6 text-center">
            <Video className="w-12 h-12 text-white mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Custom Video Request
            </h2>
            <p className="text-white text-opacity-90">
              Get a personalized video made just for you
            </p>
          </div>

          {/* Description */}
          <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-6">
            <h3 className="font-semibold mb-3">How it works:</h3>
            <ol className="space-y-2 text-gray-300">
              <li>1. Choose your preferred video duration</li>
              <li>2. Complete the payment</li>
              <li>3. Chat with me to discuss your custom request</li>
              <li>4. Receive your personalized video within 3-5 days</li>
            </ol>
          </div>

          {/* Duration Options */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Select Duration:
            </h3>
            {durations.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedDuration(option.id)}
                className={`w-full rounded-xl p-4 border-2 transition-all ${
                  selectedDuration === option.id
                    ? "border-purple-500 bg-purple-500 bg-opacity-20"
                    : "border-gray-800 bg-gray-900 bg-opacity-50 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="font-semibold text-lg">{option.duration}</h4>
                    <p className="text-sm text-gray-400">Custom video</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">
                    ${option.price}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Order Button */}
          <button
            onClick={handleOrder}
            disabled={!selectedDuration}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <Video className="w-5 h-5" />
            <span>Order Custom Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}
