import Adder from "../../global/Adder";
import { useState, useEffect } from "react";
import Drawer from "../../global/Drawer";
import Toggle from "../../global/Toggle";
import AddSliderForm from "./AddSliderForm";

export interface SliderItem {
  _id: string;
  sliderId: string;
  name: string;
  image: { public_id: string; url: string };
  status: boolean;
  createdAt: string;
}

const SliderManagement = () => {
     const [openForm, setOpenForm] = useState(false);
      const [editData, setEditData] = useState<SliderItem | null>(null);
      const [viewData, setViewData] = useState<SliderItem | null>(null);
      const [sliders, setSliders] = useState<SliderItem[]>([]);
      const [search, setSearch] = useState("");
      const [loading, setLoading] = useState(false);
      const [page, setPage] = useState(1);
      const limit = 10;
    
    const fetchSliders = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/slider?page=${page}&limit=${limit}`
        );
        const data = await res.json();
        setSliders(data.sliders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
      useEffect(() => {
        fetchSliders();
      }, [page]);
    
      const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
          const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/slider/${id}`, {
            method: "DELETE",
          });
    
          if (res.ok) fetchSliders();
        } catch (err) {
          console.error(err);
        }
      };
    
      const filtered = sliders.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    
      const totalPages = Math.ceil(sliders.length / limit);
    
  return (
      <>
          {/* FILTER + ACTIONS */}
          <Adder
            title="Add Slider"
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
                    <th className="p-3">Id</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Image</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
    
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.sliderId} className="hover:bg-gray-50 text-sm">
                      <td className="p-3">{item.sliderId}</td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">
                        <img
                          src={item.image.url}
                          alt={item.name}
                          className="w-20"
                        />
                      </td>
    
                      <td className="p-3">
                        <Toggle
                          name="slider"
                          id={item.sliderId}
                          status={item.status}
                        />
                      </td>
    
                      <td className="p-3 flex gap-2 text-blue-600">
                        <button onClick={() => setViewData(item)}>View</button> |                       
                        <button
                          className="text-red-600"
                          onClick={() => handleDelete(item.sliderId)}
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
          <AddSliderForm
            open={openForm}
            onClose={() => setOpenForm(false)}
            onSuccess={fetchSliders}
            editData={editData || undefined}
          />
    
          <Drawer
            open={!!viewData}
            onClose={() => setViewData(null)}
            title="Slider Details"
          >
            {viewData && (
              <div className="p-4">
                <p>
                  <strong>Name:</strong> {viewData.name}
                </p>
                <p>
                  <strong>Image:</strong> 
                  <img
                    src={viewData.image.url}
                    alt={viewData.name}
                    className="w-20"
                  />
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
  )
}

export default SliderManagement