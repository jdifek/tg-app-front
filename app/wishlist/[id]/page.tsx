"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "../../http";
import { useRouter } from "next/navigation";

export default function WishlistDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState<string | number>(""); // <-- State for donation amount
  const [isCustom, setIsCustom] = useState(false); // <-- Toggle for custom amount input
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await apiFetch(`/api/wishlist/${id}`);
      const data = await response.json();
      setItem(data.wishlist);
    } catch (error) {
      console.error("Error fetching wishlist item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = () => {
    if (!amount) return alert("Please enter a valid amount.");

    const cleanedAmount = typeof amount === "string" ? amount.replace("€", "") : amount;
    router.push(`/payment?type=donation&price=${cleanedAmount}${message && '&message=' + message}`);
  };

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Item not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 mt-8 pb-10 flex flex-col items-center text-center">
      {/* Image */}
      <div className="w-full max-w-xs aspect-square bg-gray-800 rounded-xl overflow-hidden mb-4">
        <Image
          src={item.image || "/api/placeholder/200/200"}
          alt={item.name}
          width={240}
          height={240}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-semibold mb-2">{item.name}</h1>

      {/* Price */}
      {item.price && (
        <p className="text-base sm:text-lg text-pink-500 font-medium mb-4">
          ${item.price}
        </p>
      )}

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-300 mb-6 leading-relaxed max-w-md break-words">
        {item.description}
      </p>

      {/* Thank you text */}
      <div className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-md space-y-3 mb-6">
        <p>
          Thank you for helping me reach my goal!
          <br />
          You make me even happier! 🥰
        </p>
        <p>
          I value your attention and support.
          <br />
          It motivates me to create even more beautiful and intimate content for
          you.
        </p>
        <p className="font-semibold text-pink-400">You are the best! ❤️</p>
      </div>

      {/* Donation Block */}
      <div className="w-full max-w-md mt-6">
        <h2 className="text-lg font-semibold mb-4">Сумма доната</h2>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {["5€", "10€", "25€", "50€"].map((preset) => (
            <button
              onClick={() => {
                setAmount(preset);
                setIsCustom(false);
              }}
              key={preset}
              className={`px-4 py-2 rounded-full border ${
                amount === preset && !isCustom ? "bg-pink-500 text-white" : "border-pink-400 text-pink-400 hover:bg-pink-500 hover:text-white"
              } transition`}
            >
              {preset}
            </button>
          ))}

          <button
            onClick={() => {
              setIsCustom(true);
              setAmount("");
            }}
            className={`px-4 py-2 rounded-full border ${
              isCustom ? "bg-pink-500 text-white" : "border-pink-400 text-pink-400 hover:bg-pink-500 hover:text-white"
            } transition`}
          >
            Другая сумма
          </button>
        </div>

        {/* Custom amount input */}
        {isCustom && (
          <input
            type="number"
            placeholder="Введите сумму (€)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 mb-3 bg-purple-900/40 border border-pink-400 rounded-xl text-white placeholder-gray-300 outline-none"
          />
        )}

        {/* Textarea */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Сообщение..."
          className="w-full h-28 p-3 bg-purple-900/40 border border-pink-400 rounded-xl text-white placeholder-gray-300 mb-3 outline-none resize-none"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleBuy}
        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 transition rounded-full font-medium text-white"
      >
        Continue Supporting 💖
      </button>

      {/* Created date */}
      <p className="text-xs text-gray-500 mt-6">
        Created at: {new Date(item.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
