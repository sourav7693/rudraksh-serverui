import { useState, useEffect } from "react";
import AddProductForm from "./AddProductForm";
import Drawer from "../../global/Drawer";
import type { PickupItem } from "../picup/PickupManagment";
import type { AttributeItem } from "../Attributes/AttributeManagement";

import ViewProduct from "./ViewProduct";

import Adder from "../../global/Adder";
import Toggle from "../../global/Toggle";
import { useQueryParams } from "../../hooks/useQueryParams";

export interface CategoryNode {
  _id: string;
  name: string;
  type?: string;
  status: boolean;
  image?: { public_id: string; url: string };
  children: CategoryNode[];
}

export interface BrandItem {
  _id: string;
  brandId: string;
  name: string;
  image: { public_id: string; url: string };
  status: boolean;
}

export interface ImageItem {
  public_id: string;
  url: string;
  _id?: string;
}

type SpecificationItem = {
  name: string;
  details: string;
};

type DimensionType = {
  no_of_box: string;
  length: string;
  width: string;
  height: string;
};

export type TypeOfPackage =
  | "PLANT_BOX"
  | "PLANT_MAILER"
  | "NURSERY_POT_WRAP"
  | "POLY_BAG"
  | "GIFT_BOX"
  | "SERVICE_ONLY";

export type TypeOfReturn =
  | "RETURN_ONLY"
  | "REPLACEMENT_ONLY"
  | "RETURN_AND_REPLACEMENT"
  | "NO_RETURN_NO_REPLACEMENT";

export interface ProductItem {
  _id: string;
  productId: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  mrp: number;
  price: number;
  stock: number;
  discount: number;
  coverImage: ImageItem;
  pickup?: PickupItem;
  variables?: { variableId: string; name: string; values: string[] }[];
  variants?: ProductItem[];
  attributes?: AttributeItem[];
  images: ImageItem[];
  brand: BrandItem | null;
  categoryLevels: CategoryNode[];
  specifications: SpecificationItem[];
  isVariant: boolean;
  parentProduct: ProductItem | null;
  status: boolean;
  weight: number;
  dimensions: DimensionType[];
  typeOfPackage: TypeOfPackage;
  returnPolicy: TypeOfReturn;
  createdAt: string;
}

const ProductManagement: React.FC = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<ProductItem | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [viewData, setViewData] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;
  const [popupKey, setPopupKey] = useState(0);

  const { getParam, updateFilters } = useQueryParams();

  const search = getParam("search") || "";
  const status = getParam("status") || "";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/product?page=${page}&limit=${limit}&q=${encodeURIComponent(search)}&status=${status}`,
      );
      const data = await res.json();
      setProducts(data.data || []);
      const totalCount = data.pagination?.totalCount || 0;
      setTotalProducts(totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    fetchProducts();
  }, [page, search, status]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`${import.meta.env.VITE_BASE_URL}/api/product/${id}`, {
        method: "DELETE",
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(totalProducts / limit);

  const getPageNumbers = () => {
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

  return (
    <>
      <Adder
        title="Add Product"
        search={search}
        setSearch={(value) => updateFilters("search", value)}
        onAdd={() => {
          setEditData(null);
          setOpenForm(true);
          setPopupKey((k) => k + 1);
        }}
        status={status}
        setStatus={(value) => updateFilters("status", value)}
      />

      {/* TABLE */}
      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="w-full border-collapse flex flex-col">
            <div>
              <div className="bg-gray-100  text-sm flex flex-row gap-2 items-center">
                <div className="px-2 py-4 text-center flex-1">ID</div>
                <div className="px-2 py-4 text-center flex-1">Name</div>
                <div className="px-2 py-4 text-center flex-1">Category</div>
                <div className="px-2 py-4 text-center flex-1">Cover</div>
                <div className="px-2 py-4 text-center flex-1">MRP</div>
                <div className="px-2 py-4 text-center flex-1">Price</div>
                <div className="px-2 py-4 text-center flex-1">Discount</div>
                <div className="px-2 py-4 text-center flex-1">Stock</div>
                <div className="px-2 py-4 text-center flex-1">Type</div>
                <div className="px-2 py-4 text-center flex-1">Status</div>
                <div className="px-2 py-4 text-center flex-1">Actions</div>
              </div>
            </div>
            <div>
              {products.map((item) => (
                <div
                  key={item.productId}
                  className="hover:bg-gray-50 text-sm flex flex-row gap-2 items-center w-full "
                >
                  <div className="px-2 py-2 text-center flex-1">
                    {item.productId}
                  </div>
                  <div className="px-2 py-2 text-center flex-1">
                    {item.name}
                  </div>
                  <div className="px-2 py-2 text-center flex-1">
                    {item.categoryLevels[0]?.name}
                  </div>
                  <div className="px-2 py-2 text-center flex-1 flex items-center justify-center mx-auto">
                    <img
                      src={item.coverImage.url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded self-center"
                    />
                  </div>
                  <div className="px-2 py-2 text-center flex-1">
                    ₹{item.mrp}
                  </div>
                  <div className="px-2 py-2 text-center flex-1">
                    ₹{item.price}
                  </div>
                  <div className="px-2 py-2 text-center flex-1">
                    {item.discount}%
                  </div>
                  <div className="px-2 py-2 text-center flex-1">
                    {item.stock}
                  </div>
                  <div className="px-2 py-2 text-center flex-1">
                    {item.isVariant ? "Variant" : "Simple"}
                  </div>
                  <div className="p-3 text-center flex-1">
                    <Toggle name="product" id={item._id} status={item.status} />
                  </div>
                  <div className="p-2 text-xs flex gap-1 text-blue-600 justify-center items-center flex-1">
                    <button onClick={() => setViewData(item)}>View</button>|
                    <button
                      onClick={() => {
                        setEditData(item);
                        setOpenForm(true);
                      }}
                    >
                      Edit
                    </button>
                    {/* | */}
                    {/* <button
                      className="text-red-600"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-4">
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 mb-6">
            {/* PREV BUTTON */}
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${
                page === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>

            {/* PAGE NUMBERS (1, 2, 3...) */}
            {getPageNumbers().map((num) => (
              <button
                key={num}
                className={`px-3 py-1 border rounded min-w-[32px] ${
                  num === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
                onClick={() => setPage(num)}
              >
                {num}
              </button>
            ))}

            {/* NEXT BUTTON */}
            <button
              className={`px-3 py-1 border rounded bg-white hover:bg-gray-100 ${
                page === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT FORM */}
      <AddProductForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchProducts}
        editData={editData || undefined}
        key={popupKey}
      />

      <Drawer
        open={!!viewData}
        onClose={() => setViewData(null)}
        title="Product Details"
      >
        {viewData && <ViewProduct viewData={viewData} />}
      </Drawer>
    </>
  );
};

export default ProductManagement;
