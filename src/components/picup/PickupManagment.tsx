import { useState, useEffect } from "react";
import AddPickupForm from "./AddPicupForm";
import Drawer from "../../global/Drawer";
import Adder from "../../global/Adder";
import Toggle from "../../global/Toggle";
import toast from "react-hot-toast";
import { useQueryParams } from "../../hooks/useQueryParams";

export interface PickupItem {
  _id: string;
  pickupId: string;
  pickup_location: string;
  name: string;
  email: string;
  phone: string; // should be number for shiprocket
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string; // should be number for shiprocket
  pickup_id?: string; // shiprocket pickup_id
  status?: boolean;
  createdAt: string;
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

const PickupManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<PickupItem | null>(null);
  const [viewData, setViewData] = useState<PickupItem | null>(null);
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState(1);
  const limit = 10;

  const { getParam, updateFilters } = useQueryParams();

  const page = Number(getParam("page")) || 1;

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/pickup?page=${page}&limit=${limit}`,
      );
      const data = await res.json();
      setPickups(data.pickups || []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/pickup/${id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok) throw Error(data.message);
      toast.success("Pickup deleted successfully");
      fetchPickups();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete pickup",
      );
    }
  };

  const filteredPickups = pickups.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.pin_code.includes(search),
  );

  const totalPages = Math.ceil(pickups.length / limit);

  return (
    <>
      {/* FILTER + ACTIONS */}
      <Adder
        title="Add Pickup"
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setEditData(null);
          setOpenForm(true);
        }}
      />

      {/* TABLE */}
      <div className="mt-5 overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Address</th>
                <th className="p-3">Pin</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPickups.map((item) => (
                <tr key={item.pickupId} className="hover:bg-gray-50 text-sm">
                  <td className="p-3">{item.pickupId}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.address}</td>
                  <td className="p-3">{item.pin_code}</td>
                  <td className="p-3">{item.phone}</td>
                  <td className="p-3">
                    <Toggle
                      name="pickup"
                      id={item.pickupId}
                      status={item.status}
                    />
                  </td>
                  <td className="p-3 flex gap-2 text-blue-600">
                    <button onClick={() => setViewData(item)}>View</button>
                    {/* <button
                      onClick={() => {
                        setEditData(item);
                        setOpenForm(true);
                      }}
                    >
                      Edit
                    </button>{" "}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600"
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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

      {/* ADD / EDIT FORM */}
      <AddPickupForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchPickups}
        editData={editData || undefined}
      />

      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Pickup Details"
      >
        {viewData && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-3">Pickup Details</h2>
            <p>
              <strong>Name:</strong> {viewData.name}
            </p>
            <p>
              <strong>Mobile:</strong> {viewData.phone}
            </p>
            <p>
              <strong>Address:</strong> {viewData.address}
            </p>
            <p>
              <strong>Pin:</strong> {viewData.pin_code}
            </p>
            <p>
              <strong>Status:</strong> {viewData.status ? "Active" : "Deactive"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(viewData.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </Drawer>

      {/* VIEW POPUP */}
    </>
  );
};

export default PickupManagement;
