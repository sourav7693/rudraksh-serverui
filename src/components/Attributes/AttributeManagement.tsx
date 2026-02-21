import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import AddAttributeForm from "./AddAttributeForm";
import Drawer from "../../global/Drawer";
import Adder from "../../global/Adder";
import Toggle from "../../global/Toggle";

export interface AttributeItem {
  _id: string;
  attributeId: string;
  name: string;
  status: boolean;
  createdAt: string;
}

const AttributeManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<AttributeItem | null>(null);
  const [viewData, setViewData] = useState<AttributeItem | null>(null);
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [popupKey, setPopupKey] = useState(0);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/attribute?page=${page}&limit=${limit}`,
      );
      const data = await res.json();
      setAttributes(data.attributes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/attribute/${id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) fetchAttributes();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = attributes.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(attributes.length / limit);

  return (
    <>
      {/* FILTER + ACTIONS */}
      <Adder
        title="Add Attribute"
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
                <th className="p-3">Id</th>
                <th className="p-3">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.attributeId} className="hover:bg-gray-50 text-sm">
                  <td className="p-3">{item.attributeId}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">
                    <Toggle
                      name="attribute"
                      id={item.attributeId}
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
                    </button>
                    |
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(item.attributeId)}
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
      <AddAttributeForm
        key={popupKey}
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchAttributes}
        editData={editData || undefined}
      />
      {/* VIEW POPUP */}
      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Attribute Details"
      >
        {viewData && (
          <div className="p-5 space-y-4 text-sm">
            <div>
              <p className="text-gray-500">Attribute Name</p>
              <p className="font-medium">{viewData.name}</p>
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

export default AttributeManagement;
