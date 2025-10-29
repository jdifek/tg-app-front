// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/http";
import toast from "react-hot-toast";

export default function AdminBundlesPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    exclusive: false,
    imageFile: null,
    image: "",
    imageFiles: [],
    videoFiles: [],
    existingImages: [], // существующие фото
    existingVideos: [], // существующие видео
    imagesToDelete: [], // ID фото для удаления
    videosToDelete: [], // ID видео для удаления
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
      exclusive: !!bundle.exclusive,
      image: bundle.image || "",
      imageFile: null,
      imageFiles: [],
      videoFiles: [],
      existingImages: bundle.images || [],
      existingVideos: bundle.videos || [],
      imagesToDelete: [],
      videosToDelete: [],
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      exclusive: false,
      image: "",
      imageFile: null,
      imageFiles: [],
      videoFiles: [],
      existingImages: [],
      existingVideos: [],
      imagesToDelete: [],
      videosToDelete: [],
    });
  };

  const handleSave = async () => {
    try {
      const isNew = editing === "new";
      const url = isNew
        ? "/api/admin/bundles"
        : `/api/admin/bundles/${editing}`;
      const method = isNew ? "POST" : "PUT";

      const fd = new FormData();
      fd.append("name", formData.name || "");
      fd.append("description", formData.description || "");
      fd.append("price", formData.price || "");
      fd.append("exclusive", formData.exclusive ? "true" : "false");

      // Add image if it exists
      if (formData.imageFile) fd.append("image", formData.imageFile);

      // Add additional images if provided
      if (formData.imageFiles?.length) {
        formData.imageFiles.forEach((file) => fd.append("images", file));
      }

      // Add videos if provided
      if (formData.videoFiles?.length) {
        formData.videoFiles.forEach((file) => fd.append("videos", file));
      }

      // Add IDs to delete
      if (formData.imagesToDelete?.length) {
        fd.append("imagesToDelete", JSON.stringify(formData.imagesToDelete));
      }
      if (formData.videosToDelete?.length) {
        fd.append("videosToDelete", JSON.stringify(formData.videosToDelete));
      }

      const loadingToast = toast.loading(
        isNew ? "Creating bundle..." : "Saving changes..."
      );

      const response = await apiFetch(url, { method, body: fd });

      toast.dismiss(loadingToast);

      if (response.ok) {
        await fetchBundles();
        handleCancel();
        toast.success(
          isNew ? "Bundle created successfully!" : "Changes saved!"
        );
      } else {
        toast.error("Failed to save bundle 😞");
      }
    } catch (error) {
      console.error("Error saving bundle:", error);
      toast.dismiss();
      toast.error("An error occurred while saving. Please try again.");
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  const removeExistingImage = (imageId) => {
    setFormData({
      ...formData,
      existingImages: formData.existingImages.filter(img => img.id !== imageId),
      imagesToDelete: [...formData.imagesToDelete, imageId],
    });
  };

  const removeExistingVideo = (videoId) => {
    setFormData({
      ...formData,
      existingVideos: formData.existingVideos.filter(vid => vid.id !== videoId),
      videosToDelete: [...formData.videosToDelete, videoId],
    });
  };

  const removeNewImage = (index) => {
    const newFiles = [...formData.imageFiles];
    newFiles.splice(index, 1);
    setFormData({ ...formData, imageFiles: newFiles });
  };

  const removeNewVideo = (index) => {
    const newFiles = [...formData.videoFiles];
    newFiles.splice(index, 1);
    setFormData({ ...formData, videoFiles: newFiles });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
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
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
           
              <div className="md:col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="exclusive"
                  checked={formData.exclusive}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <label className="text-sm font-medium">Exclusive Content</label>
              </div>

              {/* Main Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Main Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-gray-300"
                />
                {formData.image && !formData.imageFile && (
                  <img
                    src={formData.image}
                    alt="bundle"
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
                {formData.imageFile && (
                  <img
                    src={URL.createObjectURL(formData.imageFile)}
                    alt="preview"
                    className="mt-2 w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Additional Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Additional Images
                </label>
                
                {/* Existing Images */}
                {formData.existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Current Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.existingImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.url}
                            alt="existing"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                          />
                          <button
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Upload */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      imageFiles: Array.from(e.target.files),
                    })
                  }
                  className="w-full text-gray-300"
                />
                
                {/* New Images Preview */}
                {formData.imageFiles && formData.imageFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-2">New Images:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.imageFiles.map((file, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview-${i}`}
                            className="w-24 h-24 object-cover rounded-lg border border-green-500"
                          />
                          <button
                            onClick={() => removeNewImage(i)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Videos */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Videos</label>
                
                {/* Existing Videos */}
                {formData.existingVideos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Current Videos:</p>
                    <div className="space-y-2">
                      {formData.existingVideos.map((video) => (
                        <div
                          key={video.id}
                          className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border border-gray-700"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🎥</span>
                            <span className="text-sm">{video.name}</span>
                          </div>
                          <button
                            onClick={() => removeExistingVideo(video.id)}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Videos Upload */}
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      videoFiles: Array.from(e.target.files),
                    })
                  }
                  className="w-full text-gray-300"
                />
                
                {/* New Videos Preview */}
                {Array.isArray(formData.videoFiles) &&
                  formData.videoFiles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">New Videos:</p>
                      <div className="space-y-2">
                        {formData.videoFiles.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border border-green-500"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">🎥</span>
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeNewVideo(i)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <p className="text-gray-300 text-sm">
                      📸 {bundle.images?.length || 0} | 🎥{" "}
                      {bundle.videos?.length || 0}{" "}
                      {bundle.exclusive ? "| ⭐ Exclusive" : ""}
                    </p>

                    {bundle.images?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {bundle.images.slice(0, 3).map((img) => (
                          <img
                            key={img.id}
                            src={img.url}
                            alt=""
                            className="w-10 h-10 rounded object-cover border border-gray-700"
                          />
                        ))}
                        {bundle.images.length > 3 && (
                          <span className="text-gray-400 text-xs self-center ml-1">
                            +{bundle.images.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {bundle.videos?.length > 0 && (
                      <p className="text-gray-400 text-xs mt-1">
                        🎥 {bundle.videos.length} video
                        {bundle.videos.length > 1 ? "s" : ""}
                      </p>
                    )}
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