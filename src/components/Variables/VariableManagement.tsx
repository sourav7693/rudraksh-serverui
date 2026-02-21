import { useState, useEffect } from "react";
import AddVariableForm from "./AddVariableForm";
import Drawer from "../../global/Drawer";
import Adder from "../../global/Adder";
import Toggle from "../../global/Toggle";

export interface VariableItem {
  _id: string;
  variableId: string;
  name: string;
  value: string[];
  status: boolean;
  createdAt: string;
}

const VariableManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<VariableItem | null>(null);
  const [viewData, setViewData] = useState<VariableItem | null>(null);
  const [variables, setVariables] = useState<VariableItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [popupKey, setPopupKey] = useState(0);


  const fetchVariables = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/variable?page=${page}&limit=${limit}`
      );
      const data = await res.json();
      setVariables(data.variables || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariables();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/variable/${id}`, {
        method: "DELETE",
      });

      if (res.ok) fetchVariables();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = variables.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(variables.length / limit);

  return (
    <>
      {/* FILTER + ACTIONS */}
      <Adder
        title="Add Variable"
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
                <th className="p-3">Values</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.variableId} className="hover:bg-gray-50 text-sm">
                  <td className="p-3">{item.variableId}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.value.join(", ")}</td>

                  <td className="p-3">
                    <Toggle
                      name="variable"
                      id={item.variableId}
                      status={item.status}
                    />
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
                    </button>
                    |
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(item.variableId)}
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
      <AddVariableForm
      key={popupKey}
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchVariables}
        editData={editData || undefined}
      />

      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Variable Details"
      >
        {viewData && (
          <div className="p-4">
            <p>
              <strong>Name:</strong> {viewData.name}
            </p>
            <p>
              <strong>Values:</strong> {viewData.value.join(", ")}
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
    </>
  );
};

export default VariableManagement;
