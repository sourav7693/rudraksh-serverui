"use client";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import AddCouponForm from "./AddCouponForm";
import Drawer from "../../global/Drawer";
import Adder from "../../global/Adder";
import Toggle from "../../global/Toggle";

export interface CouponItem {
  couponId: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  expirationDate: string;
  usageLimit: number;
  status: boolean;
  createdAt: string;
}

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<CouponItem | null>(null);
  const [viewData, setViewData] = useState<CouponItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/coupon?page=${page}&limit=${limit}`
      );
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`${import.meta.env.VITE_BASE_URL}/api/coupon/${id}`, {
      method: "DELETE",
    });

    fetchCoupons();
  };

  const filtered = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(coupons.length / limit);

  return (
    <>
      {/* Filters + Actions */}
      <Adder
        title="Add Coupon"
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setEditData(null);
          setOpenForm(true);
        }}
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>

              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => (
              <tr key={item.couponId} className="hover:bg-gray-50">
                <td className="p-3">{item.couponId}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.code}</td>
                <td className="p-3">{item.discountType}</td>
                <td className="p-3">{item.discountValue}{item.discountType === "percentage" ? "%" : ""}</td>

                <td className="p-3">
                  <Toggle
                    name="coupon"
                    id={item.couponId}
                    status={item.status}
                  />
                </td>

                <td className="p-3 flex gap-2 text-blue-600">
                  <button onClick={() => setViewData(item)}>View</button> |
                  <button
                    onClick={() => {
                      setEditData(item);
                      setOpenForm(true);
                    }}
                  >
                    Edit
                  </button>{" "}
                  |
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(item.couponId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      <AddCouponForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchCoupons}
        editData={editData || undefined}
      />

      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Coupon Details"
      >
        {viewData && (
          <div className="p-5">
            <p>
              <strong>ID:</strong> {viewData.couponId}
            </p>
            <p>
              <strong>Code:</strong> {viewData.code}
            </p>
            <p>
              <strong>Type:</strong> {viewData.discountType}
            </p>
            <p>
              <strong>Discount:</strong> {viewData.discountValue}
            </p>
            <p>
              <strong>Min Order:</strong> {viewData.minOrderAmount}
            </p>
            <p>
              <strong>Max Discount:</strong> {viewData.maxDiscountAmount}
            </p>
            <p>
              <strong>Usage Limit:</strong> {viewData.usageLimit}
            </p>
            <p>
              <strong>Status:</strong> {viewData.status ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Start:</strong>{" "}
              {new Date(viewData.startDate).toLocaleString()}
            </p>
            <p>
              <strong>Expire:</strong>{" "}
              {new Date(viewData.expirationDate).toLocaleString()}
            </p>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default CouponManagement;
