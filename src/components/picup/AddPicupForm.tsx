"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface AddPickupFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any; // optional data for editing
}

const AddPickupForm: React.FC<AddPickupFormProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");  
  const [pickup_location, setPickupLocation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pin_code, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setPhone(editData.phone);
      setEmail(editData.email);
      setAddress(editData.address);      
      setPickupLocation(editData.pickup_location);
      setCity(editData.city);
      setState(editData.state);
      setCountry(editData.country);
      setPin(editData.pin_code_code);
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setPickupLocation("");
      setCity("");
      setState("");
      setCountry("");
      setPin("");
    }
  }, [editData, open]);

  async function fetchFromPin(e: React.ChangeEvent<HTMLInputElement>) {
    const pin_code = e.target.value;
    setPin(pin_code);
    try {
      if (pin_code.length !== 6) {
        return;
      }
      if(pickup_location.length > 36) {
        toast.error(
          "The pickup location may not be greater than 36 characters.",
        );
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/pickup/location/${pin_code}`,
      );
      const data = await res.json();
      if (res.ok) {
        setCity(data.PostOffice[0].District);
        setState(data.PostOffice[0].State);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleSubmit = async () => {
    if (!name || !phone || !address || !city || !state || !pin_code || !country || !pickup_location || !email) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = { name, phone, address, email, pickup_location, city, state, country, pin_code };

    try {
      setLoading(true);

      let url = `${import.meta.env.VITE_BASE_URL}/api/pickup`;
      let method = "POST";

      if (editData?.pickupId) {
        url += `/${editData.pickupId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editData ? "Pickup updated!" : "Pickup added!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server not responding");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative ml-auto w-full sm:w-[750px] h-full bg-white shadow-2xl overflow-y-auto p-5">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <h2 className="text-xl font-semibold">
            {editData ? "Edit Pickup" : "Add Pickup"}
          </h2>
          <button className="text-2xl" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div>
            <label>Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div>
            <label>
              Address <span className="font-semibold">( Home / Flat No, Road No. is mandatory )</span>
            </label>
            <input
              type="text"
              value={address}
              placeholder="Home No. seperated by Road No."
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>
          <div>
            <label>
              Pickup Location <span className="font-semibold">( Landmark, Area, Colony etc. )</span>
            </label>
            <input
              type="text"
              value={pickup_location}              
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div>
            <label>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div>
            <label>State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>
          <div>
            <label>Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div>
            <label>Pin</label>
            <input
              type="text"
              value={pin_code}
              onChange={(e) => fetchFromPin(e)}
              className="w-full border border-gray-200 rounded px-3 py-2"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Submitting..." : editData ? "Update" : "Submit"}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPickupForm;
