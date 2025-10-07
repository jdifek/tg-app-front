// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/http";

export default function AdminBundlesPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    content: "",
  });

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

  const handleEdit = (bundle) => {
    setEditing(bundle.id);
    setFormData({
      name: bundle.name,
      description: bundle.description || "",
      price: bundle.price.toString(),
      image: bundle.image || "",
      content: bundle.content || "",
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      content: "",
    });
  };

  const handleSave = async () => {
    try {
      const url = editing
        ? `/api/admin/bundles/${editing}`
        : "/api/admin/bundles";

      const method = editing ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        await fetchBundles();
        handleCancel();
      } else {
        throw new Error("Failed to save bundle");
      }
    } catch (error) {
      console.error("Error saving bundle:", error);
      alert("Failed to save bundle. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;

    try {
      const response = await apiFetch(`/api/admin/bundles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBundles();
      } else {
        throw new Error("Failed to delete bundle");
      }
    } catch (error) {
      console.error("Error deleting bundle:", error);
      alert("Failed to delete bundle. Please try again.");
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
          <h1 className="text-2xl font-bold">Manage Bundles</h1>
          <button
            onClick={() => setEditing("new")}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Bundle</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {editing && (
          <div className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editing === "new" ? "Add New Bundle" : "Edit Bundle"}
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
                  placeholder="Bundle name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price ($)
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
              <div className="md:col-span-2">
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
                  placeholder="Bundle description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Content (JSON format)
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 font-mono text-sm"
                  placeholder='{"photos": 50, "videos": 10, "exclusive": true}'
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

        {/* Bundles List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-gray-900 bg-opacity-50 rounded-xl p-4 border border-gray-800"
              >
                <div className="flex space-x-4 mb-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    {bundle.image && (
                      <img
                        src={bundle.image}
                        alt={bundle.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {bundle.name}
                    </h3>
                    <p className="text-purple-400 font-bold text-xl mb-2">
                      ${bundle.price}
                    </p>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {bundle.description}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(bundle)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(bundle.id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
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
