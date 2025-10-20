"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../http";

import { Suspense } from "react";
import { useUser } from "../context/UserContext";


export function CheckoutPage() {
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Получаем параметры из URL
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  useEffect(() => {
    if (type && id) fetchItem(type, id);
    else setLoading(false);
  }, [type, id]);

  const fetchItem = async (type: string, id: string) => {
    try {
      const endpoint =
        type === "product" ? `/api/products/${id}` : `/api/bundles/${id}`;
      const response = await apiFetch(endpoint);
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!type || !id) return alert("Invalid order parameters");
  
    // Переносим создание ордера в PaymentPage
    router.push(
      `/payment?type=${type}&id=${id}&price=${item?.price}&shipping=${encodeURIComponent(JSON.stringify(formData))}`
    );  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="max-w-md mx-auto p-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Checkout</h1>
          <div className="w-10" />
        </div>

        <div className="p-4">
          {/* Order Summary */}
          {item && (
            <div className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800 mb-6">
              <h3 className="font-semibold mb-3 text-white">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">{item.name}</span>
                <span className="font-bold text-purple-400">
                  ${item.price}
                </span>
              </div>
            </div>
          )}

          {/* Shipping Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "firstName", label: "First Name" },
              { name: "lastName", label: "Last Name" },
              { name: "address", label: "Address" },
              { name: "city", label: "City" },
              { name: "zipCode", label: "ZIP Code" },
              { name: "country", label: "Country" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-2 text-white">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 bg-opacity-50 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-white"
                />
              </div>
            ))}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>
                {submitting ? "Processing..." : "Continue to Payment"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutPage />
    </Suspense>
  );
}