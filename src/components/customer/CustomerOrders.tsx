"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useInView } from "react-intersection-observer"; // 1. Import hook
import  OrderCard, { type CustomerOrder } from "./OrderCard";

const CustomerOrders = ({ customerId }: { customerId: string }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 2. Use the hook. 'ref' goes on the loader, 'inView' tells us if it's visible.
  const { ref, inView } = useInView({
    threshold: 0, // Trigger as soon as 1 pixel is visible
    rootMargin: "100px", // Pre-load 100px before the user hits the bottom
  });

  const fetchOrders = useCallback(async () => {
    // Safety check: Don't fetch if already loading or no more data
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/order/customers/${customerId}?page=${page}&limit=20`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (data.data.length === 0) {
        setHasMore(false);
      } else {
        setOrders((prev) => {
          // 3. Duplicate Prevention: 
          // Even if the API is called twice, we filter out orders that already exist in state.
          const existingIds = new Set(prev.map((o) => o._id));
          const uniqueNewOrders = data.data.filter(
            (order: CustomerOrder) => !existingIds.has(order._id)
          );
          return [...prev, ...uniqueNewOrders];
        });
        
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [customerId, page, hasMore, loading]); // Dependencies ensure logic is fresh

  // 4. Single Effect to rule them all
  // We removed the "initial load" useEffect. 
  // Since the list starts empty, the loader (ref) is visible immediately, 
  // so 'inView' becomes true, triggering the first fetch automatically.
  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchOrders();
    }
  }, [inView, fetchOrders, hasMore, loading]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Orders</h3>
      
    <div className="grid grid-cols-3 gap-2">
  {orders.map((order) => (
    <OrderCard
      key={order._id}
      order={order}
    />
  ))}
</div>


      {/* 5. Attach the ref here. When this comes into view, the effect fires. */}
      <div ref={ref} className="h-10 w-full flex justify-center items-center">
        {loading && <p className="text-sm text-gray-500">Loading...</p>}
        {!hasMore && orders.length > 0 && (
          <p className="text-sm text-gray-400">No more orders</p>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;