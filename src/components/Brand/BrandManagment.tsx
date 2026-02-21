import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import AddBrandForm from "./AddBrandForm";
import Drawer from "../../global/Drawer";
import Adder from "../../global/Adder";
import Toggle from "../../global/Toggle";

export interface BrandItem {
  _id: string;
  brandId: string;
  name: string;
  image: { public_id: string; url: string };
  status: boolean;
  createdAt: string;
}

const BrandManagment: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<BrandItem | null>(null);
  const [viewData, setViewData] = useState<BrandItem | null>(null);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [popupKey, setPopupKey] = useState(0);


  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/brand?page=${page}&limit=${limit}`);
      const data = await res.json();
      setBrands(data.brands || []);     
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/brand/${id}`, { method: "DELETE" });
      if (res.ok) fetchBrands();
    } catch (err) { console.error(err); }
  };

  const filteredBrands = brands.filter(
    p => p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(brands.length / limit);

  return (
    <>
      {/* FILTER + ACTIONS */}
      <Adder
        title="Add Brand"
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setPopupKey((k) => k + 1);
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
                {/* <th className="p-3"><input type="checkbox"/></th> */}
                <th className="p-3">Id</th>
                <th className="p-3">Name</th>
                <th className="p-3">Logo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.map((item) => (
                <tr key={item.brandId} className="hover:bg-gray-50 text-sm">
                  <td className="p-3">{item.brandId}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">
                    <img
                      src={item.image.url}
                      alt={item.name}
                      className="size-15 object-cover"
                    />
                  </td>
                  <td className="p-3">                   
                    <Toggle name = "brand" id={item.brandId} status={item.status} />
                  </td>
                  <td className="p-3 flex gap-2 text-blue-600">
                    <button onClick={() => setViewData(item)}>View</button> |
                    <button
                      onClick={() => {
                        setPopupKey((k) => k + 1);
                        setEditData(item);
                        setOpenForm(true);
                      }}
                    >
                      Edit
                    </button>{" "}
                    |
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(item.brandId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded ${
              i + 1 === page ? "bg-blue-500 text-white" : ""
            }`}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ADD / EDIT FORM */}
      <AddBrandForm
      key={popupKey}
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchBrands}
        editData={editData || undefined}
      />

      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Brand Details"
      >
        {viewData && (
          <div className="p-5 space-y-4 text-sm">
            <div>
              <p className="text-gray-500">Brand Name</p>
              <p className="font-medium text-xl">{viewData.name}</p>
            </div>

            <div>
              <p className="text-gray-500 mb-2">Logo</p>
              <img
                src={viewData.image.url}
                alt={viewData.name}
                className="w-40 h-40 object-cover rounded border"
              />
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                  viewData.status
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {viewData.status ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <p className="text-gray-500">Created At</p>
              <p>{new Date(viewData.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default BrandManagment;
