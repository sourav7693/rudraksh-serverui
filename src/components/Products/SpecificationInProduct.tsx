import { FaPlus } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { useEffect } from "react";

type SpecificationItem = {
  name: string;
  details: string;
};

interface Props {
  specifications: SpecificationItem[];
  setSpecifications: React.Dispatch<React.SetStateAction<SpecificationItem[]>>;
}

const SpecificationInProduct: React.FC<Props> = ({
  specifications,
  setSpecifications,
}) => {



  const addSpec = () => {
    setSpecifications((prev) => [...prev, { name: "", details: "" }]);
  };

  const removeSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpec = (
    index: number,
    field: "name" | "details",
    value: string
  ) => {
    setSpecifications((prev) =>
      prev.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      )
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-base font-semibold">Specifications</h1>

      {specifications.map((spec, index) => (
        <div key={index} className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Specification Name"
            value={spec.name}
            onChange={(e) => updateSpec(index, "name", e.target.value)}
            className="border border-gray-200 px-2 h-[3.5rem] rounded-md w-full text-xs outline-none"
          />

          <input
            type="text"
            placeholder="Specification Details"
            value={spec.details}
            onChange={(e) => updateSpec(index, "details", e.target.value)}
            className="border border-gray-200 px-2 h-[3.5rem] rounded-md w-full text-xs outline-none"
          />

          <div className="flex gap-2">
            {specifications.length > 1 && (
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="size-[3.5rem] border flex justify-center items-center rounded-md text-red-600"
              >
                <RxCross1 />
              </button>
            )}

            {index === specifications.length - 1 && (
              <button
                type="button"
                onClick={addSpec}
                className="size-[3.5rem] border flex justify-center items-center rounded-md text-defined-blue"
              >
                <FaPlus />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecificationInProduct;
