"use client";
import { useState, useEffect } from "react";
import type { SliderItem } from "./SliderManagement";
import toast from "react-hot-toast";

interface AddSliderFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: SliderItem;
}

const AddSliderForm: React.FC<AddSliderFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [previewType, setPreviewType] = useState<"image" | "video" | null>(
      null,
    );
    const [target, setTarget] = useState<"all" | "mobile" | "desktop">("all");
  
  const [name, setName] = useState("");  
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load edit data
useEffect(() => {
 if (editData) {
   setName(editData.name);
   setPreview(editData.media.url);
   setPreviewType(editData.media.resource_type);
   setStatus(editData.status ?? true);
   setTarget(editData.target || "all"); // ✅ add this
   setMediaFile(null);
 } else {
   setName("");
   setPreview("");
   setPreviewType(null);
   setStatus(true);
   setTarget("all"); // ✅ reset
   setMediaFile(null);
 }
}, [editData, open]);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    toast.error("Only image or video allowed 🚫");
    return;
  }

  // Size validation
  const maxSize = isVideo ? 10 * 1024 * 1024 : 1 * 1024 * 1024;

  if (file.size > maxSize) {
    toast.error(
      isVideo
        ? "Video must be less than 10MB 🚫"
        : "Image must be less than 1MB 🚫",
    );
    e.target.value = "";
    return;
  }

  setMediaFile(file);
  setPreview(URL.createObjectURL(file));
  setPreviewType(isVideo ? "video" : "image");
};

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
formData.append("target", target);
    // For update → image is optional
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    // Status optional
    formData.append("status", String(status));

    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_BASE_URL}/api/slider`;
      let method: "POST" | "PUT" = "POST";

      // Update
      if (editData?.sliderId) {
        url += `/${editData.sliderId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editData ? "Slider updated!" : "Slider added!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative ml-auto w-full sm:w-[750px] h-full bg-white shadow-2xl overflow-y-auto p-5">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h2 className="text-xl font-semibold">
            {editData ? "Edit Slider" : "Add Slider"}
          </h2>
          <button className="text-2xl" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label>Name</label>
            <span className="text-xl/0 text-red-500">*</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 outline-none rounded px-3 py-2"
            />
          </div>

          <div>
            <label>Target Device</label>
            <select
              value={target}
              onChange={(e) =>
                setTarget(e.target.value as "all" | "mobile" | "desktop")
              }
              className="w-full border border-gray-200 rounded px-3 py-2 outline-none"
            >
              <option value="all">🌐 All Devices</option>
              <option value="mobile">📱 Mobile</option>
              <option value="desktop">💻 Desktop</option>
            </select>
          </div>

          {/* Image */}
          <div>
            <label>Slider Media (Image / Video)</label>
            <span className="text-xl/0 text-red-500">*</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />

            {preview &&
              (previewType === "image" ? (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-3 size-full object-cover rounded border"
                />
              ) : (
                <video
                  src={preview}
                  className="mt-3 size-full object-cover rounded border"
                  controls
                  muted
                />
              ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Submitting..." : editData ? "Update" : "Submit"}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSliderForm;
