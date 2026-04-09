"use client";

import { useEffect, useState } from "react";
import Drawer from "../../global/Drawer";
import { useQueryParams } from "../../hooks/useQueryParams";
import OrderFilter from "./OrderFilter";
import toast from "react-hot-toast";

// types/adminOrder.ts
export interface AdminOrder {
  orderId: string;
  _id: string; // Needed for the return API

  customer: {
    _id: string;
    name: string;
  };

  mobile: string;

  address: {
    area: string;
    city: string;
    state: string;
    pin: string;
    landmark?: string;
    name?: string;
  };

  cancelReason?: string;

  product: {
    _id: string;
    name: string;
    price: number;
  };

  quantity: number;
  price: number;
  orderValue: number;

  status: string;
  paymentStatus: string;

  payment: {
    paymentGroupId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    method: string;
    amount: number;
    status: string;
  };

  shipping?: {
    currentStatus?: string;
    awbNumber?: string;
    awbError?: string;
  };
  
  returnDetails?: {
    type: "Return" | "Replacement";
    reason: string;
    images: Array<{ public_id: string; url: string }>;
    requestDate: string;
    adminComment?: string;
  };

  createdAt: string;
}

export const STATUS_OPTIONS = ["Processing", "Shipped", "Cancelled"] as const;

export const STATUS_COLORS: Record<string, string> = {
  Processing: "bg-yellow-500",
  Confirmed: "bg-amber-600",
  Shipped: "bg-blue-500",
  InTransit: "bg-indigo-500",
  OutForDelivery: "bg-purple-500",
  Delivered: "bg-green-600",
  Cancelled: "bg-red-500",
  RTO: "bg-gray-700",
  ReturnRequested: "bg-orange-500",
  ReplacementRequested: "bg-orange-500",
  Returned: "bg-gray-600",
  Replaced: "bg-gray-600",
  ReturnRejected: "bg-red-700",
  ReplacementRejected: "bg-red-700",
};

const LIMIT = 10;

const getPageNumbers = (totalPages: number, page: number) => {
  const pageNumbers = [];
  const maxVisibleButtons = 5;

  let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

  if (endPage - startPage + 1 < maxVisibleButtons) {
    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  return pageNumbers;
};

const OrderManagement = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [viewData, setViewData] = useState<AdminOrder | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  
  // State for Return/Replace Admin Comment
  const [adminComment, setAdminComment] = useState("");

  const { getParam, updateFilters } = useQueryParams();

  const search = getParam("search") || "";
  const status = getParam("status") || "";
  const page = Number(getParam("page")) || 1;
  const startDate = getParam("startDate") || "";
  const endDate = getParam("endDate") || "";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/order?page=${page}&limit=${LIMIT}&search=${search}&status=${status}&startDate=${startDate}&endDate=${endDate}`,
      );
      const data = await res.json();
      setOrders(data.orders || []);
      setPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, status, startDate, endDate]);

  // Sync admin comment field when drawer opens
  useEffect(() => {
    if (viewData?.returnDetails) {
      setAdminComment(viewData.returnDetails.adminComment || "");
    } else {
      setAdminComment("");
    }
  }, [viewData]);

  const handleShipNow = async (orderId: string) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/order/${orderId}/ship`,
        { method: "POST" },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Shipment processed");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      fetchOrders();
    }
  };

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
      if (!res.ok) throw new Error(data.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      fetchOrders();
    }
  };

  // Handle Return/Replacement Actions
  const handleReturnAction = async (orderId: string, action: string) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/order/${orderId}/return-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, adminComment }),
        }
      );
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update return status");
      
      toast.success(data.message);
      setViewData(null); // Close drawer
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      fetchOrders();
    }
  };

  const ADMIN_EDITABLE_STATUSES = ["Processing", "Confirmed", "Cancelled"];

  return (
    <>
      <OrderFilter />

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full ">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-3">Order ID</th>
              <th className="p-3">Product</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Order Date</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Total</th>
              {/* ✅ PAYMENT GROUP IS BACK */}
              <th className="p-3">Payment Group</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              const isReturnActive = ["ReturnRequested", "ReplacementRequested"].includes(o.status);

              return (
                <tr
                  key={o.orderId}
                  className={`border-t border-gray-200 transition-colors ${
                    isReturnActive ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3">{o.orderId}</td>
                  <td className="p-3">
                    {o.product ? o.product?.name : "Product Deleted"}
                  </td>
                  <td className="p-3">{o.customer?.name || o.address?.name}</td>
                  <td className="p-3">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3">{o.quantity}</td>
                  <td className="p-3">₹{o.orderValue}</td>
                  {/* ✅ PAYMENT GROUP DATA IS BACK */}
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
                      className={`text-white p-2 rounded text-sm outline-none ${STATUS_COLORS[o.status] || "bg-gray-500"}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="text-black bg-white">
                          {s}
                        </option>
                      ))}
                      {!(STATUS_OPTIONS as readonly string[]).includes(
                        o.status,
                      ) && (
                        <option
                          key={o.status}
                          value={o.status}
                          className="text-black bg-white"
                        >
                          {o.status}
                        </option>
                      )}
                    </select>
                  </td>

                  <td className="p-3 flex flex-row gap-2 items-center justify-start">
                    <button
                      onClick={() => setViewData(o)}
                      className="text-blue-600 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 font-medium"
                    >
                      View
                    </button>

                    {/* 🚚 SHIP / RETRY BUTTON */}
                    {o.status === "Confirmed" && !o.shipping?.awbNumber && (
                      <button
                        onClick={() => handleShipNow(o.orderId)}
                        className="text-purple-600 bg-purple-50 px-3 py-1 rounded hover:bg-purple-100 text-nowrap font-medium"
                      >
                        {o.shipping?.currentStatus === "AWB_FAILED"
                          ? "Retry AWB"
                          : "Ship Now"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 mb-6">
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${page === 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => updateFilters("page", String(page - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            {getPageNumbers(pages, page).map((num) => (
              <button
                key={num}
                className={`px-3 py-1 border rounded min-w-8 ${num === page ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50 text-gray-700"}`}
                onClick={() => updateFilters("page", String(num))}
              >
                {num}
              </button>
            ))}
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${page === pages ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => updateFilters("page", String(page + 1))}
              disabled={page === pages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ================= CONFIRM STATUS ================= */}
      {confirmOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-80 shadow-lg">
            <h3 className="font-semibold mb-3">Confirm Status Change</h3>
            <p className="mb-4 text-sm text-gray-600">
              Change <b>{selectedOrder.orderId}</b> to <b>{pendingStatus}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="px-3 py-1 text-gray-600 border rounded hover:bg-gray-50">Cancel</button>
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                onClick={() => {
                  updateOrderStatus(selectedOrder.orderId, pendingStatus!);
                  setConfirmOpen(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW DRAWER ================= */}
      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Order Details"
      >
        {viewData && (
          <div className="p-6 space-y-4 text-sm">
            
            {/* ================= RETURN & REPLACE SECTION ================= */}
            {viewData.returnDetails && (
              <div className="bg-red-50 p-4 border border-red-200 rounded-lg shadow-sm">
                <h3 className="font-bold text-red-800 mb-3 text-base flex items-center justify-between">
                  {viewData.returnDetails.type} Request
                  <span className={`text-xs text-white px-2 py-1 rounded ${STATUS_COLORS[viewData.status]}`}>
                    {viewData.status}
                  </span>
                </h3>
                
                <div className="space-y-2 mb-4 text-red-900">
                  <p><b>Reason:</b> {viewData.returnDetails.reason}</p>
                  <p><b>Requested On:</b> {new Date(viewData.returnDetails.requestDate).toLocaleDateString()}</p>
                </div>

                {viewData.returnDetails.images?.length > 0 && (
                  <div className="mb-4">
                    <p className="font-semibold mb-2 text-red-900">Uploaded Proof:</p>
                    <div className="flex gap-2">
                      {viewData.returnDetails.images.map((img, i) => (
                        <a key={i} href={img.url} target="_blank" rel="noreferrer" className="block relative w-20 h-20 border-2 border-red-200 rounded overflow-hidden hover:opacity-80 transition-opacity">
                          <img src={img.url} alt="Proof" className="object-cover w-full h-full" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ SIMPLIFIED Return Actions Form */}
                <div className="mt-4 pt-4 border-t border-red-200">
                  <label className="block text-sm font-semibold mb-1 text-red-900">Admin Comment (Optional)</label>
                  <textarea 
                    className="w-full border border-red-300 p-2 rounded text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows={2}
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Note to customer (e.g. 'Approved, please pack the item securely')"
                  />
                  
                  {/* Buttons visible if currently requested */}
                  {["ReturnRequested", "ReplacementRequested"].includes(viewData.status) && (
                    <div className="flex flex-wrap gap-2">
                      {/* Sending "Complete" marks it straight to Returned/Replaced on the backend */}
                      <button 
                        onClick={() => handleReturnAction(viewData._id, "Complete")} 
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50"
                        disabled={loading}
                      >
                        Approve & Resolve
                      </button>

                      {/* Sending "Reject" marks it straight to ReturnRejected/ReplacementRejected */}
                      <button 
                        onClick={() => handleReturnAction(viewData._id, "Reject")} 
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50"
                        disabled={loading}
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {viewData.returnDetails && <hr />}

            {/* BASIC */}
            <div>
              <p>
                <b>Order ID:</b> {viewData.orderId}
              </p>
              <p>
                <b>Customer:</b> {viewData.customer?.name}
              </p>
              <p>
                <b>Mobile:</b> {viewData.mobile}
              </p>
              <p>
                <b>Status:</b> {viewData.status}
              </p>
              {viewData.status === "Cancelled" && (
                <p>
                  <b>Cancel Reason:</b> {viewData?.cancelReason || "N/A"}
                </p>
              )}
              <p>
                <b>Order At:</b>{" "}
                {new Date(viewData.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            <hr />

            {/* PRODUCT */}
            <div>
              <p>
                <b>Product:</b> {viewData.product?.name}
              </p>
              <p>
                <b>Price:</b> ₹{viewData.price}
              </p>
              <p>
                <b>Quantity:</b> {viewData.quantity}
              </p>
              <p>
                <b>Total:</b> ₹{viewData.orderValue}
              </p>
            </div>

            <hr />

            {/* PAYMENT */}
            <div>
              <h3 className="font-semibold mb-1">Payment Details</h3>
              <p>
                <b>Payment Group:</b> {viewData.payment?.paymentGroupId}
              </p>
              <p>
                <b>Razorpay Order ID:</b> {viewData.payment?.razorpayOrderId}
              </p>
              <p>
                <b>Razorpay Payment ID:</b>{" "}
                {viewData.payment?.razorpayPaymentId}
              </p>
              <p>
                <b>Method:</b> {viewData.payment?.method}
              </p>
              <p>
                <b>Amount:</b> ₹{viewData.payment?.amount}
              </p>
              <p>
                <b>Status:</b> {viewData.payment?.status}
              </p>
            </div>

            <hr />

            {/* ADDRESS */}
            <div>
              <h3 className="font-semibold mb-1">Address</h3>
              <p>
                {viewData.address?.area}, {viewData.address?.city},{" "}
                {viewData.address?.state} - {viewData.address?.pin}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default OrderManagement;