import { useState } from "react";
import Toggle from "../../global/Toggle";
import { useQueryParams } from "../../hooks/useQueryParams";
import Drawer from "../../global/Drawer";
import { MdDateRange, MdDescription, MdTitle, MdUpdate } from "react-icons/md";
import {
  FaCalendarAlt,
  FaEnvelope,
  FaIdCard,
  FaImage,
  FaMobileAlt,
  FaProductHunt,
  FaRegStar,
  FaRupeeSign,
  FaStar,
  FaTag,
  FaUser,
} from "react-icons/fa";
import { RiFileList3Line, RiPriceTag3Line } from "react-icons/ri";

const getPageNumbers = (totalPages: number, page: number) => {
  const pageNumbers = [];
  const maxVisibleButtons = 5;

  let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

  if (endPage - startPage + 1 < maxVisibleButtons) {
    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  return pageNumbers;
};

export default function ReviewTable({
  reviews,
  pagination,
}: {
  reviews: any[];
  pagination: { total: number; page: number; pages: number };
}) {
  const { page, pages } = pagination;
  const { updateFilters } = useQueryParams();

  const [viewData, setViewData] = useState<any>(null);

  return (
    <>
      <div className="w-full border-collapse flex flex-col">
        <div className="bg-gray-100  text-sm flex flex-row gap-2 items-center">
          <div className="px-2 py-4 text-center flex-1">SL No</div>
          <div className="px-2 py-4 text-center flex-1">Product</div>
          <div className="px-2 py-4 text-center flex-1">Customer Name</div>
          <div className="px-2 py-4 text-center flex-1">Review Date</div>
          <div className="px-2 py-4 text-center flex-1">Review Title</div>
          <div className="px-2 py-4 text-center flex-1">Status</div>
          <div className="px-2 py-4 text-center flex-1">Actions</div>
        </div>
        <div>
          {reviews.map((item, index) => (
            <div
              key={index}
              className="hover:bg-gray-50 text-sm flex flex-row gap-2 items-center w-full "
            >
              <div className="px-2 py-2 text-center flex-1">{index}</div>
              <div className="px-2 py-2 text-center flex-1">
                {item.product.name}
              </div>
              {/* <div className="px-2 py-2 text-center flex-1 flex items-center justify-center">
                <img
                  src={item.coverImage.url}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </div> */}
              <div className="px-2 py-2 text-center flex-1">
                {item.user.name ?? "Certified Customer"}
              </div>
              <div className="px-2 py-2 text-center flex-1">
                {new Date(item.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="px-2 py-2 text-center flex-1 truncate">
                {item.title}
              </div>
              <div className="p-3 text-center flex-1">
                <Toggle
                  name="review"
                  id={item._id}
                  status={item.status === "approved" ? true : false}
                />
              </div>
              <div className="p-2 text-xs flex gap-1 text-blue-600 justify-center items-center flex-1">
                <button onClick={() => setViewData(item)}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 mb-6">
            {/* PREV BUTTON */}
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => updateFilters("page", String(page - 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            {/* PAGE NUMBERS (1, 2, 3...) */}
            {getPageNumbers(pages, page).map((num) => (
              <button
                key={num}
                className={`px-3 py-1 border rounded min-w-8 ${
                  num === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => updateFilters("page", String(num))}
              >
                {num}
              </button>
            ))}

            {/* NEXT BUTTON */}
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${
                page === pages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => updateFilters("page", String(page + 1))}
              disabled={page === pages}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Review Details"
      >
        {viewData && (
          <div className="p-6 space-y-4 text-sm">
            {/* Review Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <RiFileList3Line className="mr-2" />
                  <p>Review ID:</p>
                </div>
                <p className="font-medium ml-6">{viewData._id}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FaTag className="mr-2" />
                  <p>Status:</p>
                </div>
                <div className="ml-6">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      viewData.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : viewData.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {viewData.status.charAt(0).toUpperCase() +
                      viewData.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <FaStar className="mr-2 text-yellow-500" />
                <p>Rating:</p>
              </div>
              <div className="flex items-center ml-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) =>
                    i < viewData.rating ? (
                      <FaStar
                        key={i}
                        className="w-5 h-5 text-yellow-400 mr-1"
                      />
                    ) : (
                      <FaRegStar
                        key={i}
                        className="w-5 h-5 text-gray-300 mr-1"
                      />
                    ),
                  )}
                </div>
                <span className="ml-2 font-medium">{viewData.rating}/5</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MdTitle className="mr-2" />
                  <p>Review Title:</p>
                </div>
                <p className="font-medium p-3 bg-gray-50 rounded ml-6">
                  {viewData.title}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MdDescription className="mr-2" />
                  <p>Review Description:</p>
                </div>
                <p className="p-3 bg-gray-50 rounded whitespace-pre-wrap ml-6">
                  {viewData.description}
                </p>
              </div>
            </div>

            {/* Supporting Files */}
            {viewData.supporting_files &&
              viewData.supporting_files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaImage className="mr-2" />
                    <p>Supporting Images:</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    {viewData.supporting_files.map(
                      (
                        file: { public_id: string; url: string },
                        index: number,
                      ) => (
                        <div
                          key={file.public_id || index}
                          className="border rounded overflow-hidden"
                        >
                          <img
                            src={file.url}
                            alt={`Supporting image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Product Information */}
            <div className="border-t pt-4">
              <div className="flex items-center text-gray-700 mb-3">
                <FaProductHunt className="mr-2" />
                <h3 className="font-medium">Product Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <FaIdCard className="mr-2 text-sm" />
                      <p className="text-sm">Product ID:</p>
                    </div>
                    <p className="font-medium ml-6">
                      {viewData.product.productId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <FaProductHunt className="mr-2 text-sm" />
                      <p className="text-sm">Product Name:</p>
                    </div>
                    <p className="font-medium ml-6">{viewData.product.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-6">
                  {viewData.product.coverImage && (
                    <img
                      src={viewData.product.coverImage.url}
                      alt={viewData.product.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  )}
                  <div>
                    <div className="flex items-center">
                      <FaRupeeSign className="text-sm mr-1" />
                      <p className="font-medium">{viewData.product.price}</p>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FaRupeeSign className="text-xs mr-1" />
                      <p className="line-through text-sm">
                        MRP: {viewData.product.mrp}
                      </p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <RiPriceTag3Line className="text-sm mr-1" />
                      <p className="text-sm">
                        {viewData.product.discount}% off
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="border-t pt-4">
              <div className="flex items-center text-gray-700 mb-3">
                <FaUser className="mr-2" />
                <h3 className="font-medium">Customer Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <FaIdCard className="mr-2 text-sm" />
                      <p className="text-sm">Customer ID:</p>
                    </div>
                    <p className="font-medium ml-6">
                      {viewData.user.customerId}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-2 text-sm" />
                      <p className="text-sm">Name:</p>
                    </div>
                    <p className="font-medium ml-6">{viewData.user.name}</p>
                  </div>
                </div>

                {viewData.user.mobile && (
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <FaMobileAlt className="mr-2 text-sm" />
                      <p className="text-sm">Mobile:</p>
                    </div>
                    <p className="font-medium ml-6">{viewData.user.mobile}</p>
                  </div>
                )}

                {viewData.user.email && (
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-2 text-sm" />
                      <p className="text-sm">Email:</p>
                    </div>
                    <p className="font-medium ml-6">{viewData.user.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="border-t pt-4">
              <div className="flex items-center text-gray-700 mb-3">
                <FaCalendarAlt className="mr-2" />
                <h3 className="font-medium">Timestamps</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-gray-600">
                    <MdDateRange className="mr-2 text-sm" />
                    <p className="text-sm">Created:</p>
                  </div>
                  <p className="font-medium ml-6">
                    {new Date(viewData.createdAt).toLocaleDateString()} at{" "}
                    {new Date(viewData.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-gray-600">
                    <MdUpdate className="mr-2 text-sm" />
                    <p className="text-sm">Last Updated:</p>
                  </div>
                  <p className="font-medium ml-6">
                    {new Date(viewData.updatedAt).toLocaleDateString()} at{" "}
                    {new Date(viewData.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
