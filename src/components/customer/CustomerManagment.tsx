"use client";
import { FiSearch } from "react-icons/fi";
import type { ImageItem, ProductItem } from "../Products/ViewProduct";
import { useEffect, useState } from "react";
import Drawer from "../../global/Drawer";
import ViewCustomers from "./ViewCustomers";
import toast from "react-hot-toast";
import axios from "axios";
import { useQueryParams } from "../../hooks/useQueryParams";

export interface CustomerItem {
  _id?: string;
  customerId: string;
  name: string;
  email: string;
  mobile: string;
  gender: string;
  avatar: ImageItem;
  addresses?: Array<{
    _id: ProductItem;
    type: string;
    name: string;
    mobile: string;
    area: string;
    city: string;
    state: string;
    pin: string;
    landmark: string;
    alternateMobile: string;
  }>;
  cart: Array<{
    productId: ProductItem;
    variantId?: ProductItem;
    quantity: number;
    priceAtTime: number;
  }>;
  wishlist: Array<{
    product: ProductItem;
    status: boolean;
  }>;

  totalOrders: number;
  totalSpent: number;
  rewards: {
    points: number;
    tier: string;
  };
  giftCards: Array<{
    code: string;
    balance: number;
    expiry: Date;
  }>;
  recentlyViewed: ProductItem[];
  notifications: Array<{
    title: string;
    message: string;
    createdAt: Date;
  }>;

  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

const CustomerManagment: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [viewData, setViewData] = useState<CustomerItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { getParam, updateFilters } = useQueryParams();

  const page = Number(getParam("page")) || 1;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/customer?page=${page}&limit=${limit}`,
      );
      const data = await res.json();
      setCustomers(data.customer || []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(customers.length / limit);

  async function handleUpdate(id: string, updatedStatus: boolean) {
    const conf = confirm(
      `Are you sure you want to ${
        updatedStatus ? "activate" : "deactivate"
      } this customer?`,
    );
    if (!conf) return;
    try {
      const { data, status } = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/customer/${id}`,
        { status: updatedStatus },
      );
      if (status === 200) {
        toast.success(data.message);
        fetchCustomers();
        return;
      }
      throw Error;
    } catch (error: any) {
      console.error("Error updating customer:", error.message);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update customer.",
      );
    }
  }

  return (
    <>
      {/* FILTER + ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <select className="bg-defined-white outline-none rounded px-4 py-2">
            <option value="">Filter</option>
          </select>

          <div className="relative w-full sm:w-auto">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-defined-black" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-defined-white rounded pl-10 pr-4 py-2 outline-none w-full sm:w-[200px]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="bg-defined-white px-4 py-2 rounded">
            Export CSV
          </button>

          <select className="bg-defined-white outline-none rounded px-4 py-2">
            <option value="">Delete Select</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Customer Name</th>

              <th className="p-3">Reg. Date</th>
              <th className="p-3">Total Spent</th>
              {/* <th className="p-3">Total Orders</th> */}
              <th className="p-3">Address</th>
              <th className="p-3">PIN</th>
              <th className="p-3">Mobile</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((item) => {
              const primaryAddress = item.addresses?.length
                ? item.addresses[0]
                : null;
              return (
                <tr key={item.customerId} className="hover:bg-gray-50">
                  <td className="p-3">{item.customerId}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">{item.totalSpent}</td>
                  <td className="p-3 truncate">
                    {primaryAddress
                      ? `${primaryAddress.area}, ${primaryAddress.city}, ${primaryAddress.state}`
                      : "—"}
                  </td>

                  <td className="p-3">{primaryAddress?.pin ?? "—"}</td>

                  <td className="p-3">{item.mobile}</td>

                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleUpdate(item._id!, !item.status)}
                    >
                      {item.status ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </button>
                  </td>

                  <td className="p-3 flex gap-2 text-blue-600">
                    <button onClick={() => setViewData(item)}>View</button>
                  </td>
                </tr>
              );
            })}
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

      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Customer Details"
        width="w-[75%]"
      >
        {viewData && <ViewCustomers viewData={viewData} />}
      </Drawer>
    </>
  );
};

export default CustomerManagment;
