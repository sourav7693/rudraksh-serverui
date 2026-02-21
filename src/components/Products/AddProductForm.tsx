import type { AttributeItem } from "../Attributes/AttributeManagement";
import type { BrandItem } from "../Brand/BrandManagment";
import type { CategoryNode } from "../category/AddCategoryForm";
import type { VariableItem } from "../Variables/VariableManagement";
import type { ProductItem } from "./ProductManagement";
import { useState, useEffect, useRef } from "react";

import "quill/dist/quill.snow.css";
import type { PickupItem } from "../picup/PickupManagment";
import WordLikeDescriptionBox from "../../global/WordLikeDescriptionBox";
import SpecificationInProduct from "./SpecificationInProduct";
const api = import.meta.env.VITE_BASE_URL;
interface AddProductProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: ProductItem;
}

type SpecificationItem = {
  name: string;
  details: string;
};

const AddProductForm: React.FC<AddProductProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"Simple" | "Variable">("Simple");
  const [backendAttributes, setBackendAttributes] = useState<AttributeItem[]>(
    [],
  );
  const [backendBrands, setBackendBrands] = useState<BrandItem[]>([]);
  const [backendPickup, setBackendPickup] = useState<PickupItem[]>([]);
  const [backendVariables, setBackendVariables] = useState<VariableItem[]>([]);
  const [backendCategories, setBackendCategories] = useState<CategoryNode[]>(
    [],
  );
  const [categoryLevel, setCategoryLevel] = useState<string[]>([]);
  const [variables, setVariables] = useState<
    { name: string; values: string[] }[]
  >([]);

  const [attributes, setAttributes] = useState<string[]>([]);
  const [brand, setBrand] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [longDescription, setLongDescription] = useState<string>("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [preview, setPreview] = useState<string>("");
  const [mrp, setMrp] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [stock, setStock] = useState(0);
  const [pickup, setPickup] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [searchParent, setSearchParent] = useState("");
  const [parentResults, setParentResults] = useState<ProductItem[]>([]);
  const [selectedParent, setSelectedParent] = useState<ProductItem | null>(
    null,
  );

  const [specifications, setSpecifications] = useState<SpecificationItem[]>([]);
  const specsInitializedRef = useRef(false);

  // NEW STATES
  const [weight, setWeight] = useState(0);
  const [dimensions, setDimensions] = useState([
    { no_of_box: "1", length: "", width: "", height: "" },
  ]);
  const [typeOfPackage, setTypeOfPackage] = useState("PLANT_BOX");
  const [returnPolicy, setReturnPolicy] = useState("NO_RETURN_NO_REPLACEMENT");
  const [showDimensions, setShowDimensions] = useState(false);

  useEffect(() => {
    if (specifications.length === 0) {
      setSpecifications([{ name: "", details: "" }]);
    }
  }, []);

  const searchParentProducts = async (query: string) => {
    setSearchParent(query);

    if (!query.trim()) {
      setParentResults([]);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/product?search=${query}`,
      );
      const data = await res.json();
      const filtered = data.data.filter((p: ProductItem) => !p.isVariant);

      setParentResults(filtered || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttributes = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/attribute?status=true&limit=30`,
      );
      const data = await res.json();
      setBackendAttributes(data.attributes || []);
      // console.log("aatributes",data.attributes);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/brand?status=true&limit=30`,
      );
      const data = await res.json();
      setBackendBrands(data.brands || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVariables = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/variable?status=true&limit=40`,
      );
      const data = await res.json();
      setBackendVariables(data.variables || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/category?limit=50`,
      );
      const data = await res.json();
      setBackendCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchPickup = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/pickup?status=true&limit=30`,
      );
      const data = await res.json();
      setBackendPickup(data.pickups || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttributes();
    fetchBrands();
    fetchVariables();
    fetchCategories();
    fetchPickup();
  }, []);

  const getInheritedValue = <T,>(
    variantValue: T | undefined | null,
    parentValue: T | undefined | null,
  ): T | undefined => {
    if (variantValue !== undefined && variantValue !== null)
      return variantValue;
    return parentValue ?? undefined;
  };
  useEffect(() => {
    if (!editData || !open) return;

    setName(editData.name);
    setShortDescription(editData.shortDescription || "");
    setLongDescription(editData.longDescription || "");
    setMrp(editData.mrp || 0);
    setDiscount(editData.discount || 0);
    setStock(editData.stock || 0);
    setType(editData.isVariant ? "Variable" : "Simple");
    setBrand(editData.brand?._id || "");
    setPickup(editData.pickup?._id || "");
    setAttributes(editData.attributes?.map((a) => a._id) || []);
    setCategoryLevel(editData.categoryLevels?.map((c) => c._id) || []);
    setVariables(
      editData.variables?.map((v) => ({ name: v.name, values: v.values })) ||
        [],
    );

    setPreview(editData.coverImage?.url || "");
    setPreviews(editData.images?.map((img) => img.url) || []);
    if (editData.isVariant && editData.parentProduct) {
      setSelectedParent(editData.parentProduct);
      setSearchParent(editData.parentProduct.name);
    }

    setWeight(editData.weight || 0);

    setDimensions(
      editData.dimensions && editData.dimensions.length > 0
        ? editData.dimensions
        : [{ no_of_box: "1", length: "", width: "", height: "" }],
    );

    setTypeOfPackage(editData.typeOfPackage || "PLANT_BOX");
    setReturnPolicy(editData.returnPolicy || "NO_RETURN_NO_REPLACEMENT");

    setShowDimensions(!!editData.dimensions?.length);
    setImages([]);
  }, [editData, open]);

  useEffect(() => {
    if (!editData || !open) return;

    if (specsInitializedRef.current) return;

    // SIMPLE PRODUCT
    if (!editData.isVariant) {
      setSpecifications(editData.specifications || []);
      specsInitializedRef.current = true;
      return;
    }

    // VARIANT WITH OWN SPECS
    if (editData.specifications && editData.specifications.length > 0) {
      setSpecifications(editData.specifications);
      specsInitializedRef.current = true;
      return;
    }

    // VARIANT INHERITING FROM PARENT
    if (editData.parentProduct?.specifications) {
      setSpecifications(
        editData.parentProduct.specifications.map((s) => ({
          name: s.name,
          details: s.details,
        })),
      );
      specsInitializedRef.current = true;
    }
  }, [
    editData,
    editData?.parentProduct, // 🔥 IMPORTANT
    open,
  ]);

  useEffect(() => {
    if (!open) {
      specsInitializedRef.current = false;
    }
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setCoverImage(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const pv = files.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...pv]);

    e.target.value = ""; // allow reselecting same images
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]); // cleanup
      return prev.filter((_, i) => i !== index);
    });
  };

  const addVariable = () => {
    setVariables((prev) => [...prev, { name: "", values: [] }]);
  };

  const handleVariableNameChange = (index: number, name: string) => {
    setVariables((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, name, values: [] } : item,
      ),
    );
  };

  const removeVariable = (i: number) =>
    setVariables((prev) => prev.filter((_, idx) => idx !== i));

  const toggleVariableValue = (index: number, value: string) => {
    setVariables((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              values: [value], // 🔥 ONLY ONE VALUE
            }
          : item,
      ),
    );
  };

  const handleAttributeToggle = (id: string) => {
    setAttributes(
      (prev) =>
        prev.includes(id)
          ? prev.filter((item) => item !== id) // remove
          : [...prev, id], // add
    );
  };

  const handleCategoryChange = (level: number, value: string) => {
    const newPath = [...categoryLevel];
    newPath[level] = value;

    // remove any deeper levels beyond this one
    newPath.length = level + 1;

    setCategoryLevel(newPath);
  };

  // returns children array based on selected path
  const getChildrenOf = (
    categories: CategoryNode[],
    path: string[],
  ): CategoryNode[] => {
    let current = categories;

    for (let id of path) {
      const found = current.find((c) => c._id === id);
      if (!found) return [];
      current = found.children || [];
    }

    return current;
  };

  const submit = async () => {
    if (type === "Variable" && !selectedParent)
      return alert("Please select a parent product for this variant");
    console.log("selected p", selectedParent);
    if (variables.some((v) => !v.name || v.values.length === 0))
      return alert("Please fill all variable details");
    if (type === "Variable") {
      if (
        !name ||
        !shortDescription ||
        !longDescription ||
        !mrp ||
        !stock ||
        !discount ||
        !attributes ||
        !selectedParent
      )
        return alert("All fields are required");
    } else if (
      !name ||
      !shortDescription ||
      !longDescription ||
      !mrp ||
      !stock ||
      !discount ||
      !brand ||
      !categoryLevel ||
      !attributes
    )
      return alert("All fields are required");

    if (!coverImage && !editData) return alert("Cover image required");

    const fd = new FormData();
    const price =
      discount <= 100 && discount >= 0
        ? Math.round(mrp - (mrp * discount) / 100)
        : 0;
    fd.append("name", name);
    fd.append("shortDescription", shortDescription);
    fd.append("longDescription", longDescription);
    fd.append("mrp", String(mrp));
    fd.append("price", String(price));
    fd.append("stock", String(stock));
    fd.append("discount", String(discount));
    fd.append("brand", brand);
    if (pickup) fd.append("pickup", pickup);
    fd.append("isVariant", String(type === "Variable"));
    fd.append("attributes", JSON.stringify(attributes));
    fd.append("categoryLevels", JSON.stringify(categoryLevel));
    fd.append("specifications", JSON.stringify(specifications));

    fd.append("weight", String(weight));
    fd.append("dimensions", JSON.stringify(dimensions));
    fd.append("typeOfPackage", typeOfPackage);
    fd.append("returnPolicy", returnPolicy);

    if (coverImage) fd.append("coverImage", coverImage);
    images.forEach((img) => {
      fd.append("images", img);
    });

    fd.append("variables", JSON.stringify(variables));

    // console.log("Submitting variables:", variables);

    let url = "";
    let method: "POST" | "PUT" = "POST";

    // SIMPLE PRODUCT
    if (type === "Simple") {
      url = `${import.meta.env.VITE_BASE_URL}/api/product`;
    }

    // CREATE VARIANT
    if (type === "Variable" && !editData) {
      if (!selectedParent)
        return alert("Please select a parent product for this variant");
      fd.append("parentProduct", selectedParent._id);
      url = `${import.meta.env.VITE_BASE_URL}/api/product/${
        selectedParent._id
      }/variant`;
    }

    // EDITING EXISTING SIMPLE PRODUCT
    if (editData && !editData.isVariant) {
      url = `${import.meta.env.VITE_BASE_URL}/api/product/${
        editData?.productId
      }`;
      method = "PUT";
    }

    // EDITING EXISTING VARIANT PRODUCT (**IMPORTANT FIX**)
    if (editData && editData.isVariant) {
      url = `${import.meta.env.VITE_BASE_URL}/api/product/variant/${
        editData.productId
      }`;
      method = "PUT";
    }

    try {
      setLoading(true);

      const res = await fetch(url, {
        method,
        body: fd,
      });

      const data = await res.json();

      if (res.ok) {
        alert(editData ? "Product updated!" : "Product added!");
        onSuccess();
        onClose();
      } else alert(data.message || "Failed!");
      setName("");
      setShortDescription("");
      setLongDescription("");
      setMrp(0);
      setStock(0);
      setDiscount(0);
      setAttributes([]);
      setCategoryLevel([]);
      setCoverImage(null);
      setImages([]);
      setPreview("");
      setPreviews([]);
      setType("Simple");
      setVariables([]);
      setSelectedParent(null);
      setBrand("");
      setPickup("");

      setWeight(0);
      setDimensions([{ no_of_box: "1", length: "", width: "", height: "" }]);
      setTypeOfPackage("PLANT_BOX");
      setReturnPolicy("NO_RETURN_NO_REPLACEMENT");
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative ml-auto w-[70%]  bg-white h-full overflow-y-auto no-scrollbar p-5 shadow-xl">
        <h2 className="text-xl font-semibold mb-3 flex items-center justify-between">
          {editData ? "Edit Product" : "Add Product"}
          <button
            className="text-xl leading-none hover:opacity-70 bg-red-500 text-white rounded-full size-6 flex items-center justify-center"
            onClick={onClose}
          >
            ×
          </button>
        </h2>

        <div className="space-y-4">
          <div>
            <input
              className="w-full border border-gray-200 outline-none px-3 py-2 rounded-md"
              type="text"
              placeholder="Enter Product Title"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="block my-2 text-sm font-medium">
              Short Description
            </label>
            <WordLikeDescriptionBox
              value={shortDescription}
              onChange={(value: string) => setShortDescription(value)}
            />
          </div>
          <div className="mt-4">
            <label className="block my-2 text-sm font-medium">
              Long Description
            </label>

            <WordLikeDescriptionBox
              value={longDescription}
              onChange={(value: string) => setLongDescription(value)}
            />
          </div>

          <div>
            <SpecificationInProduct
              specifications={specifications}
              setSpecifications={setSpecifications}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">
                Select Category
              </label>

              {/* First Level Dropdown */}
              <select
                className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem] mb-3"
                value={categoryLevel[0] || ""}
                onChange={(e) => handleCategoryChange(0, e.target.value)}
              >
                <option value="">Select Category</option>
                {backendCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* AUTO-GENERATED LEVELS */}
              {categoryLevel.map((selectedId, level) => {
                const children = getChildrenOf(
                  backendCategories,
                  categoryLevel.slice(0, level + 1),
                );

                if (!children || children.length === 0) return null;
                return (
                  <select
                    key={level}
                    className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem] mb-3"
                    value={categoryLevel[level + 1] || ""}
                    onChange={(e) =>
                      handleCategoryChange(level + 1, e.target.value)
                    }
                  >
                    <option value="">Select Subcategory</option>
                    {children.map((child) => (
                      <option key={child._id} value={child._id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                );
              })}
            </div>
            {/* {type === "Variable" && selectedParent && (
              <div className="mt-4 border p-3 rounded bg-gray-50">
                <label className="font-semibold block mb-1">
                  Inherited Categories
                </label>
                {selectedParent && (
                  <div className="text-sm text-gray-700">
                    {selectedParent.categoryLevels.map((cat, i) => (
                      <p key={i}>{cat.name}</p>
                    ))}
                  </div>
                )}
              </div>
            )} */}

            <div>
              <label className="font-semibold block mb-1">Select Pickup</label>
              <select
                className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem]"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              >
                <option value="">Select Pickup</option>
                {backendPickup.map((pickup) => (
                  <option key={pickup._id} value={pickup._id}>
                    {pickup.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className=" flex flex-col gap-2">
              <label>Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full border border-gray-200 outline-none rounded-md px-2 py-2 h-[3.5rem] "
              />
              {preview && (
                <img
                  src={preview}
                  className="w-32 h-32 rounded-md mt-3 object-cover"
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label>Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="border border-gray-200 outline-none rounded-md px-2 py-2 h-[3.5rem] "
              />

              <div className="flex gap-3 mt-3 flex-wrap">
                {previews.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} className="w-24 h-24 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className=" flex flex-col gap-2">
              <label>Product Type</label>
              <select
                value={type}
                className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem]"
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="Simple">Simple</option>
                <option value="Variable">Variable</option>
              </select>
            </div>
            <div className=" flex flex-col gap-2">
              <label htmlFor="mrp">MRP</label>
              <input
                type="number"
                className="border border-gray-200 outline-none px-3 py-2 rounded-md h-[3.5rem]"
                placeholder="MRP"
                value={mrp}
                min={1}
                onChange={(e) => setMrp(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                className="border border-gray-200 outline-none px-3 py-2 rounded-md h-[3.5rem]"
                placeholder="Price"
                value={
                  discount >= 0 && discount <= 100
                    ? Math.round(mrp - (mrp * discount) / 100)
                    : 0
                }
                disabled
              />
            </div>
            <div className=" flex flex-col gap-2">
              <label htmlFor="stock">Stock</label>
              <input
                type="number"
                className="border border-gray-200 outline-none px-3 py-2 rounded-md h-[3.5rem]"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="discount">Discount</label>
              <input
                type="number"
                className="border border-gray-200 outline-none px-3 py-2 rounded-md h-[3.5rem]"
                placeholder="Discount"
                value={discount}
                min={0}
                max={100}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            <div className=" flex flex-col gap-2">
              <label htmlFor="brand">Brand</label>

              <select
                className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem]"
                onChange={(e) => setBrand(e.target.value)}
                value={brand}
              >
                <option value="">Select Brand</option>
                {backendBrands.map((b) => (
                  <option value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">Variables</h3>
              <button
                className="bg-blue-500 text-white px-6 py-1 rounded-md h-[3rem]"
                onClick={addVariable}
              >
                + Add
              </button>
            </div>

            {variables.map((variable, index) => {
              const backendVar = backendVariables.find(
                (v) => v.name === variable.name,
              );

              return (
                <div
                  key={index}
                  className="border border-gray-200 flex justify-between items-center p-3 rounded-md mb-3 bg-gray-50 relative"
                >
                  {/* Select Variable Name */}
                  <select
                    className="border border-gray-200 outline-none flex-1 px-3 py-2 rounded  w-1/2 h-[3.5rem]"
                    value={variable.name}
                    onChange={(e) =>
                      handleVariableNameChange(index, e.target.value)
                    }
                  >
                    <option value="">Select Variable</option>
                    {backendVariables.map((v) => (
                      <option key={v._id} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </select>

                  {/* Show Values If Variable Selected */}
                  {backendVar && (
                    <div className=" ml-2 w-1/2 flex flex-col gap-2 justify-end items-center flex-wrap">
                      <div className="flex gap-4 w-full">
                        <select
                          className="border border-gray-300 rounded px-2 py-1 w-full h-[3.5rem]"
                          value={variable.values[0] || ""} // Default to empty string if nothing selected
                          onChange={(e) =>
                            toggleVariableValue(index, e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select an option
                          </option>
                          {backendVar.value.map((value: string) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => removeVariable(index)}
                    className="text-white rounded-full size-6 flex items-center justify-center bg-red-500 absolute top-0 right-2 font-bold text-2xl/0"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* SHOW ONLY IF PRODUCT TYPE = VARIABLE */}
          {type === "Variable" && (
            <div className="mt-4">
              <label className="font-semibold block mb-1">
                Select Parent Product (Required)
              </label>

              {/* SEARCH INPUT */}
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-md h-[3.5rem]"
                placeholder="Search parent product..."
                value={searchParent}
                onChange={(e) => searchParentProducts(e.target.value)}
              />

              {/* SEARCH RESULTS DROPDOWN */}
              {parentResults.length > 0 && (
                <div className="border mt-2 bg-white rounded-md shadow-md max-h-40 overflow-y-auto">
                  {parentResults.map((p) => (
                    <div
                      key={p._id}
                      className="p-2 hover:bg-gray-100 cursor-pointer h-[3.5rem]"
                      onClick={() => {
                        setSelectedParent(p);
                        setSearchParent(p.name);
                        setParentResults([]);
                        setBrand(p.brand?._id || "");
                        setPickup(p.pickup?._id || "");
                        setShortDescription(p.shortDescription || "");
                        setLongDescription(p.longDescription || "");
                        setAttributes(p.attributes?.map((a) => a._id) || []);
                        setCategoryLevel(
                          p.categoryLevels?.map((c) => c._id) || [],
                        );
                        if (p.specifications && p.specifications.length > 0) {
                          setSpecifications(
                            p.specifications.map((s) => ({
                              name: s.name,
                              details: s.details,
                            })),
                          );
                        } else {
                          setSpecifications([]);
                        }

                        setWeight(p.weight || 0);
                        setDimensions(
                          p.dimensions || [
                            {
                              no_of_box: "1",
                              length: "",
                              width: "",
                              height: "",
                            },
                          ],
                        );
                        setTypeOfPackage(p.typeOfPackage || "PLANT_BOX");
                        setReturnPolicy(
                          p.returnPolicy || "NO_RETURN_NO_REPLACEMENT",
                        );

                        // Show dimensions if parent has them
                        setShowDimensions(!!p.dimensions?.length);

                        if (p.specifications && p.specifications.length > 0) {
                          setSpecifications(
                            p.specifications.map((s) => ({
                              name: s.name,
                              details: s.details,
                            })),
                          );
                        } else {
                          setSpecifications([]);
                        }
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}

              {/* SELECTED PARENT SUMMARY */}
              {selectedParent && (
                <div className="mt-2 p-3 bg-green-50 border border-green-300 rounded-md">
                  <p className="text-green-700 text-sm">
                    ✓ Selected Parent: {selectedParent.name}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <h1 className=" text-gray-800 text-xl font-semibold">
              For Shipping{" "}
            </h1>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="weight">Weight (grams)</label>
                <input
                  type="number"
                  id="weight"
                  className="border border-gray-200 outline-none px-3 py-2 rounded-md h-[3.5rem]"
                  placeholder="500"
                  value={weight}
                  min={0}
                  required
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Type of Package</label>
                <select
                  className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem]"
                  value={typeOfPackage}
                  onChange={(e) => setTypeOfPackage(e.target.value as any)}
                >
                  <option value="PLANT_BOX">Plant Box</option>
                  <option value="PLANT_MAILER">Plant Mailer</option>
                  <option value="NURSERY_POT_WRAP">Nursery Pot Wrap</option>
                  <option value="POLY_BAG">Poly Bag</option>
                  <option value="GIFT_BOX">Gift Box</option>
                  <option value="SERVICE_ONLY">Service Only</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label>Return Policy</label>
                <select
                  className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem]"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value as any)}
                >
                  <option value="RETURN_ONLY">Return Only</option>
                  <option value="REPLACEMENT_ONLY">Replacement Only</option>
                  <option value="RETURN_AND_REPLACEMENT">
                    Return + Replacement
                  </option>
                  <option value="NO_RETURN_NO_REPLACEMENT">
                    No Return/Replacement
                  </option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
                onClick={() => setShowDimensions(!showDimensions)}
              >
                <label className="font-semibold text-sm">Dimensions (cm)</label>
              </div>

              <div className="space-y-2 p-3 bg-white border border-gray-200 rounded-md">
                {/* Single dimension row */}
                {dimensions.map((dim, index) => (
                  <div className="flex gap-1 items-end">
                    <input
                      type="text"
                      placeholder="No. of boxes"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.no_of_box || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].no_of_box = e.target.value;
                        setDimensions(newDims);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Length"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.length || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].length = e.target.value;
                        setDimensions(newDims);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Width"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.width || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].width = e.target.value;
                        setDimensions(newDims);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Height"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.height || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].height = e.target.value;
                        setDimensions(newDims);
                      }}
                    />
                    <button
                      type="button"
                      className="text-sm w-fit rounded px-4 bg-blue-600 hover:bg-blue-800 text-white h-[3rem]  flex items-center gap-1 "
                      onClick={(e) => {
                        e.stopPropagation();
                        // AUTOMATICALLY INCREASE no_of_box (1, 2, 3...)
                        const newNoOfBox = dimensions.length + 1;
                        setDimensions((prev) => [
                          ...prev,
                          {
                            no_of_box: newNoOfBox.toString(),
                            length: "",
                            width: "",
                            height: "",
                          },
                        ]);
                      }}
                    >
                      ➕ Add
                    </button>

                    {dimensions.length > 1 && (
                      <button
                        type="button"
                        className="text-white bg-red-500 hover:bg-red-600 rounded-full size-8 flex items-center justify-center font-bold text-sm ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDimensions((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                {/* Add More Button (optional - for multiple boxes) */}
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold">Attributes</label>
            <div className=" flex flex-row gap-4 flex-wrap">
              {backendAttributes.map((attr) => (
                <div key={attr._id} className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id={attr._id as string}
                    checked={attributes.includes(attr._id)}
                    onChange={() => handleAttributeToggle(attr._id)}
                  />
                  <label htmlFor={attr._id}>{attr.name}</label>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`w-full py-2 mt-4 rounded-md text-white ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
            onClick={submit}
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : editData
                ? "Update Product"
                : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;
