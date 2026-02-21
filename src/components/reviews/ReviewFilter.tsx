import { FiSearch } from "react-icons/fi";
import { useQueryParams } from "../../hooks/useQueryParams";

export default function ReviewFilter() {
  const { getParam, updateFilters, setMultipleParams } = useQueryParams();

  const search = getParam("search") || "";
  const minRating = getParam("minRating") || 0;
  const status = getParam("status") || "";
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <select
        className="bg-defined-white outline-none rounded px-4 py-2"
        value={status}
        onChange={(e) =>
          setMultipleParams({
            page: "1",
            status: e.target.value,
          })
        }
      >
        <option value="">Filter</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <div className="relative w-full sm:w-auto">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-defined-black" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-defined-white/60 rounded pl-10 pr-4 py-2 outline-none  w-[20rem]"
          value={search}
          onChange={(e) =>
            setMultipleParams({
              page: "1",
              search: e.target.value,
            })
          }
        />
      </div>
      <div className="relative w-full sm:w-auto flex items-center gap-2">
        <label className="mr-2 text-base font-medium">Rating</label>
        <div>
          <input
            type="range"
            min={0}
            max={5}
            step="1"
            value={minRating}
            onChange={(e) =>
              setMultipleParams({
                page: "1",
                minRating: e.target.value === "0" ? "" : e.target.value,
              })
            }
            className="
        w-full 
          h-2 
          bg-defined-white 
          rounded-lg 
          appearance-none 
          cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-defined-blue
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-white
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-defined-blue
          [&::-moz-range-thumb]:border-2
          [&::-moz-range-thumb]:border-white
          "
          />
          <div className="flex justify-between text-sm text-defined-black">
            {Array.from({ length: 5 }, (_, i) => 0 + i).map((num) => (
              <span key={num}>{num}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
