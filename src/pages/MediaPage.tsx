import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiImage,
  FiVideo,
  FiTrash2,
  FiEdit3,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiPlay,
} from "react-icons/fi";
import AddMedia from "../components/mediaComp/AddMedia";

import ReactPlayer from "react-player";

const MediaPage = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Form States
  const [type, setType] = useState("image");
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    status: "active",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/media?page=${page}&limit=8&type=${typeFilter}`,
      );
      setMediaList(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [page, typeFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024) {
        alert("File size exceeds 1MB limit!");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setType("image");
    setFormData({ name: "", url: "", status: "active" });
    setFile(null);
    setPreview("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();
    data.append("type", type);
    data.append("status", formData.status);

    if (type === "image") {
      data.append("imageName", formData.name);
      if (file) data.append("file", file);
    } else {
      data.append("videoName", formData.name);
      data.append("videoUrl", formData.url);
      if (file) data.append("thumbnail", file);
    }

    try {
      if (editingItem) {
        await axios.put(
          `${import.meta.env.VITE_BASE_URL}/api/media/${editingItem._id}`,
          data,
        );
      } else {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/media`, data);
      }
      resetForm();
      fetchMedia();
    } catch (err) {
      alert("Save failed");
    } finally{
        setIsSaving(false)
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === "active" ? "inactive" : "active";
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/media/${item._id}`,
        { status: newStatus },
      );
      fetchMedia();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/media/${id}`);
        fetchMedia();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setType(item.type);
    setFormData({
      name: item.type === "image" ? item.image.imageName : item.video.videoName,
      url: item.type === "video" ? item.video.videoUrl : "",
      status: item.status,
    });
    setPreview(
      item.type === "image" ? item.image.secureUrl : item.video.thumbnailUrl,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen text-slate-700 font-sans">
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-10"
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-5 right-5 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all z-[110]"
            >
              <FiX size={24} />
            </button>
            <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
              <ReactPlayer
                src={selectedVideo}
                controls
                playing
                width="100%"
                height="100%"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Media Management
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Organize and upload hospital images and surgery videos.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: SHARED FORM COMPONENT */}
        <div className="lg:col-span-4">
          <AddMedia
            type={type}
            setType={setType}
            formData={formData}
            setFormData={setFormData}
            preview={preview}
            handleFileChange={handleFileChange}
            handleSave={handleSave}
            editingItem={editingItem}
            resetForm={resetForm}
            isSaving={isSaving}
          />
        </div>

        {/* RIGHT COLUMN: LISTING */}
        <div className="lg:col-span-8 space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full bg-slate-50 border-none pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-defined-blue outline-none text-sm"
              />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {["", "image", "video"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${typeFilter === t ? "bg-white shadow-sm text-defined-blue" : "text-slate-400"}`}
                >
                  {t || "All"}
                </button>
              ))}
            </div>
          </div>

          {/* LIST OF ASSETS */}
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 animate-pulse"
                >
                  <div className="h-16 w-24 bg-slate-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : mediaList.length === 0 ? (
              <div className="bg-white py-20 rounded-2xl border border-slate-200 text-center">
                <FiImage className="mx-auto text-5xl text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-400 tracking-tight">
                  No assets found
                </h3>
              </div>
            ) : (
              <AnimatePresence>
                {mediaList.map((item: any) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    key={item._id}
                    className={`group bg-white p-3 rounded-2xl border transition-all flex items-center gap-4 ${editingItem?._id === item._id ? "border-defined-blue ring-4 ring-defined-blue/10" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div
                      className={`relative h-16 w-24 flex-shrink-0 rounded-xl overflow-hidden shadow-inner ${item.type === "video" ? "cursor-pointer" : ""}`}
                      onClick={() =>
                        item.type === "video" &&
                        setSelectedVideo(item.video.videoUrl)
                      }
                    >
                      <img
                        src={
                          item.type === "image"
                            ? item.image.secureUrl
                            : item.video.thumbnailUrl
                        }
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        alt="media"
                      />
                      <div className="absolute top-1 right-1 bg-white shadow-sm p-1 rounded-lg">
                        {item.type === "image" ? (
                          <FiImage className="text-defined-blue text-xs" />
                        ) : (
                          <FiVideo className="text-amber-600 text-xs" />
                        )}
                      </div>

                      {/* Play overlay for video */}
                      {item.type === "video" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                            <FiPlay className="text-defined-blue text-xs fill-current" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate text-sm">
                        {item.type === "image"
                          ? item.image.imageName
                          : item.video.videoName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
                        {item.type} • Added{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pr-2">
                      {/* iOS Style Toggle */}
                      <button
                        onClick={() => toggleStatus(item)}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.status === "active" ? "bg-defined-blue" : "bg-slate-200"}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.status === "active" ? "translate-x-4" : "translate-x-0"}`}
                        />
                      </button>

                      <div className="h-8 w-[1px] bg-slate-100 mx-1" />

                      <div className="flex items-center gap-3 pr-2">
                        {/* EDIT BUTTON GROUP */}
                        <div className="relative group/edit flex items-center justify-center">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-defined-blue transition-all duration-300 active:scale-90"
                          >
                            <FiEdit3 size={18} />
                          </button>

                          {/* Edit Tooltip - triggers ONLY on group/edit hover */}
                          <div className="absolute bottom-full mb-3 flex flex-col items-center scale-0 group-hover/edit:scale-100 transition-all duration-200 origin-bottom opacity-0 group-hover/edit:opacity-100 pointer-events-none z-30">
                            <div className="bg-defined-blue text-white text-[10px] font-black tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl shadow-indigo-100 whitespace-nowrap uppercase">
                              Edit Asset
                            </div>
                            <div className="w-2 h-2 bg-defined-blue rotate-45 -mt-1"></div>
                          </div>
                        </div>

                        {/* DELETE BUTTON GROUP */}
                        <div className="relative group/delete flex items-center justify-center">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 active:scale-90"
                          >
                            <FiTrash2 size={18} />
                          </button>

                          {/* Delete Tooltip - triggers ONLY on group/delete hover */}
                          <div className="absolute bottom-full mb-3 flex flex-col items-center scale-0 group-hover/delete:scale-100 transition-all duration-200 origin-bottom opacity-0 group-hover/delete:opacity-100 pointer-events-none z-30">
                            <div className="bg-rose-600 text-white text-[10px] font-black tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl shadow-rose-100 whitespace-nowrap uppercase">
                              Delete Permanently
                            </div>
                            <div className="w-2 h-2 bg-rose-600 rotate-45 -mt-1"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* PAGINATION */}
          <div className="mt-8 flex items-center justify-between bg-white p-3 px-5 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-20 transition-all"
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-20 transition-all"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPage;
