import React from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string; // tailwind width: "w-[420px]" | "w-[500px]"
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  width = "w-[50%]",
  children,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`absolute top-0 right-0 h-full bg-white shadow-xl
        transform transition-transform duration-300
        ${width}
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              className="text-xl leading-none hover:opacity-70 bg-red-500 text-white rounded-full size-6 flex items-center justify-center"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div className="h-[calc(100%-64px)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
