"use client";
import { useState, useEffect } from "react";
import type { SliderItem } from "./SliderManagement";

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
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load edit data
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setPreview(editData.image.url);
      setStatus(editData.status ?? true);
      setImageFile(null);
    } else {
      setName("");
      setPreview("");
      setStatus(true);
      setImageFile(null);
    }
  }, [editData, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      alert("Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    // For update → image is optional
    if (imageFile) {
      formData.append("image", imageFile);
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
        alert(editData ? "Slider updated!" : "Slider added!");
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      alert("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative ml-auto w-full sm:w-[750px] h-full bg-white shadow-2xl overflow-y-auto p-5">
        <div className="flex justify-between items-center border-b pb-3">
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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Image */}
          <div>
            <label>Slider Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded px-3 py-2"
            />

            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-3 w-32 h-32 object-cover rounded border"
              />
            )}
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
