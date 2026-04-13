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
import toast from "react-hot-toast";

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
  const [backendAttributes, setBackendAttributes] = useState<AttributeItem[]>([]);
  const [backendBrands, setBackendBrands] = useState<BrandItem[]>([]);
  const [backendPickup, setBackendPickup] = useState<PickupItem[]>([]);
  const [backendVariables, setBackendVariables] = useState<VariableItem[]>([]);
  const [backendCategories, setBackendCategories] = useState<CategoryNode[]>([]);
  const [categoryLevel, setCategoryLevel] = useState<string[]>([]);
  const [variables, setVariables] = useState<{ name: string; values: string[] }[]>([]);

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
  const [selectedParent, setSelectedParent] = useState<ProductItem | null>(null);

  const [specifications, setSpecifications] = useState<SpecificationItem[]>([]);
  const specsInitializedRef = useRef(false);

  // NEW STATES
  const [weight, setWeight] = useState(0);
  const [dimensions, setDimensions] = useState([
    { no_of_box: "1", length: "", width: "", height: "" },
  ]);
  const [typeOfPackage, setTypeOfPackage] = useState("GIFT_BOX");
  const [returnPolicy, setReturnPolicy] = useState("NO_RETURN_NO_REPLACEMENT");
  const [showDimensions, setShowDimensions] = useState(false);

  // VALIDATION STATE
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        `${import.meta.env.VITE_BASE_URL}/api/product?q=${query}`,
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
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/attribute?status=true&limit=30`);
      const data = await res.json();
      setBackendAttributes(data.attributes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/brand?status=true&limit=30`);
      const data = await res.json();
      setBackendBrands(data.brands || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVariables = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/variable?status=true&limit=40`);
      const data = await res.json();
      setBackendVariables(data.variables || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/category?limit=50`);
      const data = await res.json();
      setBackendCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchPickup = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/pickup?status=true&limit=30`);
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
      editData.variables?.map((v) => ({ name: v.name, values: v.values })) || []
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

    setTypeOfPackage(editData.typeOfPackage || "GIFT_BOX");
    setReturnPolicy(editData.returnPolicy || "NO_RETURN_NO_REPLACEMENT");

    setShowDimensions(!!editData.dimensions?.length);
    setImages([]);
    setErrors({}); // Clear errors when loading edit data
  }, [editData, open]);

  useEffect(() => {
    if (!editData || !open) return;

    if (specsInitializedRef.current) return;

    if (!editData.isVariant) {
      setSpecifications(editData.specifications || []);
      specsInitializedRef.current = true;
      return;
    }

    if (editData.specifications && editData.specifications.length > 0) {
      setSpecifications(editData.specifications);
      specsInitializedRef.current = true;
      return;
    }

    if (editData.parentProduct?.specifications) {
      setSpecifications(
        editData.parentProduct.specifications.map((s) => ({
          name: s.name,
          details: s.details,
        })),
      );
      specsInitializedRef.current = true;
    }
  }, [editData, editData?.parentProduct, open]);

  useEffect(() => {
    if (!open) {
      specsInitializedRef.current = false;
      setErrors({}); // Clear errors on close
    }
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const f = e.target.files?.[0];

    if (!f) return;

    if (f.size > 1024 * 1024) {
      toast.error("Cover image must be less than 1MB");
      e.target.value = "";
      return;
    }

    setCoverImage(f);
    setPreview(URL.createObjectURL(f));
    // Clear image error if fixed
    if (errors.coverImage) setErrors(prev => ({ ...prev, coverImage: "" }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles: File[] = [];

    files.forEach((file) => {
      if (file.size > 1024 * 1024) {
        toast.error(`${file.name} is larger than 1MB`);
      } else {
        validFiles.push(file);
      }
    });

    const pv = validFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...pv]);

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
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
    const variableName = variables[index].name;
    const usedValues = getUsedValues(variableName);

    if (usedValues.includes(value.toLowerCase())) return;

    setVariables((prev) =>
      prev.map((item, i) => (i === index ? { ...item, values: [value] } : item)),
    );
  };

  const handleAttributeToggle = (id: string) => {
    setAttributes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCategoryChange = (level: number, value: string) => {
    const newPath = [...categoryLevel];
    newPath[level] = value;
    newPath.length = level + 1;
    setCategoryLevel(newPath);
    if (errors.categoryLevel) setErrors(prev => ({ ...prev, categoryLevel: "" }));
  };

  const getChildrenOf = (categories: CategoryNode[], path: string[]): CategoryNode[] => {
    let current = categories;
    for (let id of path) {
      const found = current.find((c) => c._id === id);
      if (!found) return [];
      current = found.children || [];
    }
    return current;
  };

  // ✅ NEW VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic fields
    if (!name.trim()) newErrors.name = "Product title is required.";
    if (!shortDescription.trim() || shortDescription === '<p><br></p>') newErrors.shortDescription = "Short description is required.";
    if (!longDescription.trim() || longDescription === '<p><br></p>') newErrors.longDescription = "Long description is required.";

    // Pricing & Stock
    if (mrp <= 0) newErrors.mrp = "MRP must be greater than 0.";
    if (stock < 0) newErrors.stock = "Stock cannot be negative.";
    if (discount < 0 || discount > 100) newErrors.discount = "Discount must be between 0 and 100.";

    // Shipping
    if (weight < 100 || weight > 100000) newErrors.weight = "Weight must be between 100g and 100,000g (100kg).";
    if (!pickup) newErrors.pickup = "Pickup location is required.";

    // Cover Image
    if (!coverImage && !editData) newErrors.coverImage = "Cover image is required.";

    // Variables & Parents
    if (type === "Variable") {
      if (!selectedParent) newErrors.selectedParent = "Please select a parent product for this variant.";
      if (variables.length === 0) newErrors.variables = "Variable products must have at least one variable defined.";
      if (variables.some((v) => !v.name || v.values.length === 0)) newErrors.variables = "Please fill all variable details (select a name and value).";
    }

    // Categories & Brands (Only required if Simple, or if creating a brand new product tree)
    if (type === "Simple") {
      if (!brand) newErrors.brand = "Brand is required for Simple products.";
      if (!categoryLevel || categoryLevel.length === 0 || !categoryLevel) newErrors.categoryLevel = "At least one category is required.";
    }

    // Dimensions validation
    const hasEmptyDimension = dimensions.some(dim => !dim.length || !dim.width || !dim.height || !dim.no_of_box);
    if (hasEmptyDimension) {
      newErrors.dimensions = "Please fill out Length, Width, Height, and No. of boxes for all dimension rows.";
    }

    setErrors(newErrors);
    
    // Returns true if there are NO errors
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    // 1. Run validation
    if (!validateForm()) {
      toast.error("Please fix the errors in red before submitting.");
      return;
    }

    // 2. Validate Duplicate variables explicitly (keeps existing logic)
    const uniqueNames = new Set(
      variables.map(v => v.name.trim().toLowerCase() === "colour" ? "color" : v.name.trim().toLowerCase())
    );
    if (uniqueNames.size !== variables.length) {
      setErrors(prev => ({ ...prev, variables: "Duplicate variables found. You can only use a variable (e.g. Color) once." }));
      toast.error("Duplicate variables found.");
      return;
    }

    const fd = new FormData();
    const price = discount <= 100 && discount >= 0 ? Math.round(mrp - (mrp * discount) / 100) : 0;
    
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

   const cleanedVariables = variables.map((v) => ({
     name: v.name.trim().toLowerCase() === "colour" ? "Color" : v.name.trim(),
     values: v.values.map((val) => val.trim()),
   }));

   fd.append("variables", JSON.stringify(cleanedVariables));

    let url = "";
    let method: "POST" | "PUT" = "POST";

    if (type === "Simple") {
      url = `${import.meta.env.VITE_BASE_URL}/api/product`;
    }

    if (type === "Variable" && !editData) {
      if (!selectedParent)
        return toast.error("Please select a parent product for this variant");
      fd.append("parentProduct", selectedParent._id);
      url = `${import.meta.env.VITE_BASE_URL}/api/product/${
        selectedParent._id
      }/variant`;
    }

    if (type === "Variable" && selectedParent) {
      fd.append("parentProduct", selectedParent._id);
    }

    // let url = "";
    // let method: "POST" | "PUT" = "POST";

    if (editData) {
      method = "PUT";
      if (type === "Simple") {
        url = `${import.meta.env.VITE_BASE_URL}/api/product/${editData.productId}`;
      } else {
        url = `${import.meta.env.VITE_BASE_URL}/api/product/variant/${editData.productId}`;
        if (selectedParent) {
          fd.append("parentProduct", selectedParent._id);
        }
      }
    } else {
      method = "POST";
      if (type === "Simple") {
        url = `${import.meta.env.VITE_BASE_URL}/api/product`;
      } else {
        if (!selectedParent)
          return toast.error("Please select a parent product for this variant");
          fd.append("parentProduct", selectedParent._id);
          url = `${import.meta.env.VITE_BASE_URL}/api/product/${selectedParent._id}/variant`;
      }
    }

    try {
      setLoading(true);

      const res = await fetch(url, {
        method,
        body: fd,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        const message =
          data?.message ||
          data?.error ||
          (res.status === 413 ? "File too large. Please upload images under allowed size."
            : res.status === 400 ? "Invalid data. Please check all required fields."
            : res.status === 401 ? "Unauthorized. Please login again."
            : res.status === 404 ? "API not found. Contact developer."
            : "Something went wrong while uploading product.");
        throw new Error(message);
      }

      toast.success(editData ? "Product updated successfully!" : "Product added successfully!");
      onSuccess();
      onClose();
      
      // Reset Form
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
      setTypeOfPackage("GIFT_BOX");
      setReturnPolicy("NO_RETURN_NO_REPLACEMENT");
      setErrors({});
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err);
      toast.error(err.message || "Upload failed. Please check your internet connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const getUsedValues = (variableName: string) => {
    if (!selectedParent) return [];
    const normalizedName = variableName.trim().toLowerCase() === "colour" ? "color" : variableName.toLowerCase();
    const used = new Set<string>();
    const allProducts = [selectedParent, ...(selectedParent.variants || [])];

    allProducts.forEach((product: any) => {
      product.variables?.forEach((v: any) => {
        const name = v.name.trim().toLowerCase() === "colour" ? "color" : v.name.toLowerCase();
        if (name === normalizedName) {
          v.values.forEach((val: string) => { used.add(val.trim().toLowerCase()); });
        }
      });
    });
    return Array.from(used);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative ml-auto w-[70%] bg-white h-full overflow-y-auto no-scrollbar p-5 shadow-xl">
        <h2 className="text-xl font-semibold mb-3 flex items-center justify-between">
          <span>{editData ? "Edit Product" : "Add Product"} <span className="text-xl/0 text-red-500">*</span></span>
          <button
            className="text-xl leading-none hover:opacity-70 bg-red-500 text-white rounded-full size-6 flex items-center justify-center"
            onClick={onClose}
          >
            ×
          </button>
        </h2>

        <div className="space-y-4">
          {/* TITLE */}
          <div>
            <input
              className={`w-full border outline-none px-3 py-2 rounded-md ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
              type="text"
              placeholder="Enter Product Title *"
              value={name}
              required
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
              }}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* SHORT DESC */}
          <div className="mt-4">
            <label className="block my-2 text-sm font-medium">
              Short Description <span className="text-xl/0 text-red-500">*</span>
            </label>
            <div className={errors.shortDescription ? "border border-red-500 rounded-md" : ""}>
              <WordLikeDescriptionBox
                value={shortDescription}
                onChange={(value: string) => {
                  setShortDescription(value);
                  if (errors.shortDescription) setErrors(prev => ({ ...prev, shortDescription: "" }));
                }}
              />
            </div>
            {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
          </div>

          {/* LONG DESC */}
          <div className="mt-4">
            <label className="block my-2 text-sm font-medium">
              Long Description<span className="text-xl/0 text-red-500">*</span>
            </label>
            <div className={errors.longDescription ? "border border-red-500 rounded-md" : ""}>
              <WordLikeDescriptionBox
                value={longDescription}
                onChange={(value: string) => {
                  setLongDescription(value);
                  if (errors.longDescription) setErrors(prev => ({ ...prev, longDescription: "" }));
                }}
              />
            </div>
            {errors.longDescription && <p className="text-red-500 text-sm mt-1">{errors.longDescription}</p>}
          </div>

          <div>
            <SpecificationInProduct
              specifications={specifications}
              setSpecifications={setSpecifications}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* CATEGORY */}
            <div>
              <label className="font-semibold block mb-1">
                Select Category<span className="text-xl/0 text-red-500">*</span>
              </label>

              <select
                className={`border outline-none px-3 py-2 rounded-md w-full h-[3.5rem] mb-3 ${errors.categoryLevel ? 'border-red-500' : 'border-gray-200'}`}
                value={categoryLevel || ""}
                onChange={(e) => handleCategoryChange(0, e.target.value)}
              >
                <option value="">Select Category</option>
                {backendCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryLevel && <p className="text-red-500 text-sm -mt-2 mb-3">{errors.categoryLevel}</p>}

              {categoryLevel.map((selectedId, level) => {
                const children = getChildrenOf(backendCategories, categoryLevel.slice(0, level + 1));
                if (!children || children.length === 0) return null;
                return (
                  <select
                    key={level}
                    className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem] mb-3"
                    value={categoryLevel[level + 1] || ""}
                    onChange={(e) => handleCategoryChange(level + 1, e.target.value)}
                  >
                    <option value="">Select Subcategory</option>
                    {children.map((child) => (
                      <option key={child._id} value={child._id}>{child.name}</option>
                    ))}
                  </select>
                );
              })}
            </div>

            {/* PICKUP */}
            <div>
              <label className="font-semibold block mb-1">
                Select Pickup <span className="text-xl/0 text-red-500">*</span>
              </label>
              <select
                className={`border outline-none px-3 py-2 rounded-md w-full h-[3.5rem] ${errors.pickup ? 'border-red-500' : 'border-gray-200'}`}
                value={pickup}
                onChange={(e) => {
                  setPickup(e.target.value);
                  if (errors.pickup) setErrors(prev => ({ ...prev, pickup: "" }));
                }}
              >
                <option value="">Select Pickup</option>
                {backendPickup.map((pickup) => (
                  <option key={pickup._id} value={pickup._id}>{pickup.name}</option>
                ))}
              </select>
              {errors.pickup && <p className="text-red-500 text-sm mt-1">{errors.pickup}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* COVER IMAGE */}
            <div className=" flex flex-col gap-2">
              <label>
                Cover Image <span className="text-xl/0 text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!editData}
                className={`w-full border outline-none rounded-md px-2 py-2 h-[3.5rem] ${errors.coverImage ? 'border-red-500' : 'border-gray-200'}`}
              />
              {errors.coverImage && <p className="text-red-500 text-sm">{errors.coverImage}</p>}
              {preview && <img src={preview} className="w-32 h-32 rounded-md mt-3 object-cover" />}
            </div>
            
            <div className="flex flex-col gap-2">
              <label>Additional Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="border border-gray-200 outline-none rounded-md px-2 py-2 h-[3.5rem]"
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

          {/* GRID ROW: Type, MRP, Price, Stock, Discount, Brand */}
          <div className="grid grid-cols-3 gap-3">
            <div className=" flex flex-col gap-2">
              <label>Product Type <span className="text-xl/0 text-red-500">*</span></label>
              <select
                value={type}
                className={`border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem] ${!!editData && !editData.isVariant ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                onChange={(e) => setType(e.target.value as any)}
                disabled={!!editData && !editData.isVariant}
              >
                <option value="Simple">Simple</option>
                <option value="Variable" disabled={!!editData && !editData.isVariant}>Variable</option>
              </select>
              {!!editData && !editData.isVariant && <span className="text-xs text-gray-400">Simple products cannot be changed to Variable.</span>}
              {!!editData && editData.isVariant && type === "Simple" && <span className="text-xs text-orange-500 font-medium">⚠️ Saving will permanently convert this to a Simple product.</span>}
            </div>

            <div className=" flex flex-col gap-2">
              <label htmlFor="mrp">MRP <span className="text-xl/0 text-red-500">*</span></label>
              <input
                type="number"
                className={`border outline-none px-3 py-2 rounded-md h-[3.5rem] ${errors.mrp ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="MRP"
                value={mrp || ''}
                min={1}
                onChange={(e) => {
                  setMrp(Number(e.target.value));
                  if (errors.mrp) setErrors(prev => ({ ...prev, mrp: "" }));
                }}
              />
              {errors.mrp && <p className="text-red-500 text-xs">{errors.mrp}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="price">Price <span className="text-xl/0 text-red-500">*</span></label>
              <input
                type="number"
                className="border border-gray-200 bg-gray-50 outline-none px-3 py-2 rounded-md h-[3.5rem]"
                placeholder="Price"
                value={discount >= 0 && discount <= 100 ? Math.round(mrp - (mrp * discount) / 100) : 0}
                disabled
              />
            </div>

            <div className=" flex flex-col gap-2">
              <label htmlFor="stock">Stock <span className="text-xl/0 text-red-500">*</span></label>
              <input
                type="number"
                className={`border outline-none px-3 py-2 rounded-md h-[3.5rem] ${errors.stock ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Stock"
                value={stock || ''}
                onChange={(e) => {
                  setStock(Number(e.target.value));
                  if (errors.stock) setErrors(prev => ({ ...prev, stock: "" }));
                }}
              />
              {errors.stock && <p className="text-red-500 text-xs">{errors.stock}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="discount">Discount %</label>
              <input
                type="number"
                className={`border outline-none px-3 py-2 rounded-md h-[3.5rem] ${errors.discount ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Discount"
                value={discount || ''}
                min={0}
                max={100}
                onChange={(e) => {
                  setDiscount(Number(e.target.value));
                  if (errors.discount) setErrors(prev => ({ ...prev, discount: "" }));
                }}
              />
              {errors.discount && <p className="text-red-500 text-xs">{errors.discount}</p>}
            </div>

            <div className=" flex flex-col gap-2">
              <label htmlFor="brand">Brand <span className="text-xl/0 text-red-500">*</span></label>
              <select
                className={`border outline-none px-3 py-2 rounded-md w-full h-[3.5rem] ${errors.brand ? 'border-red-500' : 'border-gray-200'}`}
                onChange={(e) => {
                  setBrand(e.target.value);
                  if (errors.brand) setErrors(prev => ({ ...prev, brand: "" }));
                }}
                value={brand}
              >
                <option value="">Select Brand</option>
                {backendBrands.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
              {errors.brand && <p className="text-red-500 text-xs">{errors.brand}</p>}
            </div>
          </div>

          {/* VARIABLES */}
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <h3 className="text-lg font-semibold">Variables</h3>
              <button className="bg-blue-500 text-white px-6 py-1 rounded-md h-[3rem]" onClick={addVariable}>
                + Add
              </button>
            </div>
            {errors.variables && <p className="text-red-500 text-sm mb-2">{errors.variables}</p>}

            {variables.map((variable, index) => {
              const backendVar = backendVariables.find((v) => v.name === variable.name);
              return (
                <div key={index} className="border border-gray-200 flex justify-between items-center p-3 rounded-md mb-3 bg-gray-50 relative">
                  <select
                    className="border border-gray-200 outline-none flex-1 px-3 py-2 rounded w-1/2 h-[3.5rem]"
                    value={variable.name}
                    onChange={(e) => {
                      handleVariableNameChange(index, e.target.value);
                      if (errors.variables) setErrors(prev => ({ ...prev, variables: "" }));
                    }}
                  >
                    <option value="">Select Variable</option>
                    {backendVariables.map((v) => {
                      const isSelectedElseWhere = variables.some((varItem, idx) => idx !== index && varItem.name === v.name);
                      return (
                        <option key={v._id} value={v.name} disabled={isSelectedElseWhere} className={isSelectedElseWhere ? "text-gray-400" : "text-black"}>
                          {v.name} {isSelectedElseWhere ? "(Already added)" : ""}
                        </option>
                      );
                    })}
                  </select>

                  {backendVar && (
                    <div className=" ml-2 w-1/2 flex flex-col gap-2 justify-end items-center flex-wrap">
                      <div className="flex gap-4 w-full">
                        <select
                          className="border border-gray-300 rounded px-2 py-1 w-full h-[3.5rem]"
                          value={variable.values || ""} 
                          onChange={(e) => {
                            toggleVariableValue(index, e.target.value);
                            if (errors.variables) setErrors(prev => ({ ...prev, variables: "" }));
                          }}
                        >
                          <option value="" disabled>Select an option</option>
                          {backendVar.value.map((value: string) => {
                            const isUsed = getUsedValues(variable.name).includes(value);
                            return (
                              <option key={value} value={value} disabled={isUsed} style={{ color: isUsed ? "#aaa" : "#000" }}>
                                {value} {isUsed ? "(Already used)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  )}

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

          {/* PARENT PRODUCT FOR VARIABLES */}
          {type === "Variable" && (
            <div className="mt-4">
              <label className="font-semibold block mb-1">
                Select Parent Product <span className="text-xl/0 text-red-500">*</span>
              </label>

              <input
                type="text"
                className={`w-full border px-3 py-2 rounded-md h-[3.5rem] ${errors.selectedParent ? 'border-red-500' : 'border-gray-300'} ${editData ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
                placeholder={editData ? "Parent product locked" : "Search parent product..."}
                value={searchParent}
                onChange={(e) => searchParentProducts(e.target.value)}
                disabled={!!editData}
              />
              {errors.selectedParent && <p className="text-red-500 text-sm mt-1">{errors.selectedParent}</p>}
              {!!editData && <span className="text-xs text-gray-400 mt-1 block">Parent product cannot be changed after creation.</span>}

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
                        setCategoryLevel(p.categoryLevels?.map((c) => c._id) || []);
                        if (p.specifications && p.specifications.length > 0) {
                          setSpecifications(p.specifications.map((s) => ({ name: s.name, details: s.details })));
                        } else {
                          setSpecifications([]);
                        }
                        setWeight(p.weight || 0);
                        setDimensions(p.dimensions || [{ no_of_box: "1", length: "", width: "", height: "" }]);
                        setTypeOfPackage(p.typeOfPackage || "GIFT_BOX");
                        setReturnPolicy(p.returnPolicy || "NO_RETURN_NO_REPLACEMENT");
                        setShowDimensions(!!p.dimensions?.length);
                        if (errors.selectedParent) setErrors(prev => ({ ...prev, selectedParent: "" }));
                      }}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>
              )}

              {selectedParent && (
                <div className="mt-2 p-3 bg-green-50 border border-green-300 rounded-md">
                  <p className="text-green-700 text-sm">✓ Selected Parent: {selectedParent.name}</p>
                </div>
              )}
            </div>
          )}

          {/* SHIPPING & DIMENSIONS */}
          <div className="flex flex-col gap-4">
            <h1 className="text-gray-800 text-xl font-semibold">For Shipping</h1>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="weight">
                  Weight (grams) <span className="text-xl/0 text-red-500">*</span>
                  <span className="text-xs font-medium text-gray-500 ml-1">(Min 100g, Max 100Kg)</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  className={`border outline-none px-3 py-2 rounded-md h-[3.5rem] ${errors.weight ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder="500"
                  value={weight || ''}
                  min={100}
                  required
                  onChange={(e) => {
                    setWeight(Number(e.target.value));
                    if (errors.weight) setErrors(prev => ({ ...prev, weight: "" }));
                  }}
                />
                {errors.weight && <p className="text-red-500 text-xs">{errors.weight}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label>Type of Package</label>
                <select
                  className="border border-gray-200 outline-none px-3 py-2 rounded-md w-full h-[3.5rem]"
                  value={typeOfPackage}
                  onChange={(e) => setTypeOfPackage(e.target.value as any)}
                >
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
                  <option value="RETURN_AND_REPLACEMENT">Return + Replacement</option>
                  <option value="NO_RETURN_NO_REPLACEMENT">No Return/Replacement</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div
                className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
                onClick={() => setShowDimensions(!showDimensions)}
              >
                <label className="font-semibold text-sm cursor-pointer">
                  Dimensions (cm) <span className="text-xl/0 text-red-500">*</span>
                </label>
              </div>
              
              {errors.dimensions && <p className="text-red-500 text-sm mt-1">{errors.dimensions}</p>}

              <div className={`space-y-2 p-3 bg-white border rounded-md ${errors.dimensions ? 'border-red-500' : 'border-gray-200'}`}>
                {dimensions.map((dim, index) => (
                  <div key={index} className="flex gap-1 items-end">
                    <input
                      type="text"
                      placeholder="Boxes"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.no_of_box || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].no_of_box = e.target.value;
                        setDimensions(newDims);
                        if (errors.dimensions) setErrors(prev => ({ ...prev, dimensions: "" }));
                      }}
                    />
                    <input
                      type="number"
                      placeholder="L"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.length || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].length = e.target.value;
                        setDimensions(newDims);
                        if (errors.dimensions) setErrors(prev => ({ ...prev, dimensions: "" }));
                      }}
                    />
                    <input
                      type="number"
                      placeholder="W"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.width || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].width = e.target.value;
                        setDimensions(newDims);
                        if (errors.dimensions) setErrors(prev => ({ ...prev, dimensions: "" }));
                      }}
                    />
                    <input
                      type="number"
                      placeholder="H"
                      className="flex-1 border border-gray-200 px-2 py-2 rounded h-[3rem] text-sm"
                      value={dim.height || ""}
                      onChange={(e) => {
                        const newDims = [...dimensions];
                        newDims[index].height = e.target.value;
                        setDimensions(newDims);
                        if (errors.dimensions) setErrors(prev => ({ ...prev, dimensions: "" }));
                      }}
                    />
                    <button
                      type="button"
                      className="text-sm w-fit rounded px-4 bg-blue-600 hover:bg-blue-800 text-white h-[3rem] flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newNoOfBox = dimensions.length + 1;
                        setDimensions((prev) => [...prev, { no_of_box: newNoOfBox.toString(), length: "", width: "", height: "" }]);
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
                          setDimensions((prev) => prev.filter((_, i) => i !== index));
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
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
            className={`w-full py-3 mt-4 rounded-md text-white font-medium ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Submitting..." : editData ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;