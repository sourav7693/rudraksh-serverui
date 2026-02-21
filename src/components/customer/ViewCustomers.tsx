import React from 'react'
import type { CustomerItem } from './CustomerManagment'
import CustomerOrders from './CustomerOrders'

const ViewCustomers = ({viewData}:{viewData:CustomerItem}) => {
  const primaryAddress = viewData.addresses?.[0] ?? null;
  return (
    <div className="p-6 overflow-y-auto h-full">
            {/* BASIC INFO */}
            <div className="space-y-2 text-sm">
              <p>
                <b>ID:</b> {viewData.customerId}
              </p>
              <p>
                <b>Name:</b> {viewData.name}
              </p>
              <p>
                <b>Email:</b> {viewData.email}
              </p>
              <p>
                <b>Mobile:</b> {viewData.mobile}
              </p>
              <p>
                <b>Gender:</b> {viewData.gender}
              </p>
              <p>
                <b>Status:</b>{" "}
                <span
                  className={
                    viewData.status ? "text-green-600" : "text-red-600"
                  }
                >
                  {viewData.status ? "Active" : "Inactive"}
                </span>
              </p>
            </div>

            <hr className="my-4" />

            {/* ADDRESS */}
            <div>
              <h3 className="font-medium mb-2">Address</h3>
             {primaryAddress ? (
    <p className="text-sm text-gray-600">
      {primaryAddress.area}, {primaryAddress.city},{" "}
      {primaryAddress.state} - {primaryAddress.pin},{" "}
      {primaryAddress.landmark}
    </p>
  ) : (
    <p className="text-sm text-gray-400">No address</p>
  )}
            </div>

            <hr className="my-4" />

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Orders</p>
                <p className="font-semibold">{viewData.totalOrders}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Spent</p>
                <p className="font-semibold">₹{viewData.totalSpent}</p>
              </div>
            </div>

            <hr className="my-4" />

            {/* WISHLIST */}
            <div>
              <h3 className="font-medium mb-2">Wishlist</h3>
              {viewData.wishlist?.length > 0 ? (
                <div className="text-sm  grid grid-cols-2 gap-4 space-y-1">
                  {viewData.wishlist
                    .filter((w) => w.status)
                    .map((w, i) => (
                      <div
                        key={w.product.productId}
                        className="border border-gray-200 p-3 rounded flex flex-col gap-3"
                      >
                        <p key={i}>Name: {w.product?.name}</p>
                        <p key={i}>Price: ₹{w.product?.price}</p>
                        <img
                          src={w.product?.coverImage.url}
                          alt={w.product?.name}
                          className="size-30"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No wishlist items</p>
              )}
            </div>
            <CustomerOrders customerId={viewData._id || ""} />
          </div>
  )
}

export default ViewCustomers
