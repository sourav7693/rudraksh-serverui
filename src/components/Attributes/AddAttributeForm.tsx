import { useState, useEffect } from "react";
import type { AttributeItem } from "./AttributeManagement";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: AttributeItem | null;
}

const AddAttributeForm: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(editData ? editData.name : "");
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!name.trim()) return alert("Name required");

    setLoading(true);
    const method = editData ? "PUT" : "POST";
    const url = editData
      ? `${import.meta.env.VITE_BASE_URL}/api/attribute/${editData.attributeId}`
      : `${import.meta.env.VITE_BASE_URL}/api/attribute`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert(data.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>

      <div className="relative ml-auto bg-white w-full sm:w-[450px] h-full p-5 shadow-xl">
        <h2 className="text-lg font-semibold border-b pb-3">
          {editData ? "Edit Attribute" : "Add Attribute"}
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label>Name</label>
            <input
              className="border w-full px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button
            className={`w-full py-2 text-white rounded ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : editData ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAttributeForm;
