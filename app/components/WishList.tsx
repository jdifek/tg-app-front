"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import { apiFetch } from "../http";

export default function WishList() {
  // const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetchWishlist();
  // }, []);

  // const fetchWishlist = async () => {
  //   try {
  //     const response = await apiFetch("/api/wishlist");
  //     const data = await response.json();
  //     setWishlistItems(data);
  //   } catch (error) {
  //     console.error("Error fetching wishlist:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="px-4 mt-8">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-semibold">My Wishlist</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-8 pb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Heart className="w-5 h-5 text-pink-500" />
        <h2 className="text-lg font-semibold">My Wishlist</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {wishlistItems.map((item) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="aspect-square bg-gray-800 rounded-xl overflow-hidden relative">
              <Image
                src={item.image || "/api/placeholder/120/120"}
                alt={item.name}
                width={120}
                height={120}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">
                  {item.name}
                </p>
                {item.price && (
                  <p className="text-pink-400 text-xs">${item.price}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
