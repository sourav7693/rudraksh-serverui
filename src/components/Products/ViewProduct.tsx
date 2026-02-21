import type { PickupItem } from "../picup/PickupManagment";
import type { AttributeItem } from "../Attributes/AttributeManagement";
import { FaArrowDownLong } from "react-icons/fa6";

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
  isVariant: boolean;
  parentProduct: ProductItem | null;
  status: boolean;
  weight?: number;
  dimensions?: Array<{
    no_of_box: string;
    length: string;
    width: string;
    height: string;
  }>;
  typeOfPackage?: string;
  returnPolicy?: string;
  createdAt: string;
}

const ViewProduct = ({ viewData }: { viewData: ProductItem }) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <h2 className="text-xl font-semibold mb-2">Cover Image</h2>
      <img
        src={viewData.coverImage.url}
        className="w-32 h-32 object-cover rounded mx-auto mb-3"
      />
      {viewData.images.length > 0 && (
        <h2 className="text-xl font-semibold mb-2">Images:</h2>
      )}
      <div className="grid grid-cols-3 gap-4">
        {viewData.images.map((img) => (
          <img
            key={img.public_id}
            src={img.url}
            className="w-32 h-32 object-cover rounded mx-auto mb-3"
          />
        ))}
      </div>
      <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
        <strong>Name:</strong>{" "}
        <span className="font-semibold">{viewData.name}</span>
      </p>
      <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
        <strong>Brand:</strong>{" "}
        <span className="font-semibold"> {viewData.brand?.name}</span>{" "}
      </p>
      <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
        <strong>Variant Product:</strong>{" "}
        <span className="font-semibold">
          {" "}
          {viewData.isVariant ? "True" : "False"}
        </span>{" "}
      </p>
      <div className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex flex-col gap-2">
        <strong>Short Description:</strong>{" "}
        <p dangerouslySetInnerHTML={{ __html: viewData.shortDescription }}></p>{" "}
      </div>
      <div className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex flex-col gap-2">
        <strong>Long Description:</strong>{" "}
        <p dangerouslySetInnerHTML={{ __html: viewData.longDescription }}></p>{" "}
      </div>
      <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
        <strong>MRP:</strong> ₹{viewData.mrp}
      </p>
      <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
        <strong>Discount:</strong> {viewData.discount}%
      </p>
      <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
        <strong>Price:</strong> ₹{viewData.price}
      </p>
      <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
        <strong>Stock:</strong> {viewData.stock}
      </p>
      <div className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex flex-col gap-2">
        <strong>Belongs to Category:</strong>{" "}
        {viewData?.categoryLevels?.map((cat, index) => (
          <div key={cat._id} className="flex flex-col items-center">
            <span className="font-semibold text-gray-800">{cat.name}</span>

            {/* Arrow only between levels */}
            {index < viewData.categoryLevels.length - 1 && (
              <FaArrowDownLong className="text-green-500 mt-1" />
            )}
          </div>
        ))}
      </div>
      {viewData.pickup && (
        <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
          <strong>Pickup:</strong>{" "}
          <span className="font-semibold"> {viewData.pickup.name}</span>{" "}
        </p>
      )}
      {viewData.variables && (
        <div className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex flex-col gap-2">
          <strong>Variables:</strong>
          <ul className="list-disc list-inside">
            {viewData.variables?.map((variable) => (
              <li key={variable.variableId}>
                <strong>{variable.name}:</strong> {variable.values.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
      {viewData.parentProduct && (
        <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
          <strong>Parent Product ID:</strong>{" "}
          <span className="font-semibold"> {viewData.parentProduct.name}</span>{" "}
        </p>
      )}
      {viewData.variants && viewData.variants.length > 0 && (
        <div className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex flex-col gap-2">
          <strong>Variants:</strong>
          <ul className="list-disc list-inside">
            {viewData.variants.map((variant) => (
              <li key={variant._id}>
                <strong>Name:</strong> {variant.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p>
        <strong>Status:</strong> {viewData.status ? "Active" : "Inactive"}
      </p>
      {/* NEW: Weight */}
      {viewData.weight && (
        <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
          <strong>Weight:</strong>{" "}
          <span className="font-semibold">{viewData.weight}g</span>
        </p>
      )}

      {/* NEW: Type of Package */}
      {viewData.typeOfPackage && (
        <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
          <strong>Package Type:</strong>
          <span className="font-semibold capitalize">
            {viewData.typeOfPackage.replace(/_/g, " ")}
          </span>
        </p>
      )}

      {/* NEW: Return Policy */}
      {viewData.returnPolicy && (
        <p className="bg-amber-50 p-2 border border-gray-200 rounded-xl flex justify-between items-center">
          <strong>Return Policy:</strong>
          <span className="font-semibold capitalize">
            {viewData.returnPolicy.replace(/_/g, " ")}
          </span>
        </p>
      )}

      {/* NEW: Dimensions */}
      {viewData.dimensions && viewData.dimensions.length > 0 && (
        <div className="bg-amber-50 p-2 border border-gray-200 rounded-xl">
          <strong>Dimensions:</strong>
          <div className="mt-2 space-y-1">
            {viewData.dimensions.map((dim, index) => (
              <div
                key={index}
                className="flex gap-2 text-sm bg-white p-2 rounded-md"
              >
                <span>Box {dim.no_of_box}:</span>
                <span>
                  L:{dim.length} W:{dim.width} H:{dim.height} cm
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p>
        <strong>Created:</strong>{" "}
        {new Date(viewData.createdAt).toLocaleString()}
      </p>
    </div>
  );
};

export default ViewProduct;
