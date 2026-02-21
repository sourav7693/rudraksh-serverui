"use client";

import { useEffect, useState } from "react";
import Drawer from "../../global/Drawer";
import { useQueryParams } from "../../hooks/useQueryParams";
import OrderFilter from "./OrderFilter";
import toast from "react-hot-toast";

// types/adminOrder.ts
export interface AdminOrder {
  orderId: string;

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

  createdAt: string;
}

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`${import.meta.env.VITE_BASE_URL}/api/order/${id}`, {
      method: "DELETE",
    });

    fetchOrders();
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
              <th className="p-3">Payment Group</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr
                key={o.orderId}
                className="hover:bg-gray-50 border-t border-gray-200"
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

                <td className="p-3 flex flex-row gap-2">
                  <button
                    onClick={() => setViewData(o)}
                    className=" text-blue-600"
                  >
                    View
                  </button>
                  {/* <button
                    className="text-red-600"
                    onClick={() => handleDelete(o.orderId)}
                  >
                    Delete
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 mb-6">
            {/* PREV BUTTON */}
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => updateFilters("page", String(page - 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            {/* PAGE NUMBERS (1, 2, 3...) */}
            {getPageNumbers(pages, page).map((num) => (
              <button
                key={num}
                className={`px-3 py-1 border rounded min-w-8 ${
                  num === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => updateFilters("page", String(num))}
              >
                {num}
              </button>
            ))}

            {/* NEXT BUTTON */}
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${
                page === pages ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-80">
            <h3 className="font-semibold mb-3">Confirm Status Change</h3>
            <p className="mb-4 text-sm">
              Change <b>{selectedOrder.orderId}</b> to <b>{pendingStatus}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded"
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
