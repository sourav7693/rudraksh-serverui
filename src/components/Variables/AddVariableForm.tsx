import React, { useEffect, useState } from "react";
import type { VariableItem } from "./VariableManagement";

interface VariableFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: VariableItem;
}

const AddVariableForm: React.FC<VariableFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
  const isEdit = Boolean(editData);

  const [name, setName] = useState("");
  const [value, setValue] = useState<string[]>([""]);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setValue(editData.value);
      setStatus(editData.status);
    } else {
      setName("");
      setValue([""]);
      setStatus(true);
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = { name, value, status };

    try {
      const url = isEdit
        ? `${import.meta.env.VITE_BASE_URL}/api/variable/${editData?.variableId}`
        : `${import.meta.env.VITE_BASE_URL}/api/variable`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (index: number, val: string) => {
    const updated = [...value];
    updated[index] = val;
    setValue(updated);
  };

  const addValueField = () => {
    setValue([...value, ""]);
  };

  const removeValueField = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    setValue(updated);
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-lg w-[40%] p-5 transition-transform duration-300 z-50 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >

      <div className="flex justify-between items-center  pb-3">
      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Edit Variable" : "Add Variable"}
      </h2>
      <button className="text-2xl" onClick={onClose}>
            ×
          </button>
</div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* NAME */}
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* VALUE ARRAY */}
        <div>
          <label className="block text-sm font-semibold mb-1">Values</label>

          {value.map((val, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                className="w-full border rounded px-3 py-2 outline-none"
                value={val}
                onChange={(e) => handleValueChange(idx, e.target.value)}
              />
              {idx > 0 && (
                <button
                  type="button"
                  className="bg-red-500 text-white px-2 rounded"
                  onClick={() => removeValueField(idx)}
                >
                  -
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="text-blue-600 text-sm"
            onClick={addValueField}
          >
            + Add more
          </button>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 mt-3">
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-defined-blue text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVariableForm;
