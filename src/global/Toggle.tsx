import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Toggle = ({
  name,
  id,
  status,
}: {
  name: string;
  id: string;
  status?: boolean;
}) => {
  const [toggle, setToggle] = useState(status);

  const handleToggle = async () => {
    const newStatus = !toggle;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/${name}/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const dada = await res.json();
      if (!res.ok) throw Error(dada.message || `Failed to update ${name}`);
      toast.success(`${name.toUpperCase()} updated successfully`);
      setToggle(newStatus);
    } catch (error: any) {
      toast.error(error.message || `Failed to update ${name}`);
      console.error("Error updating product state:", error);
    }
  };

  useEffect(() => {
    setToggle(status);
  }, [status]);

  return (
    <label className="inline-flex items-center cursor-pointer relative">
      <input
        checked={toggle}
        onChange={handleToggle}
        type="checkbox"
        className="sr-only peer"
      />

      <div
        className={`relative w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full ${
          toggle ? "peer-checked:bg-blue-600" : "dark:bg-gray-700"
        } transition-all`}
      ></div>
      <div
        className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-all ${
          toggle
            ? "peer-checked:translate-x-full"
            : "rtl:peer-checked:-translate-x-full"
        } `}
      ></div>
    </label>
  );
};

export default Toggle;
