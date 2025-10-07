"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "../http";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiFetch(`/api/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = (id: string) => {
    router.push(`/checkout?type=product&id=${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Shop</h1>
          <div className="w-10" />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-3 animate-pulse">
                <div className="aspect-square bg-gray-700 rounded-lg mb-2" />
                <div className="h-4 bg-gray-700 rounded mb-1" />
                <div className="h-3 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">
            No products available
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 bg-opacity-50 rounded-xl p-3 border border-gray-800 flex flex-col"
              >
                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-800">
                  <Image
                    src={product.image || "/api/placeholder/400/400"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-purple-400 font-bold text-lg mb-3">
                  ${product.price}
                </p>
                <button
                  onClick={() => handleBuy(product.id)}
                  className="mt-auto w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
