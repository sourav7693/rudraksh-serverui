import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import type { AdminOrder } from "../order/OrderManagment";
import toast from "react-hot-toast";

export const STATUS_OPTIONS = ["Processing", "Confirmed", "Cancelled"] as const;

export const STATUS_COLORS: Record<string, string> = {
  Processing: "bg-yellow-500",
  Confirmed: "bg-amber-600",
  Shipped: "bg-blue-500",
  InTransit: "bg-indigo-500",
  OutForDelivery: "bg-purple-500",
  Delivered: "bg-green-600",
  Cancelled: "bg-red-500",
  RTO: "bg-gray-700",
};

const DashBoardOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const limit = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dashboard?page=1&limit=${limit}&search=${search}&status=${statusFilter}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) {
        console.error("Failed to fetch overview data");
        navigate("/admin-login", { replace: true });
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/order/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      fetchOrders();
    }
  };

  const ADMIN_EDITABLE_STATUSES = ["Processing", "Confirmed", "Cancelled"];
  return (
    <div className="flex flex-col gap-4">
      <div className=" font-bold text-defined-blue flex justify-between items-baseline">
        <h1 className="text-2xl">Recent Orders</h1>{" "}
        <Link to="/admin-order" className="text-base">
          View All
        </Link>
      </div>
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          {/* Left Section */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
              }}
              className="bg-defined-white outline-none rounded px-4 py-2"
            >
              <option value="">Filter</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="relative w-full sm:w-auto">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-defined-black" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-defined-white rounded pl-10 pr-4 py-2 outline-none w-full sm:w-[200px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* <button className="bg-defined-white px-4 py-2 rounded">
              Import
            </button> */}

            <button className="bg-defined-white px-4 py-2 rounded">
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto h-80 no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Order ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Order Date</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment Group</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o.orderId} className="hover:bg-gray-50">
                  <td className="p-3">{o.orderId}</td>
                  <td className="p-3">
                    {o.product ? o.product.name : "Product Deleted"}
                  </td>
                  <td className="p-3">{o.customer?.name || o.address?.name}</td>
                  <td className="p-3">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3">{o.quantity}</td>
                  <td className="p-3">₹{o.orderValue}</td>
                  <td className="p-3">{o.payment?.paymentGroupId}</td>

                  <td className="p-3">
                    <select
                      value={o.status}
                      disabled={
                        !ADMIN_EDITABLE_STATUSES.includes(o.status) ||
                        o.status === "Cancelled"
                      }
                      onChange={(e) => {
                        setSelectedOrder(o);
                        setPendingStatus(e.target.value);
                        setConfirmOpen(true);
                      }}
                      className={`text-white p-2 rounded ${STATUS_COLORS[o.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="text-black">
                          {s}
                        </option>
                      ))}
                      {!(STATUS_OPTIONS as readonly string[]).includes(
                        o.status,
                      ) && (
                        <option
                          key={o.status}
                          value={o.status}
                          className="text-black"
                        >
                          {o.status}
                        </option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {confirmOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-80">
              <h3 className="font-semibold text-lg mb-2">
                Confirm Status Change
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Change order <b>{selectedOrder.orderId}</b> status to{" "}
                <b>{pendingStatus}</b>?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-1 border rounded"
                  onClick={() => {
                    setConfirmOpen(false);
                    setPendingStatus(null);
                    setSelectedOrder(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                  onClick={() => {
                    updateOrderStatus(
                      selectedOrder.orderId,
                      pendingStatus as string,
                    );
                    setConfirmOpen(false);
                    setPendingStatus(null);
                    setSelectedOrder(null);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoardOrder;
