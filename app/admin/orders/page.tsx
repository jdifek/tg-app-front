// @ts-nocheck

"use client";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  CreditCard,
  Image as ImageIcon,
  Star,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/http";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [viewingImage, setViewingImage] = useState(null);
  const [ratingFeedback, setRatingFeedback] = useState({});
  const [sendingFeedback, setSendingFeedback] = useState({});
  const [customMessage, setCustomMessage] = useState({});
  const [sendingMessage, setSendingMessage] = useState({});
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiFetch("/api/admin/orders");
      const data = await response.json();
      console.log("Fetched orders:", data);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order. Please try again.");
    }
  };
  const sendCustomMessage = async (orderId, userId) => {
    const message = customMessage[orderId];
    if (!message || !message.trim()) {
      alert("Please enter a message");
      return;
    }
  
    setSendingMessage({ ...sendingMessage, [orderId]: true });
  
    try {
      // Используем новую систему поддержки
      const response = await apiFetch("/api/support/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          message: `📦 <b>Message about Order #${orderId.slice(0, 8)}</b>\n\n${message}`,
          orderId: orderId, // Опционально: можем сохранить связь с заказом
        }),
      });
  
      if (response.ok) {
        toast.success("Message sent successfully!");
        setCustomMessage({ ...customMessage, [orderId]: "" });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSendingMessage({ ...sendingMessage, [orderId]: false });
    }
  };
  
  const updatePaymentStatus = async (orderId, newPaymentStatus) => {
    try {
      const response = await apiFetch(`/api/orders/${orderId}/payment-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });

      if (response.ok) {
        await fetchOrders();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(`Failed to update payment status: ${error.message}`);
    }
  };

  const sendRatingFeedback = async (orderId, userId) => {
    const feedback = ratingFeedback[orderId];
    if (!feedback || !feedback.trim()) {
      alert("Please enter feedback message");
      return;
    }
  
    setSendingFeedback({ ...sendingFeedback, [orderId]: true });
  
    try {
      // Используем новую систему поддержки
      const response = await apiFetch("/api/support/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          message: `⭐ <b>Dick Rating Feedback for Order #${orderId.slice(0, 8)}</b>\n\n${feedback}`,
        }),
      });
  
      if (response.ok) {
        toast.success("Feedback sent successfully!");
        setRatingFeedback({ ...ratingFeedback, [orderId]: "" });
      } else {
        throw new Error("Failed to send feedback");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast.error("Failed to send feedback");
    } finally {
      setSendingFeedback({ ...sendingFeedback, [orderId]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-600";
      case "PROCESSING":
        return "bg-blue-600";
      case "CANCELLED":
        return "bg-red-600";
      default:
        return "bg-yellow-600";
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "CONFIRMED":
        return "bg-green-600";
      case "AWAITING_CHECK":
        return "bg-orange-600";
      case "FAILED":
        return "bg-red-600";
      default:
        return "bg-yellow-600";
    }
  };

  const getPaymentStatusLabel = (paymentStatus) => {
    const labels = {
      PENDING: "Pending",
      AWAITING_CHECK: "Awaiting Check",
      CONFIRMED: "Confirmed",
      FAILED: "Failed",
    };
    return labels[paymentStatus] || paymentStatus;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CARD_CRYPTO: "Card/Crypto",
      USDT_TRC20: "USDT (TRC20)",
      PAYPAL: "PayPal",
      STARS: "Telegram Stars",
      MANUAL: "Manual",
    };
    return labels[method] || method;
  };

  const getOrderTypeLabel = (type) => {
    const labels = {
      PRODUCT: "Product",
      BUNDLE: "Bundle",
      VIP: "VIP Subscription",
      CUSTOM_VIDEO: "Custom Video",
      VIDEO_CALL: "Video Call",
      RATING: "Dick Rating",
    };
    return labels[type] || type;
  };

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin</span>
          </button>
          <h1 className="text-2xl font-bold">Manage Orders</h1>
          <div className="w-24" />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      {order.paymentStatus && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold text-white ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          💳 {getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Type: {getOrderTypeLabel(order.orderType)}
                    </p>
                    {order.user && (
                      <p className="text-sm text-gray-400">
                        User: {order?.user?.firstName}
                        {order?.user?.username ? (
                          <a
                            href={`https://t.me/${order.user.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 ml-1 hover:underline"
                          >
                            @{order.user.username}
                          </a>
                        ) : (
                          <p>Без Telegram</p>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-400">
                      ${order.totalAmount}
                    </p>
                    {order.paymentMethod && (
                      <p className="text-xs text-gray-400 mt-1">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Screenshot */}
                {order.screenshot && (
                  <div className="mb-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Payment Screenshot
                    </h4>
                    <div className="flex items-center space-x-3">
                      <img
                        src={order.screenshot}
                        alt="Payment screenshot"
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setViewingImage(order.screenshot)}
                      />
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-2">
                          Click to view full size
                        </p>
                        <button
                          onClick={() =>
                            window.open(order.screenshot, "_blank")
                          }
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                        >
                          Open in new tab
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Photo (Dick Rating) */}
                {order.rating && order.orderType === "RATING" && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-pink-900 to-purple-900 bg-opacity-50 rounded-lg border-l-4 border-pink-500">
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-400" />
                      Dick Rating Request
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <img
                          src={order.rating}
                          alt="Rating photo"
                          className="w-full max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity bg-gray-900"
                          onClick={() => setViewingImage(order.rating)}
                        />
                        <button
                          onClick={() => window.open(order.rating, "_blank")}
                          className="mt-2 w-full text-xs bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded transition-colors"
                        >
                          View Full Size
                        </button>
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 mb-1 block">
                          Send Feedback to User:
                        </label>
                        <textarea
                          value={ratingFeedback[order.id] || ""}
                          onChange={(e) =>
                            setRatingFeedback({
                              ...ratingFeedback,
                              [order.id]: e.target.value,
                            })
                          }
                          placeholder="Enter your rating feedback here..."
                          className="w-full h-24 bg-gray-800 text-white rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <button
                          onClick={() =>
                            sendRatingFeedback(order.id, order.telegramId)
                          }
                          disabled={
                            sendingFeedback[order.id] ||
                            !ratingFeedback[order.id]?.trim()
                          }
                          className={`mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                            sendingFeedback[order.id] ||
                            !ratingFeedback[order.id]?.trim()
                              ? "bg-gray-600 cursor-not-allowed"
                              : "bg-pink-600 hover:bg-pink-700 text-white"
                          }`}
                        >
                          {sendingFeedback[order.id] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Send Feedback to DM</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.orderItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-300">
                            {item.product?.name ||
                              item.bundle?.name ||
                              "Service"}
                          </span>
                          <span className="text-gray-400">${item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Info */}
                {order.address && (
                  <div className="mb-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">
                      Shipping Address:
                    </h4>
                    <p className="text-sm text-gray-300">
                      {order.firstName} {order.lastName}
                      <br />
                      {order.address}
                      <br />
                      {order.city}, {order.zipCode}
                      <br />
                      {order.country}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                {order.metadata && (
                  <div className="mb-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">
                      Additional Info:
                    </h4>
                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(order.metadata), null, 2)}
                    </pre>
                  </div>
                )}
                {/* Custom Message Section */}
                <div className="mb-3 p-3 bg-gradient-to-r from-blue-900 to-indigo-900 bg-opacity-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <Send className="w-4 h-4 mr-2 text-blue-400" />
                    Send Custom Message to User
                  </h4>
                  <textarea
                    value={customMessage[order.id] || ""}
                    onChange={(e) =>
                      setCustomMessage({
                        ...customMessage,
                        [order.id]: e.target.value,
                      })
                    }
                    placeholder="Write any message to send to the user..."
                    className="w-full h-24 bg-gray-800 text-white rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <button
                    onClick={() =>
                      sendCustomMessage(order.id, order.telegramId)
                    }
                    disabled={
                      sendingMessage[order.id] ||
                      !customMessage[order.id]?.trim()
                    }
                    className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      sendingMessage[order.id] ||
                      !customMessage[order.id]?.trim()
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {sendingMessage[order.id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to DM</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2">
  <button
    onClick={() => window.open(`/admin/support?user=${order.telegramId}`, '_blank')}
    className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
  >
    <MessageCircle className="w-4 h-4" />
    <span>Open Full Chat with User</span>
  </button>
</div>
                {/* Payment Status Section */}
                {order.paymentStatus && order.paymentStatus !== "CONFIRMED" && (
                  <div className="mb-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment Status Management
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.paymentStatus === "PENDING" && (
                        <button
                          onClick={() =>
                            updatePaymentStatus(order.id, "AWAITING_CHECK")
                          }
                          className="flex-1 min-w-[150px] bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          Mark Awaiting Check
                        </button>
                      )}
                      {(order.paymentStatus === "PENDING" ||
                        order.paymentStatus === "AWAITING_CHECK") && (
                        <>
                          <button
                            onClick={() =>
                              updatePaymentStatus(order.id, "CONFIRMED")
                            }
                            className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            Confirm Payment
                          </button>
                          <button
                            onClick={() =>
                              updatePaymentStatus(order.id, "FAILED")
                            }
                            className="flex-1 min-w-[100px] bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                          >
                            Mark Failed
                          </button>
                        </>
                      )}
                      {order.paymentStatus === "FAILED" && (
                        <button
                          onClick={() =>
                            updatePaymentStatus(order.id, "PENDING")
                          }
                          className="flex-1 min-w-[150px] bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Status Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-700">
                  {order.status === "PENDING" && (
                    <>
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "PROCESSING")
                        }
                        className="flex-1 min-w-[140px] flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Mark Processing</span>
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                        className="flex-1 min-w-[100px] flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        className="flex-1 min-w-[80px] flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  {order.status === "PROCESSING" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                        className="flex-1 min-w-[100px] flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        className="flex-1 min-w-[80px] flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}
                  {(order.status === "COMPLETED" ||
                    order.status === "CANCELLED") && (
                    <div className="flex-1 text-center text-sm text-gray-400 py-2">
                      Order {order.status.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <img
              src={viewingImage}
              alt="Full size view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
