import { useState, useEffect } from "react";
import type { CouponItem } from "./CouponManagment";

interface AddCouponFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CouponItem;
}

const AddCouponForm: React.FC<AddCouponFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load edit data
  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setCode(editData.code);
      setDiscountType(editData.discountType);
      setDiscountValue(editData.discountValue);
      setMinOrderAmount(editData.minOrderAmount);
      setMaxDiscountAmount(editData.maxDiscountAmount);
      setStartDate(editData.startDate.split("T")[0]);
      setExpirationDate(editData.expirationDate.split("T")[0]);
      setUsageLimit(editData.usageLimit);
      setStatus(editData.status);
    } else {
      setCode("");
      setName("");
      setDiscountType("percentage");
      setDiscountValue(0);
      setMinOrderAmount(0);
      setMaxDiscountAmount(0);
      setStartDate("");
      setExpirationDate("");
      setUsageLimit(0);
      setStatus(true);
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if ( !code) {
      return alert("Coupon ID & Code are required!");
    }

    const body = {
      name,
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      expirationDate,
      usageLimit,
      status,
    };

    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_BASE_URL}/api/coupon`;
      let method: "POST" | "PUT" = "POST";

      if (editData?.couponId) {
        url += `/${editData.couponId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert(editData ? "Coupon updated!" : "Coupon added!");
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

      <div className="relative ml-auto w-full sm:w-[750px] h-full bg-white shadow-xl overflow-y-auto p-5">
        <div className="flex justify-between items-center border-b border-gray-200 outline-none placeholder:text-gray-500-b pb-3">
          <h2 className="text-xl font-semibold">
            {editData ? "Edit Coupon" : "Add Coupon"}
          </h2>
          <button className="text-2xl" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">          

          {/* Code */}
          <div>            
            <input
              type="text"
              value={name}
              placeholder="Coupon Name"
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
            />
          </div>
          <div>            
            <input
              type="text"
              value={code}
              placeholder="Coupon Code"
              onChange={(e) => setCode(e.target.value)}
              className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
            />
          </div>

          {/* Discount Type */}
          <div>            
            <select
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as "percentage" | "fixed")
              }
              className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
            >
              <option value="">Select Discount Type</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label>Discount Value</label>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Minimum Order Amount</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
              />
            </div>

            <div>
              <label>Max Discount Amount</label>
              <input
                type="number"
                value={maxDiscountAmount}
                
                onChange={(e) => setMaxDiscountAmount(Number(e.target.value))}
                className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
              />
            </div>

            <div>
              <label>Expiration Date</label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Usage Limit */}
          <div>
            <label>Usage Limit</label>
            <input
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(Number(e.target.value))}
              className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
            />
          </div>

          {/* Status */}
          {editData && (
            
          <div>
            <label>Status</label>
            <select
              value={status ? "true" : "false"}
              onChange={(e) => setStatus(e.target.value === "true")}
              className="w-full border border-gray-200 outline-none placeholder:text-gray-500 rounded px-3 py-2"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : editData ? "Update" : "Submit"}
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

export default AddCouponForm;
