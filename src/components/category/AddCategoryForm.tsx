import { useState, useEffect } from "react";
import type { CategoryItem, CategoryRow } from "./CategoryManagment";
export interface CategoryNode {
  _id: string;
  name: string;
  image?: string;
  categoryId?: string; // root-level unique ID
  children?: CategoryNode[];
}

export interface LevelBlock {
  level: number;
  name: string;
  image: File | null;
  parentChain: string[];
}

export interface AddCategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: CategoryRow | null;
}

interface PathNode {
  _id: string;
  name: string;
}

const getLevelLabel = (level: number) => {
  if (level === 1) return "Category";
  if (level === 2) return "Sub";
  if (level === 3) return "Sub-Sub";
  return `Level-${level - 2} SubCategory`;
};

export default function AddCategoryForm({
  onSuccess,
  open,
  onClose,
  editData,
}: AddCategoryFormProps) {
  // each item: { level, name, image, parentChain: [ancestorId_level1, ancestorId_level2, ...] }
  const [levels, setLevels] = useState<LevelBlock[]>([
    { level: 1, name: "", image: null, parentChain: [] },
  ]);

  // The full nested tree returned by GET /api/category
  const [tree, setTree] = useState<CategoryNode[]>([]);

  const [editingIds, setEditingIds] = useState<Record<number, string>>({});

  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});

  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [savingMode, setSavingMode] = useState<"create" | "update" | null>(
    null
  );

  const isSavingThis = (idx: number) => savingIdx === idx;

  // load full nested categories
  const loadCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/category`);
      const data = await res.json();
      const rawCats: CategoryItem[] = data?.categories ?? data ?? [];

      // Transform CategoryItem[] → CategoryNode[] for consistent tree ops
      const nodeTree: CategoryNode[] = rawCats.map((cat) => ({
        _id: cat.categoryId, // Root uses categoryId as _id
        name: cat.name,
        image: cat.image?.url,
        categoryId: cat.categoryId,
        children: transformChildren(cat.children || []),
      }));

      setTree(nodeTree);
    } catch (err) {
      console.error("loadCategories err:", err);
      setTree([]);
    }
  };

  // Recursive: LevelBlock[] → CategoryNode[]
  const transformChildren = (children: any[]): CategoryNode[] => {
    return children.map((child: any) => ({
      _id: child._id, // Child uses Mongo _id (ObjectId string)
      name: child.name,
      image: child.image?.url,
      categoryId: undefined, // Only root has categoryId
      children: child.children ? transformChildren(child.children) : [],
    }));
  };

  useEffect(() => {
    if (open) loadCategories();
  }, [open]);

  const findPathById = (
    nodes: CategoryNode[],
    targetId: string,
    path: PathNode[] = []
  ): PathNode[] | null => {
    for (const node of nodes) {
      const newPath = [...path, { _id: String(node._id), name: node.name }];
      if (String(node._id) === String(targetId)) {
        return newPath;
      }
      if (node.children && node.children.length) {
        const found = findPathById(node.children, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!open || !editData || !editData.chain || editData.chain.length === 0) {
      setLevels([{ level: 1, name: "", image: null, parentChain: [] }]);
      return;
    }

    // New CategoryRow has chain: [category, sub?, subsub?, ...]
    const chain = editData.chain;
    const targetId = chain[chain.length - 1]._id; // Last item = clicked node
    const category = chain[0] as CategoryItem;

    // For root only (chain.length === 1)
    if (chain.length === 1) {
      setLevels([
        {
          level: 1,
          name: category.name,
          image: null,
          parentChain: [],
        },
      ]);
      setEditingIds({ 0: category.categoryId });
      return;
    }

    // For nested: use tree to get FULL path (handles any depth)
    const path = findPathById(tree as CategoryNode[], targetId);
    if (!path || path.length === 0) {
      console.warn("Path not found for", targetId);
      return;
    }

    // ✅ Safe now:
    const editing: Record<number, string> = {};
    path.forEach((node, index) => {
      editing[index] = node._id; // ✅ path guaranteed non-null
    });
    setEditingIds(editing);
    // Build levels from path
    const populated: LevelBlock[] = [];
    path.forEach((node, index) => {
      const levelNum = index + 1;
      const parentChainIds = path.slice(0, index).map((p) => p._id);

      populated.push({
        level: levelNum,
        name: node.name,
        image: null,
        parentChain: parentChainIds,
      });
    });

    setLevels(populated);
  }, [open, editData, tree]);

  const findCurrentImage = (nodes: CategoryNode[], id: string): string => {
    for (const node of nodes) {
      if (node._id === id && node.image) return node.image;
      if (node.children?.length) {
        const found = findCurrentImage(node.children, id);
        if (found) return found;
      }
    }
    return "";
  };

  // find node in tree by _id (recursive)
  const findNodeById = (
    nodes: CategoryNode[],
    id: string
  ): CategoryNode | null => {
    if (!nodes || !id) return null;
    for (const node of nodes) {
      if (String(node._id) === String(id)) return node;
      if (node.children && node.children.length) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getAncestorOptions = (ancestorDepth: number, parentChain: string[]) => {
    if (ancestorDepth === 1) {
      return tree;
    }
    const parentId = parentChain[ancestorDepth - 2];
    if (!parentId) return [];
    const parentNode = findNodeById(tree, parentId);
    return parentNode?.children ?? [];
  };

  const addMoreLevel = () => {
    setLevels((prev) => [
      ...prev,
      { level: prev.length + 1, name: "", image: null, parentChain: [] },
    ]);
  };

  const handleAncestorChange = (
    levelIndex: number,
    ancestorDepth: number,
    value: string
  ) => {
    setLevels((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const block = next[levelIndex];
      if (!block.parentChain) block.parentChain = [];
      // set the selected id at position ancestorDepth-1
      block.parentChain[ancestorDepth - 1] = value || null;
      // clear any deeper selections in the chain (if user changed parent)
      block.parentChain = block.parentChain.slice(0, ancestorDepth);
      return next;
    });
  };

  const handleFileChange = (levelIndex: number, file: File | null) => {
    setLevels((prev) => {
      const next = [...prev];
      next[levelIndex] = {
        ...next[levelIndex],
        image: file,
      };
      return next;
    });
    setPreviewUrls((prev) => {
      const next = { ...prev };

      // cleanup old url (avoid memory leak)
      if (next[levelIndex]) URL.revokeObjectURL(next[levelIndex]);

      if (file) next[levelIndex] = URL.createObjectURL(file);
      else delete next[levelIndex];

      return next;
    });
  };

  const handleNameChange = (levelIndex: number, value: string) => {
    setLevels((prev) => {
      const next = [...prev];
      next[levelIndex].name = value;
      return next;
    });
  };

  const typeForLevel = (level: number) => {
    if (level === 1) return "Category";
    if (level === 2) return "Sub";
    if (level === 3) return "Sub-Sub";
    return `Level-${level - 2} SubCategory`;
  };

  const submitLevel = async (idx: number) => {
    const block = levels[idx];
    if (!block.name || !block.name.trim()) return alert("Enter name");

    setSavingIdx(idx);
    setSavingMode("create");

    if (block.level > 1) {
      const neededDepth = block.level - 1; // e.g., level3 needs parentChain of length 2 (root + sub)
      if (
        !block.parentChain ||
        block.parentChain.length < neededDepth ||
        !block.parentChain[neededDepth - 1]
      ) {
        return alert("Please select parent chain for this level");
      }
    }

    const fd = new FormData();
    fd.append("name", block.name.trim());
    // dynamic type
    fd.append("type", typeForLevel(block.level));
    if (block.image) fd.append("image", block.image);

    try {
      let res;
      let data;

      // Level 1 -> create root category
      if (block.level === 1) {
        res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/category`, {
          method: "POST",
          body: fd,
        });
        data = await res.json();
      } else {
        // For nested: find root categoryId (categoryId field on root node)
        const rootId = block.parentChain[0];

        const rootNode = findNodeById(tree, rootId);
        if (!rootNode) {
          return alert("Root category not found");
        }

        const parentId = block.parentChain[block.parentChain.length - 1];

        fd.append("parentId", parentId);
        fd.append("categoryId", rootNode.categoryId || rootNode._id);

        res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/category/add-child`,
          {
            method: "POST",
            body: fd,
          }
        );
        data = await res.json();
      }

      if (!res.ok) {
        return alert(data?.message || "Error saving");
      }



      onSuccess();

      setLevels((prev) => {
        const next = [...prev];
        next[idx] = {
          level: next[idx].level,
          name: "",
          image: null,
          parentChain: [],
        };
        return next;
      });
    } catch (err) {
      console.error("submitLevel err:", err);
      alert("Error saving");
    } finally {
      setSavingIdx(null);
      setSavingMode(null);
    }
  };

  const updateLevel = async (idx: number) => {
    const block = levels[idx];
    if (!block.name?.trim()) return alert("Enter name");
    if (!editingIds[idx]) return alert("No item selected for update");

    setSavingIdx(idx);
    setSavingMode("update");

    const rootCategoryId =
      (editData?.chain?.[0] as CategoryItem)?.categoryId ||
      block.parentChain[0];

    if (!rootCategoryId) return alert("Root categoryId missing");

    const fd = new FormData();
    if (block.image) fd.append("image", block.image);

    if (block.level === 1) {
      // Root category update -> NO childId
      fd.append("name", block.name.trim());
    } else {
      // Nested update -> childId must be Mongo _id, and use newChildName
      const targetChildMongoId = editingIds[idx];
      if (!targetChildMongoId) return alert("No child selected for update");

      fd.append("childId", targetChildMongoId);
      fd.append("newChildName", block.name.trim());
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/category/${rootCategoryId}`,
        {
          method: "PUT",
          body: fd,
        }
      );
      const data = await res.json();

      if (!res.ok) {
        return alert(data?.message || "Update failed");
      }


      onSuccess(); // Parent refresh

      // Clear editing
      setEditingIds((prev) => {
        const newState = { ...prev };
        delete newState[idx];
        return newState;
      });
      setLevels((prev) => {
        const next = [...prev];
        next[idx] = {
          level: next[idx].level,
          name: "",
          image: null,
          parentChain: [],
        };
        return next;
      });
    } catch (err) {
      console.error("updateLevel err:", err);
      alert("Update failed");
    } finally {
      setSavingIdx(null);
      setSavingMode(null);
    }
  };

  // Helper reset
  const resetLevel = (index: number) => {
    setLevels((prev) => {
      const next = [...prev];
      next[index] = {
        level: next[index].level,
        name: "",
        image: null,
        parentChain: [],
      };
      return next;
    });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[820px] bg-white shadow-xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-6 bg-gray-700 text-white w-10 h-10 rounded-full"
          onClick={onClose}
        >
          ×
        </button>

        <div className="p-6 overflow-y-auto h-full space-y-6">
          {levels.map((lvl, index) => {
            const label = getLevelLabel(lvl.level);

            return (
              <div key={index} className="p-4 rounded shadow">
                <h2 className="font-semibold mb-3">
                  {label} (Level {lvl.level})
                </h2>

                {/* Render cascading ancestor selects for this block (for levels > 1) */}
                {Array.from({ length: Math.max(0, lvl.level - 1) }).map(
                  (_, ancestorIdx) => {
                    const ancestorDepth = ancestorIdx + 1; // 1-based depth
                    const options = getAncestorOptions(
                      ancestorDepth,
                      lvl.parentChain || []
                    );
                    return (
                      <div key={ancestorDepth} className="mb-3">
                        <label className="block text-sm font-medium mb-1">
                          {ancestorDepth === 1
                            ? "Category"
                            : `Parent Level ${ancestorDepth}`}
                        </label>
                        <select
                          className="border h-[3.5rem] border-gray-200 outline-none p-2 w-full"
                          value={
                            (lvl.parentChain && lvl.parentChain[ancestorIdx]) ||
                            ""
                          }
                          onChange={(e) =>
                            handleAncestorChange(
                              index,
                              ancestorDepth,
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select</option>
                          {options.length === 0 && (
                            <option disabled>No options</option>
                          )}
                          {options.map((opt) => (
                            <option key={opt._id} value={opt._id}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                )}
                <div className="flex flex-row gap-4">
                  {/* Name */}
                  <div className=" flex flex-col gap-6 w-full">
                    <input
                      type="text"
                      className="border p-2 border-gray-200 w-full rounded-md h-[3.5rem] outline-none"
                      placeholder="Name"
                      value={lvl.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                    />

                    {/* Image */}
                    <input
                      type="file"
                      accept="image/*"
                      className="border p-2  border-gray-200 w-full rounded-md  h-[3.5rem] outline-none  "
                      onChange={(e) =>
                        handleFileChange(index, e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  <div className="w-auto">
                    <div className="w-[8.5rem] h-[8.5rem] bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                      {previewUrls[index] ? (
                        <img
                          src={previewUrls[index]}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : editingIds[index] ? (
                        // Edit mode: show existing saved image from API
                        (() => {
                          const url = findCurrentImage(tree, editingIds[index]);
                          return url ? (
                            <img
                              src={url}
                              alt="Current"
                              className="w-full h-full object-cover"
                            />
                          ) : null;
                        })()
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  {editingIds[index] ? (
                    // Update mode (when editing)
                    <>
                      <button
                       className="bg-green-600/30 text-green-900 hover:bg-green-600 hover:text-white transform duration-700 font-semibold p-2 flex-1 disabled:opacity-60"
                        disabled={isSavingThis(index)}
                        onClick={() => updateLevel(index)}
                        type="button"
                      >
                        {isSavingThis(index)
                          ? "Updating..."
                          : `Update ${label}`}
                      </button>
                      <button
                        className="bg-orange-400/60 text-orange-800 hover:bg-orange-400 hover:text-white transform duration-700 font-semibold p-2 flex-1 disabled:opacity-60"
                        disabled={isSavingThis(index)}
                        onClick={() => {
                          setEditingIds((prev) => {
                            const newState = { ...prev };
                            delete newState[index]; // ✅ Properly removes key
                            return newState;
                          });
                          // Reset field
                          setLevels((prev) => {
                            const next = [...prev];
                            next[index].name = "";
                            return next;
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    // Add mode
                    <>
                      <button
                        className="bg-blue-600/40 text-blue-800 hover:bg-blue-600 hover:text-white transform duration-700 font-semibold p-2 flex-1"
                        disabled={isSavingThis(index)}
                        onClick={() => submitLevel(index)}
                        type="button"
                      >
                        {isSavingThis(index) ? "Saving..." : `Save ${label}`}
                      </button>
                      <button
                        className="bg-gray-300/30 font-semibold hover:bg-gray-300 transform duration-700 text-black p-2 flex-1"
                        disabled={isSavingThis(index)}
                        onClick={() => resetLevel(index)}
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
{editData ? "": (
          <div className="flex gap-3">
            <button
              onClick={addMoreLevel}
              className="w-full bg-blue-600/40  text-blue-900 hover:bg-blue-600 hover:text-white transform duration-700 font-semibold p-3 rounded"
            >
              + Add More Level
            </button>

            <button
              onClick={() =>
                setLevels([
                  { level: 1, name: "", image: null, parentChain: [] },
                ])
              }
              className="w-full bg-red-500/40 text-red-800 hover:bg-red-500 hover:text-white transform duration-700 font-semibold p-3 rounded"
            >
              Reset All
            </button>
          </div>) }
        </div>
      </div>
    </>
  );
}
