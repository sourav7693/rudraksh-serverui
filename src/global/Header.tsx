import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import toast from "react-hot-toast";

interface NavLinkItem {
  label: string;
  path?: string;
  submenu?: { label: string; path: string; permission?: string }[];
  permission?: string;
}

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const navDropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const { user, setUser } = useAuth();
  console.log("User in header:", user);
  const navigate = useNavigate();
  const navLinks: NavLinkItem[] = [
    { label: "Dashboard", path: "/" },
    { label: "Products", path: "/admin-products", permission: "products" },
    { label: "Customers", path: "/admin-customers", permission: "customers" },
    { label: "Category", path: "/admin-category", permission: "category" },
    { label: "Orders", path: "/admin-order", permission: "orders" },
    {
      label: "Marketing & Promotions",
      submenu: [
        { label: "Coupon", path: "/admin-coupon", permission: "coupon" },
        {
          label: "Bulk Marketing",
          path: "/admin-bulk-marketing",
          permission: "bulk_marketing",
        },
      ],
    },
    {
      label: "Master",
      submenu: [
        { label: "PickUp", path: "/admin-pickup", permission: "pickup" },
        { label: "Brands", path: "/admin-brand", permission: "brand" },
        {
          label: "Attributes",
          path: "/admin-attributes",
          permission: "attributes",
        },
        {
          label: "Variables",
          path: "/admin-variables",
          permission: "variables",
        },
        { label: "Reviews", path: "/admin-reviews", permission: "reviews" },
      ],
    },
    {
      label: "Settings",
      submenu: [
        { label: "Slider", path: "/admin-slider", permission: "slider" },
        {
          label: "Communication Provider",
          path: "/settings/communication-provider",
          permission: "communication_provider",
        },
        { label: "Users", path: "/admin-users", permission: "users" },
      ],
    },
  ];

  // handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        navDropdownRef.current &&
        !navDropdownRef.current.contains(e.target as Node) &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const logoutUser = async () => {
   try {
     setUser(null);
     const res = await api("/api/user/logout");
     if (res.data.success) {
       navigate("/admin-login", { replace: true });
       toast.success(res.data.message);
     }
   } catch (err) {
     console.log(err);
     toast.error("Something went wrong");
   }
  };

  const canAccess = (permission?: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (!permission) return true;
    return user.permissions.includes(permission);
  };

  return (
    <header className="md:px-10 px-4 w-full flex justify-between items-center border-b border-gray-300 h-20 shadow z-50 bg-white">
      {/* Left Logo */}
      <div>
        <img
          src="/logo.svg"
          alt="logo"
          className=" h-[4rem] w-[16rem] object-contain"
        />
      </div>

      {/* Navigation */}
      <nav
        className="flex items-center gap-5 xl:gap-8 relative"
        ref={navDropdownRef}
      >
        {navLinks.map((item, idx) => {
          if (item.submenu) {
            const allowedSubmenu = item.submenu.filter((sub) =>
              canAccess(sub.permission),
            );

            if (allowedSubmenu.length === 0) return null;
          }
          const isParentActive = item.submenu
            ? item.submenu.some((sub) => sub.path === location.pathname)
            : location.pathname === item.path;
          if (!canAccess(item.permission)) return null;
          return (
            <div
              key={idx}
              onMouseEnter={() => {
                if (item.submenu) setDropdownOpen(item.label);
              }}
              // HOVER: Mouse Leave closes it
              onMouseLeave={() => setDropdownOpen(null)}
              className="relative"
            >
              {item.submenu ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(
                      dropdownOpen === item.label ? null : item.label,
                    );
                  }}
                  className={`font-semibold  rounded flex items-center gap-2 transition-all duration-500 text-base xlg:text-sm lg:text-xs ${
                    dropdownOpen === item.label || isParentActive
                      ? "text-white bg-defined-blue px-3 py-1"
                      : "text-defined-brown hover:bg-defined-blue hover:text-white hover:px-3 hover:py-1"
                  }`}
                >
                  {item.label}

                  {/* Dropdown Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                    className={`size-3 transform transition-transform duration-300 ${
                      dropdownOpen === item.label ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </button>
              ) : (
                <Link
                  to={item.path!}
                  className={`font-semibold  rounded transition-all duration-500 text-base xlg:text-sm lg:text-xs ${
                    location.pathname === item.path
                      ? "text-white bg-defined-blue px-3 py-1"
                      : "text-defined-brown hover:bg-defined-blue hover:text-white hover:px-3 hover:py-1"
                  }`}
                >
                  {item.label}
                </Link>
              )}

              {/* Dropdown Menu */}
              {item.submenu && dropdownOpen === item.label && (
                <div className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg rounded xlg:w-[13rem] w-[10rem] animate-dropdown z-50">
                  {item.submenu
                    .filter((sub) => canAccess(sub.permission))
                    .map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        to={sub.path}
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      >
                        {sub.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Dropdown */}
      <div className="relative" ref={userDropdownRef}>
        <img
          src="/svgs/user.svg"
          alt="user"
          className="w-8 cursor-pointer hover:scale-110 transition-transform duration-300"
          onClick={(e) => {
            e.stopPropagation();
            setDropdownOpen(dropdownOpen === "user" ? null : "user");
          }}
        />

        {dropdownOpen === "user" && (
          <div className="absolute right-0 top-14 w-48 bg-white border border-gray-200 rounded shadow-lg animate-dropdown z-50">
            <div className="px-4 py-3 text-gray-800 font-semibold border-b border-gray-200">
              {user?.username}
              <div className="text-xs text-gray-500 capitalize">
                {user?.role}
              </div>
            </div>

            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer">
              Forgot Password
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
              onClick={logoutUser}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
