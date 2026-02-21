import React from "react";

export interface OrderProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  coverImage: {
    url: string;
    public_id?: string;
  };
}

export interface OrderItem {
  product: OrderProduct;
  quantity: number;
}

export interface CustomerOrder {
  _id: string;
  orderId: string;

  product: OrderProduct;
  quantity: number;
  price: number;
  orderValue: number;

  status: string;
  paymentStatus: string;

  payment?: {
    paymentGroupId: string;
    amount: number;
    method: string;
    status: string;
  };

  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  Processing: "text-yellow-500",
  Confirmed: "text-amber-600",
  Shipped: "text-blue-500",
  InTransit: "text-indigo-500",
  OutForDelivery: "text-purple-500",
  Delivered: "text-green-600",
  Cancelled: "text-red-500",
  RTO: "text-gray-700",
};

const OrderCard = ({ order }: { order: CustomerOrder }) => {
  const product = order.product;

  return (
    <div className="flex flex-col gap-2 rounded-lg p-3 bg-gray-100 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>{order.orderId}</span>
      </div>

      {/* PRODUCT */}
      <div className="flex gap-3">
        {product ? (
          <img
            src={product.coverImage?.url}
            alt={product.name}
            className="w-20 h-20 object-cover rounded"
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-200 text-xs text-gray-500 rounded">
            Product deleted
          </div>
        )}

        <div className="flex-1">
          <p className="font-medium">
            {product ? product.name : "Deleted Product"}
          </p>

          <p className="text-sm text-gray-600">Qty: {order.quantity}</p>

          <p className="font-semibold text-green-600 mt-1">
            ₹{order.orderValue}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {/* PAYMENT */}
        {order.payment && (
          <div className="text-xs text-gray-500">
            Paid via {order.payment.method} • ₹{order.payment.amount}
          </div>
        )}
        <div className={`text-xs ${STATUS_COLORS[order.status]}`}>
          {order.status}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
