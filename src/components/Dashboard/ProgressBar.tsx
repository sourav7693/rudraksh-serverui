import axios from "axios";
import { useEffect, useState } from "react";
import CircularStat from "./CircularStat";
import { useNavigate } from "react-router-dom";

type CircularStats = {
  customerVsCart: number;
  cartVsOrder: number;
};

const ProgressBar = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CircularStats>({
    customerVsCart: 0,
    cartVsOrder: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/dashboard/circular-stats`,
        { withCredentials: true },
      );
      if (res.status !== 200) {
        console.error("Failed to fetch overview data");
        navigate("/admin-login", { replace: true });
        return;
      }

      const { customerVsCart, cartVsOrder } = res.data;

      setStats({
        customerVsCart,
        cartVsOrder,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 w-[25%]">
      <CircularStat title="Customer Reg Vs Cart" value={stats.customerVsCart} />
      <CircularStat title="Cart Vs Order" value={stats.cartVsOrder} />
    </div>
  );
};

export default ProgressBar;
