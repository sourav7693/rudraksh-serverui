import { useCallback, useEffect, useRef, useState } from "react";
import AddCategoryForm from "./AddCategoryForm";
import { FaTrash } from "react-icons/fa";
import Drawer from "../../global/Drawer";
import Adder from "../../global/Adder";
import Toggle from "../../global/Toggle";
import { FaSpinner } from "react-icons/fa6";

export interface LevelBlock {
  _id: string;
  type: string;
  name: string;
  image: { public_id: string; url: string } | null;
  status: boolean;
  createdAt: Date;
  children: LevelBlock[];
}

interface FlatChild {
  _id: string;
  name: string;
  type: string;
  image?: { url: string };
  level: number;
}

export interface CategoryItem {
  _id: string;
  categoryId: string;
  name: string;
  image: { public_id: string; url: string };
  children: LevelBlock[];
  status: boolean;
  createdAt: Date;
}

export interface CategoryRow {
  category?: CategoryItem;
  chain: (CategoryItem | LevelBlock)[];
  createdAt: Date;
}

export default function CategoryManagement() {
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<CategoryRow | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState<CategoryItem | null>(null);
  const [popupKey, setPopupKey] = useState(0);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchCategories = async (pageNum: number, searchTerm: string) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/api/category?limit=10&page=${pageNum}&search=${searchTerm}`
      );
      const data = await res.json();

      if (data.success) {
        setCategories((prev) => {
          if (pageNum === 1) return data.categories;

          const newCats = data.categories.filter(
            (n: CategoryItem) => !prev.some((p) => p._id === n._id)
          );
          return [...prev, ...newCats];
        });

        setHasMore(data.page < data.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const observer = useRef<IntersectionObserver | null>(null);

  const lastCategoryRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            console.log("⬇️ Scroll End Reached: Loading Page", page + 1);
            setPage((prevPage) => prevPage + 1);
          }
        },
        {
          threshold: 0.1,
        }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page]
  );

  useEffect(() => {
    setCategories([]);
    setPage(1);
    setHasMore(true);
    fetchCategories(1, search);
  }, [search]);

  useEffect(() => {
    if (page > 1) {
      fetchCategories(page, search);
    }
  }, [page]);

  const collectAllChildren = (
    children: LevelBlock[],
    level = 1,
    acc: FlatChild[] = []
  ): FlatChild[] => {
    for (const child of children) {
      acc.push({
        _id: child._id,
        name: child.name,
        type: child.type,
        image: child.image || undefined,
        level,
      });

      if (child.children && child.children.length > 0) {
        collectAllChildren(child.children, level + 1, acc);
      }
    }

    return acc;
  };

  const onViewCategory = (category: CategoryItem) => {
    setViewCategory(category);
    setViewOpen(true);
  };

  const onDeleteLevel = async (categoryId: string, childId?: string) => {
    const confirmDelete = confirm(
      childId
        ? "Are you sure you want to delete this sub category?"
        : "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/category/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: childId ? JSON.stringify({ childId }) : undefined,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert(data.message);

      setCategories([]);
      setPage(1);
      fetchCategories(1, search);
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const flattenCategories = (categories: CategoryItem[]) => {
    const rows: CategoryRow[] = [];

    const walk = (
      node: CategoryItem | LevelBlock,
      chain: (CategoryItem | LevelBlock)[]
    ) => {
      const newChain = [...chain, node];

      rows.push({
        category: newChain[0] as CategoryItem,
        chain: newChain,
        createdAt: node.createdAt ?? chain[0]?.createdAt,
      });

      if (node.children?.length) {
        node.children.forEach((child) => walk(child, newChain));
      }
    };

    categories.forEach((cat) => walk(cat, []));
    setRows(rows);
  };

  useEffect(() => {
    flattenCategories(categories);
  }, [categories]);

  return (
    <>
      {/* TOP BAR */}
      <Adder
        title="Add Category"
        search={search}
        setSearch={setSearch}
        onAdd={() => {
          setPopupKey((k) => k + 1);
          setEditData(null);
          setOpenForm(true);
        }}
      />

      {/* TABLE PLACEHOLDER (same as BrandManagement initially) */}
      <div className="bg-white rounded shadow ">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="px-4 py-3">Category ID</th>
              <th className="px-4 py-3">Category Name</th>
              <th className="px-4 py-3">Sub-Category</th>
              <th className="px-4 py-3">Sub-Sub-Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category Image</th>
              <th className="px-4 py-3">Sub Image</th>
              <th className="px-4 py-3">Sub-Sub Image</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody className="">
            {rows.map((row: CategoryRow, rowIndex) => {
              const chain = row.chain;
              const category = row.chain[0] as CategoryItem;
              const status = category?.status ?? false;

              // Get chain positions (safe access)
              const subCat = chain[1] as LevelBlock | undefined;
              const subSubCat = chain[2] as LevelBlock | undefined;
              const isLastRow = rowIndex === rows.length - 1;
              return (
                <tr
                  key={rowIndex}
                  ref={isLastRow ? lastCategoryRef : null}
                  className="border-b last:border-0 border-gray-200 "
                >
                  <td className="px-4 py-3">{category?.categoryId}</td>
                  <td className="px-4 py-3">{category?.name}</td>

                  {/* SubCategory */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      {subCat?.name ?? "—"}
                      {subCat && (
                        <FaTrash
                          className="text-red-500 cursor-pointer text-xs"
                          title="Delete SubCategory"
                          onClick={() =>
                            onDeleteLevel(category!.categoryId, subCat._id)
                          }
                        />
                      )}
                    </div>
                  </td>

                  {/* SubSubCategory */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      {subSubCat?.name ?? "—"}
                      {subSubCat && (
                        <FaTrash
                          className="text-red-500 cursor-pointer text-xs"
                          title="Delete Sub-SubCategory"
                          onClick={() =>
                            onDeleteLevel(category!.categoryId, subSubCat._id)
                          }
                        />
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Toggle
                      name="category"
                      id={category!.categoryId}
                      status={category!.status}
                    />
                  </td>

                  {/* Images */}
                  <td className="px-4 py-3">
                    {category?.image?.url && (
                      <img
                        src={category.image.url}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {subCat?.image?.url && (
                      <img
                        src={subCat.image.url}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {subSubCat?.image?.url && (
                      <img
                        src={subSubCat.image.url}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-blue-600">
                    <button
                      className="hover:underline mr-2"
                      onClick={() => onViewCategory(category!)}
                    >
                      View
                    </button>
                    |
                    <button
                      className="hover:underline mx-2"
                      onClick={() => {
                        setPopupKey((k) => k + 1);
                        setEditData(row);
                        setOpenForm(true);
                      }}
                    >
                      Edit
                    </button>
                    {/* | */}
                    {/* <button
                      className="hover:underline ml-2 text-red-600"
                      onClick={() => onDeleteLevel(category!.categoryId)}
                    >
                      Delete
                    </button> */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {hasMore && (
          <div className=" w-full justify-center items-center flex">
            <td colSpan={9} className="py-4 text-center text-gray-500">
              {loading && <FaSpinner className="animate-spin" />}
            </td>
          </div>
        )}
      </div>

      <Drawer
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="View Category"
        width="w-[520px]"
      >
        {viewCategory && (
          <div className="p-6 space-y-6">
            {/* CATEGORY */}
            <div className="flex items-center gap-4">
              {viewCategory.image?.url && (
                <img
                  src={viewCategory.image.url}
                  className="w-20 h-20 rounded object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold">{viewCategory.name}</h3>
                <p className="text-sm text-gray-500">
                  Category ID: {viewCategory.categoryId}
                </p>
              </div>
            </div>

            {/* CHILDREN */}
            <div>
              <h4 className="font-semibold mb-3">All Sub Categories</h4>

              {collectAllChildren(viewCategory.children).length === 0 && (
                <p className="text-sm text-gray-400">No sub categories</p>
              )}

              <div className="space-y-3">
                {collectAllChildren(viewCategory.children).map((child) => (
                  <div
                    key={child._id}
                    className="flex items-center gap-3 p-2 border border-gray-200 bg-amber-50 rounded"
                    style={{ marginLeft: (child.level - 1) * 16 }}
                  >
                    {child.image?.url && (
                      <img
                        src={child.image.url}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{child.name}</p>
                      <p className="text-xs text-gray-500">{child.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <AddCategoryForm
        key={popupKey}
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          setCategories([]);
          setPage(1);
          fetchCategories(1, search);
          setOpenForm(false);
        }}
        editData={editData}
      />

      
    </>
  );
}
