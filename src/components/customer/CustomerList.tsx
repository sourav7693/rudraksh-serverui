"use client";
import React from "react";

interface CustomerItem {
  id: number;
  slNo: string;
  customer_name: string;
  reg_date: string;
  totalspent: string;
  address: string;
  mobile: string;
  status: string;
}

interface CustomerListProps {
  data: CustomerItem[];
}

const CustomerList: React.FC<CustomerListProps> = ({ data }) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-gray-100 text-sm text-gray-600">
            <th className="p-3">
              <input type="checkbox" />
            </th>
            <th className="p-3">SL No</th>
            <th className="p-3">Customer Name</th>
            <th className="p-3">Reg Date</th>
            <th className="p-3">Total Spent</th>
            <th className="p-3">Address</th>
            <th className="p-3">Mobile No</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="text-sm hover:bg-gray-50">
              <td className="p-3">
                <input type="checkbox" />
              </td>
              <td className="p-3">{item.slNo}</td>
              <td className="p-3">{item.customer_name}</td>
              <td className="p-3">{item.reg_date}</td>
              <td className="p-3">{item.totalspent}</td>
              <td className="p-3">{item.address}</td>
              <td className="p-3">{item.mobile}</td>

              <td className="p-3">
                {item.status === "Active" ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded">
                    De-active
                  </span>
                )}
              </td>

              <td className="p-3 text-blue-600 flex gap-3">
                <button>View</button> |
                <button>Edit</button> |
                <button className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
