import { FiSearch } from "react-icons/fi";

interface ToolbarProps {
  title: string;
  search: string;
  setSearch: (value: string) => void;
  onAdd?: () => void;
  status?: string;
  setStatus?: (value: string) => void;
}

const Adder: React.FC<ToolbarProps> = ({
  title,
  search,
  setSearch,
  onAdd,
  status,
  setStatus,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Left Section */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <select
          className="bg-defined-white outline-none rounded px-4 py-2"
          value={status}
          onChange={(e) => setStatus && setStatus(e.target.value)}
        >
          <option value="">Filter</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <div className="relative w-full sm:w-auto">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-defined-black" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-defined-white/60 rounded pl-10 pr-4 py-2 outline-none  w-[20rem]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button
          className="bg-defined-blue text-white px-4 py-2 rounded font-semibold"
          onClick={onAdd}
        >
          {title}
        </button>
      </div>
    </div>
  );
};

export default Adder;
