import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const DashBoardOverView = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState({
    newOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalExpense: 0,
  });

  const overviews = [
    {
      title: "New Orders",
      value: overview?.newOrders?.toString(),
    },
    {
      title: "Orders Pending",
      value: overview.pendingOrders.toString(),
    },
    {
      title: "Total Customers",
      value: overview.totalCustomers.toString(),
    },
    {
      title: "Total Orders",
      value: overview.totalOrders.toString(),
    },
    {
      title: "Total Expense",
      value: "₹" + overview.totalExpense.toString(),
    },
  ];

  useEffect(() => {
    const fetchOverview = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/dashboard/overview`,
        {
          credentials: "include",
        },
      );
      if(!res.ok) {
        console.error("Failed to fetch overview data");
        navigate("/admin-login", { replace: true });
        return;
      }
      const data = await res.json();
      setOverview(data.overview);
    };

    fetchOverview();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-defined-blue">OverView</h1>
      <div className="flex justify-between gap-3.5">
        {overviews?.map((item, index) => (
          <div
            key={index}
            className="bg-[#E8EBF2] p-4 rounded-md flex flex-col justify-center items-center flex-1"
          >
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <span className="font-bold text-defined-blue text-xl">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashBoardOverView;
