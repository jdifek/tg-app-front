"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Upload, X } from "lucide-react";
import { apiFetch } from "@/app/http";

export const dynamic = "force-dynamic";

export default function UsdtPaymentPage() {
  const router = useRouter();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [address, setAddress] = useState("loading");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      const res = await apiFetch("/api/orders/payments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAddress(data.payments.USDT);
      }
      console.log(data, data);
    }
    fetchPayments();
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setOrderId(params.get("orderId"));
      setRating(params.get("rating"));
    }
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId) {
      toast.error("Order ID not found");
      return;
    }

    if (!screenshot) {
      toast.error("Please attach a payment screenshot");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch(`/api/orders/${orderId}/payment-status`, {
        method: "PATCH",
        body: JSON.stringify({ paymentStatus: "AWAITING_CHECK" }),
      });

      const formData = new FormData();
      formData.append("screenshot", screenshot);

      const response = await apiFetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create payment");
      }

      if (!res.ok) throw new Error("Failed to update payment status");

      toast.success("Payment sent for review");
      if (rating) {
        setShowPhotoUpload(true);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error confirming payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        return;
      }
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }; // new

  const handlePhotoUpload = async () => {
    if (!selectedPhoto || !orderId) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("rating", selectedPhoto);

      const response = await apiFetch(`/api/orders/${orderId}-rating`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      router.push("/");
      toast.success("Photo uploaded successfully!");
    } catch (error) {
      console.error("Photo upload failed:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }; // new

  if (showPhotoUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Upload Photo</h1>
            <div className="w-10" />
          </div>

          <div className="p-4">
            <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 bg-opacity-20 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-400 text-sm">
                  Please upload your photo for rating
                </p>
              </div>

              {/* Photo Upload Area */}
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                    />
                  </label>
                )}

                <button
                  onClick={handlePhotoUpload}
                  disabled={!selectedPhoto || uploadingPhoto}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-4 rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {uploadingPhoto ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    "Submit Photo"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold">USDT (TRC20)</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-5">
        <div className="bg-gray-900 bg-opacity-50 border border-pink-600 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-pink-400 mb-3">
            Payment amount: <span className="text-white">$27</span>
          </h2>

          <p className="text-gray-300 mb-3">
            Send exactly <b>27 USDT (TRC20)</b> to this address:
          </p>

          <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-lg mb-3">
            <span className="truncate text-green-400 font-semibold">
              {address}
            </span>
            <button
              onClick={handleCopy}
              className="text-white hover:text-pink-400 transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>

          {/* Upload screenshot */}
          <div className="mt-4">
            <label className="block text-gray-300 mb-2 font-medium">
              Attach payment screenshot:
            </label>
            <div className="border border-dashed border-gray-600 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-800 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshotUpload"
              />
              <label
                htmlFor="screenshotUpload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-6 h-6 text-pink-400 mb-1" />
                <span className="text-sm text-gray-400">
                  {screenshot ? "Change screenshot" : "Click to upload"}
                </span>
              </label>
            </div>

            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded-xl border border-gray-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirmPayment}
          disabled={loading}
          className="w-full mt-5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 rounded-xl py-3 font-semibold text-white transition"
        >
          {loading ? "Sending..." : "Confirm Payment"}
        </button>
      </div>
    </div>
  );
}
