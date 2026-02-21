import { FiCalendar, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useEffect, useState } from "react";

export default function OrderFilter() {
  const { getParam, setMultipleParams } = useQueryParams();

  const search = getParam("search") || "";
  const status = getParam("status") || "";
  const startDate = getParam("startDate") || "";
  const endDate = getParam("endDate") || "";

  const handleDateRangeApply = (newStartDate: string, newEndDate: string) => {
    setMultipleParams({
      page: "1",
      startDate: newStartDate || "",
      endDate: newEndDate || "",
    });
  };

  const handleDateRangeClear = () => {
    setMultipleParams({
      page: "1",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Left Section */}
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
          {[
            "Processing",
            "Confirmed",
            "Cancelled",
            "Shipped",
            "InTransit",
            "OutForDelivery",
            "Delivered",
            "RTO",
          ].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
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

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onApply={handleDateRangeApply}
          onClear={handleDateRangeClear}
        />
      </div>
    </div>
  );
}

const DateRangePicker = ({
  startDate,
  endDate,
  onApply,
  onClear,
}: {
  startDate: string;
  endDate: string;
  onApply: (startDate: string, endDate: string) => void;
  onClear: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");

  const handleApply = () => {
    onApply(localStartDate, localEndDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onClear();
    setIsOpen(false);
  };

  // Update local state when props change
  useEffect(() => {
    setLocalStartDate(startDate || "");
    setLocalEndDate(endDate || "");
  }, [startDate, endDate]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${
          startDate || endDate
            ? "bg-defined-blue/10 border-defined-blue text-defined-blue"
            : "bg-defined-white border-defined-gray hover:bg-gray-50"
        }`}
      >
        <FiCalendar className="w-4 h-4" />
        <span className="text-sm">
          {startDate && endDate
            ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
            : startDate
              ? `From ${new Date(startDate).toLocaleDateString()}`
              : endDate
                ? `Until ${new Date(endDate).toLocaleDateString()}`
                : "Date Range"}
        </span>
        <FiChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Picker Card */}
          <div className="absolute right-0 mt-2 z-50 bg-defined-white rounded-lg shadow-lg border border-defined-gray min-w-[320px] p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-defined-black">
                Select Date Range
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-defined-gray rounded"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm text-defined-black mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-defined-gray w-4 h-4" />
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    max={localEndDate}
                    className="w-full pl-10 pr-3 py-2 border border-defined-gray rounded focus:border-defined-blue focus:ring-1 focus:ring-defined-blue outline-none"
                  />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm text-defined-black mb-1">
                  End Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-defined-gray w-4 h-4" />
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    min={localStartDate}
                    className="w-full pl-10 pr-3 py-2 border border-defined-gray rounded focus:border-defined-blue focus:ring-1 focus:ring-defined-blue outline-none"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setLocalStartDate(today);
                    setLocalEndDate(today);
                  }}
                  className="text-sm px-3 py-2 border border-defined-gray rounded hover:bg-defined-gray/50 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const dateStr = yesterday.toISOString().split("T")[0];
                    setLocalStartDate(dateStr);
                    setLocalEndDate(dateStr);
                  }}
                  className="text-sm px-3 py-2 border border-defined-gray rounded hover:bg-defined-gray/50 transition-colors"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => {
                    const start = new Date();
                    start.setDate(start.getDate() - 7);
                    const end = new Date();
                    setLocalStartDate(start.toISOString().split("T")[0]);
                    setLocalEndDate(end.toISOString().split("T")[0]);
                  }}
                  className="text-sm px-3 py-2 border border-defined-gray rounded hover:bg-defined-gray/50 transition-colors"
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => {
                    const start = new Date();
                    start.setDate(start.getDate() - 30);
                    const end = new Date();
                    setLocalStartDate(start.toISOString().split("T")[0]);
                    setLocalEndDate(end.toISOString().split("T")[0]);
                  }}
                  className="text-sm px-3 py-2 border border-defined-gray rounded hover:bg-defined-gray/50 transition-colors"
                >
                  Last 30 days
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2 border border-defined-gray rounded hover:bg-defined-gray/50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleApply}
                  disabled={!localStartDate && !localEndDate}
                  className={`flex-1 px-4 py-2 rounded transition-colors ${
                    !localStartDate && !localEndDate
                      ? "bg-defined-gray/50 text-gray-400 cursor-not-allowed"
                      : "bg-defined-blue text-defined-white hover:bg-defined-blue/90"
                  }`}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
