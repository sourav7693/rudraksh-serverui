import React from 'react';
import { motion } from 'framer-motion';
import { FiImage, FiVideo, FiUploadCloud, FiCheckCircle, FiX, FiLoader } from 'react-icons/fi';

interface AddMediaProps {
  type: string;
  setType: (type: string) => void;
  formData: any;
  setFormData: (data: any) => void;
  preview: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (e: React.FormEvent) => void;
  editingItem: any;
  resetForm: () => void;
  isSaving: boolean; // New Prop for loading state
}

const AddMedia: React.FC<AddMediaProps> = ({
  type, setType, formData, setFormData, preview, 
  handleFileChange, handleSave, editingItem, resetForm, isSaving 
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">
          {editingItem ? "Edit Asset" : "Add New Asset"}
        </h2>
        {editingItem && (
          <button
            onClick={resetForm}
            className="text-slate-400 hover:text-rose-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            disabled={!!editingItem || isSaving}
            onClick={() => setType("image")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${type === "image" ? "bg-white shadow-sm text-defined-blue font-bold" : "text-slate-500 opacity-60"}`}
          >
            <FiImage /> Image
          </button>
          <button
            type="button"
            disabled={!!editingItem || isSaving}
            onClick={() => setType("video")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${type === "video" ? "bg-white shadow-sm text-defined-blue font-bold" : "text-slate-500 opacity-60"}`}
          >
            <FiVideo /> Video
          </button>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block tracking-wider">
            Asset Name<span className="text-xl/0 text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-defined-blue outline-none transition-all placeholder:text-slate-300"
            placeholder={
              type === "image" ? "e.g., 2 Mukhi Rudraksha" : "e.g., Rudraksha"
            }
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isSaving}
          />
        </div>

        {type === "video" && (
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block tracking-wider">
              Video URL<span className="text-xl/0 text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-defined-blue outline-none transition-all placeholder:text-slate-300"
              placeholder="https://youtube.com/..."
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              required
              disabled={isSaving}
            />
          </div>
        )}

        <div className="relative group">
          <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block tracking-wider">
            {type === "image" ? "Upload Image" : "Video Thumbnail"}{" "}
            <span className="text-[10px] lowercase font-normal">(Max 1MB)</span>{" "}
            <span className="text-xl/0 text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-2 hover:border-defined-blue transition-colors bg-slate-50 text-center cursor-pointer relative overflow-hidden min-h-[140px] flex items-center justify-center">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={isSaving}
            />
            {preview ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={preview}
                className="h-32 w-full object-cover rounded-xl"
                alt="Preview"
              />
            ) : (
              <div className="py-4">
                <FiUploadCloud className="mx-auto text-3xl text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 font-medium">
                  Click to upload
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
            isSaving
              ? "bg-slate-400 cursor-not-allowed text-white"
              : editingItem
                ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100 text-white"
                : "bg-defined-blue hover:bg-red-800 shadow-indigo-100 text-white"
          }`}
        >
          {isSaving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <FiLoader className="text-xl" />
            </motion.div>
          ) : (
            <>
              <FiCheckCircle /> {editingItem ? "Update Asset" : "Save Asset"}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddMedia;