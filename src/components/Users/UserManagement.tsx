import Adder from "../../global/Adder";
import { useState, useEffect } from "react";
import Drawer from "../../global/Drawer";
import Toggle from "../../global/Toggle";
import { Link } from "react-router-dom";
import AddUserForm from "./AddUserForm";

export interface UserItem {
  _id: string;
  userId: string;
  username: string;
  password: string;
  mobile: string;
  email: string;
  role: "admin" | "staff";
  permissions: string[];
  createdBy: UserItem;
  status: boolean;
  createdAt: string;
}

const UserManagement = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<UserItem | null>(null);
  const [viewData, setViewData] = useState<UserItem | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user?page=${page}&limit=${limit}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      //  console.log(data.users);
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/user/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = users.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(users.length / limit);

  return (
    <div>
      <Adder
        title="Add User"
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setEditData(null);
          setOpenForm(true);
        }}
      />

      <div className="mt-5 overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600">
                <th className="p-3">Id</th>
                <th className="p-3">Name</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr key={item.userId} className="hover:bg-gray-50 text-sm">
                  <td className="p-3">{item.userId}</td>
                  <td className="p-3">{item.username}</td>
                  <td className="p-3">{item.mobile}</td>
                  <td className="p-3">
                    <Link to={`mailto:${item.email}`}>{item.email}</Link>
                  </td>

                  <td className="p-3">{item.role}</td>

                  <td className="p-3">
                    <Toggle name="user" id={item.userId} status={item.status} />
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
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(item.userId)}
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

      <AddUserForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchUsers}
        editData={editData || undefined}
      />

      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="User Details"
      >
        {viewData && (
          <div className="p-4">
            <p>
              <strong>UserId:</strong> {viewData.userId}
            </p>
            <p>
              <strong>UserName:</strong> {viewData.username}
            </p>
            <p>
              <strong>Mobile:</strong> {viewData.mobile}
            </p>
            <p>
              <strong>Email:</strong> {viewData.email}
            </p>
            <p>
              <strong>User Role:</strong> {viewData.role}
            </p>
            <p>
              <strong>User Access:</strong>{" "}
              {viewData.permissions.length > 0
                ? viewData.permissions.join(", ")
                : "All Access"}
            </p>
            {viewData.createdBy && (
              <p>
                <strong>Created By:</strong> {viewData.createdBy?.username}
              </p>
            )}
            <p>
              <strong>Status:</strong> {viewData.status ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(viewData.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default UserManagement;
