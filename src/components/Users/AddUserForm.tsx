import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { UserItem } from "./UserManagement";

const AVAILABLE_PERMISSIONS = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Products", value: "products" },
  { label: "Users", value: "users" },
  { label: "Orders", value: "orders" },
  { label: "Customers", value: "customers" },
  { label: "Categories", value: "category" },
  { label: "Brands", value: "brand" },
  { label: "Pickup", value: "pickup" },
  { label: "Attributes", value: "attributes" },
  { label: "Variables", value: "variables" },
  { label: "Coupons", value: "coupon" },
  { label: "Slider", value: "slider" },
  { label: "Bulk Marketing", value: "bulk_marketing" },
];


interface AddUserFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: UserItem;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
  const [username, setUserName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setUserName(editData.username);
      setMobile(editData.mobile);
    setPassword(editData.password);
    
      setEmail(editData.email);
      setRole(editData.role);
      setPermissions(editData.permissions);
    } else {
      setUserName("");
      setMobile("");
     setRole("");
      setPermissions([]);
      setPassword("");
      setEmail("");      
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    if (!username || !email || !mobile || !password || !role) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = { username, email, mobile, password, role, permissions };

    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_BASE_URL}/api/user`;
      let method = "POST";

      if (editData?.userId) {
        url += `/${editData.userId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editData ? "User updated!" : "New User added!");
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
        <div className="flex justify-between items-center border-b border-gray-200 outline-none-b pb-3">
          <h2 className="text-xl font-semibold">
            {editData ? "Edit Pickup" : "Add Pickup"}
          </h2>
          <button className="text-2xl" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border border-gray-200 outline-none rounded px-3 py-2"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border border-gray-200 outline-none rounded px-3 py-2"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 outline-none rounded px-3 py-2"
            />
          </div>

          <div>
            <input
              placeholder="Password"
              type={`${editData ? "text" : "password"}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 outline-none rounded px-3 py-2"
            />
          </div>

          <div>
            <select
              value={role}
              onChange={(e) => {
                const selectedRole = e.target.value;
                setRole(selectedRole);
                if (selectedRole === "admin") {
                  setPermissions([]);
                }
              }}
              className="w-full border border-gray-200 outline-none rounded px-3 py-2"
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Permissions – STAFF ONLY */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              role === "staff"
                ? "max-h-[300px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            {role === "staff" && (
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Assign Access
                </label>

                <select
                  multiple
                  value={permissions}
                  onChange={(e) =>
                    setPermissions(
                      Array.from(e.target.selectedOptions, (o) => o.value)
                    )
                  }
                  className="w-full border border-gray-200 outline-none rounded px-3 py-2 min-h-[120px]"
                >
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <option key={perm.value} value={perm.value}>
                      {perm.label}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl / Cmd to select multiple permissions
                </p>
              </div>
            )}
          </div>

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

export default AddUserForm;
