// @ts-nocheck

"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/http";

export default function AdminWishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    link: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await apiFetch("/api/wishlist");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price?.toString() || "",
      image: item.image || "",
      link: item.link || "",
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      link: "",
    });
  };

  const handleSave = async () => {
    try {
      const url = editing
        ? `/api/admin/wishlist/${editing}`
        : "/api/admin/wishlist";

      const method = editing ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      });

      if (response.ok) {
        await fetchItems();
        handleCancel();
      } else {
        throw new Error("Failed to save item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await apiFetch(`/api/admin/wishlist/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchItems();
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
          <h1 className="text-2xl font-bold">Manage Wishlist</h1>
          <button
            onClick={() => setEditing("new")}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {editing && (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editing === "new" ? "Add New Item" : "Edit Item"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ($) - Optional
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Link - Optional
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="Item description"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-3 animate-pulse">
                <div className="aspect-square bg-gray-700 rounded-lg mb-2" />
                <div className="h-4 bg-gray-700 rounded mb-1" />
                <div className="h-3 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900 bg-opacity-50 rounded-xl p-3 border border-gray-800"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-800">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-1 truncate">
                  {item.name}
                </h3>
                {item.price && (
                  <p className="text-pink-400 font-bold text-sm mb-2">
                    ${item.price}
                  </p>
                )}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
