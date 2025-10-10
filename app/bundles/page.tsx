"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiFetch } from "../http";

export default function BundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const response = await apiFetch("/api/bundles");
      const data = await response.json();
      setBundles(data);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setLoading(false);
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
          <h1 className="text-xl font-bold">Bundles</h1>
          <div className="w-10" />
        </div>

        {/* Bundles List */}
        <div className="p-4 space-y-4">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-xl p-4 animate-pulse"
                >
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-700 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-700 rounded" />
                      <div className="h-4 bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-700 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            : bundles.map((bundle) => (
                <div
                  key={bundle.id}
                  onClick={() => router.push(`/bundles/${bundle.id}`)}
                  className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800 hover:bg-gray-900 hover:bg-opacity-70 transition-colors cursor-pointer"
                >
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={bundle.image || "/api/placeholder/80/80"}
                        alt={bundle.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {bundle.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {bundle.description}
                      </p>
                      <p className="text-purple-400 font-bold text-xl">
                        ${bundle.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
