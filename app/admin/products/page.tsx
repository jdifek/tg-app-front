// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/http";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiFetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setFormData({
      name: product.name,
      price: product.price?.toString() || "",
      image: product.image || "",
      description: product.description || "",
    });
    setFile(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: "",
      price: "",
      image: "",
      description: "",
    });
    setFile(null);
  };

  const handleSave = async () => {
    try {
      const url =
        editing === "new"
          ? "/api/admin/products"
          : `/api/admin/products/${editing}`;
      const method = editing === "new" ? "POST" : "PUT";

      // Создаём FormData
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("price", formData.price || "0");
      fd.append("description", formData.description || "");
      if (file) {
        fd.append("image", file);
      }

      const response = await apiFetch(url, {
        method,
        body: fd,
      });

      if (response.ok) {
        await fetchData();
        handleCancel();
      } else {
        throw new Error("Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await apiFetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
      } else {
        throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
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
          <h1 className="text-2xl font-bold">Manage Products</h1>
          <button
            onClick={() => setEditing("new")}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {editing && (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editing === "new" ? "Add New Product" : "Edit Product"}
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
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="0.00"
                />
              </div>

              {/* File Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Product Image
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 cursor-pointer hover:border-purple-500 transition-colors">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    <span>{file ? file.name : "Choose file"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formData.image && !file && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-gray-700"
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
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

        {/* Products Grid */}
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
            {products.map((item) => (
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
