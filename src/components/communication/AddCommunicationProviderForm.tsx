import React, { useEffect, useState } from "react";
import axios from "axios";

type ProviderType = "SMS" | "WHATSAPP";

type CommunicationPurpose =
  | "LOGIN_OTP"
  | "SIGNUP_OTP"
  | "ORDER_CONFIRMATION"
  | "ORDER_CANCELLATION"
  | "ORDER_REFUND"
  | "ORDER_REPLACEMENT"
  | "PRODUCT_SHIPPED"
  | "PROMOTIONAL_ALL"
  | "PROMOTIONAL_CART"
  | "PROMOTIONAL_REGISTERED";

interface PurposeConfig {
  enabled: boolean;
  templateId?: string;
  templateName?: string;
}

const PURPOSES: CommunicationPurpose[] = [
  "LOGIN_OTP",
  "SIGNUP_OTP",
  "ORDER_CONFIRMATION",
  "ORDER_CANCELLATION",
  "ORDER_REFUND",
  "ORDER_REPLACEMENT",
  "PRODUCT_SHIPPED",
  "PROMOTIONAL_ALL",
  "PROMOTIONAL_CART",
  "PROMOTIONAL_REGISTERED",
];

const initialPurposes: Record<CommunicationPurpose, PurposeConfig> = {
  LOGIN_OTP: { enabled: false },
  SIGNUP_OTP: { enabled: false },
  ORDER_CONFIRMATION: { enabled: false },
  ORDER_CANCELLATION: { enabled: false },
  ORDER_REFUND: { enabled: false },
  ORDER_REPLACEMENT: { enabled: false },
  PRODUCT_SHIPPED: { enabled: false },
  PROMOTIONAL_ALL: { enabled: false },
  PROMOTIONAL_CART: { enabled: false },
  PROMOTIONAL_REGISTERED: { enabled: false },
};


type ProviderFormType= {
onClose: ()=> void;
  onSuccess: () => void;
  fetchProviders:()=>void;
  editData?: any | null;
}

const AddCommunicationProviderForm: React.FC<ProviderFormType> = ({onClose, onSuccess, editData,fetchProviders}) => {
  const isEdit = !!editData;

  const [provider, setProvider] = useState<ProviderType>(
    editData?.provider || "WHATSAPP"
  );
  const [enabled, setEnabled] = useState(
    editData?.enabled ?? true
  );

  const [smsCredentials, setSmsCredentials] = useState(
    editData?.sms_credentials || {
      apiKey: "",
      senderId: "",
      phoneNumberId: "",
    }
  );

  const [whatsappCredentials, setWhatsappCredentials] = useState(
    editData?.whatsapp_credentials || {
      auth_key: "",
      app_key: "",
      device_id: "",
    }
  );

  const [purposes, setPurposes] = useState<
    Record<CommunicationPurpose, PurposeConfig>
  >(editData?.purposes || initialPurposes);


  useEffect(() => {
  if (!editData) return;

  setProvider(editData.provider);
  setEnabled(editData.enabled);
  setSmsCredentials(editData.sms_credentials || {});
  setWhatsappCredentials(editData.whatsapp_credentials || {});
  setPurposes(editData.purposes || initialPurposes);
}, [editData]);

  const handlePurposeToggle = (key: CommunicationPurpose) => {
    setPurposes((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled,
      },
    }));
  };

  const handlePurposeChange = (
    key: CommunicationPurpose,
    field: "templateId" | "templateName",
    value: string
  ) => {
    setPurposes((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

const submit = async () => {
  const payload: any = {
    provider,
    enabled,
    purposes,
  };

  if (provider === "SMS") {
    payload.sms_credentials = smsCredentials;
  }

  if (provider === "WHATSAPP") {
    payload.whatsapp_credentials = whatsappCredentials;
  }

  // validation
  for (const [key, cfg] of Object.entries(purposes)) {
    if (cfg.enabled && !cfg.templateId && !cfg.templateName) {
      return alert(`${key}: Template ID or Name required`);
    }
  }

  try {
    if (isEdit) {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/communication-provider/${editData._id}`,
        payload
      );
    } else {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/communication-provider`,
        payload
      );
    }

    onSuccess();
    fetchProviders();
  } catch (err: any) {
    alert(err?.response?.data?.message || "Server error");
  }
};


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow">

      {/* Provider */}
      <div>
        <label className="block mb-1 font-medium">Provider</label>
        <select
          value={provider}
           disabled={isEdit}
          onChange={(e) => setProvider(e.target.value as ProviderType)}
          className="w-full border px-3 py-2 rounded-md"
        >
          <option value="WHATSAPP">WhatsApp</option>
          <option value="SMS">SMS</option>
        </select>
      </div>

      {/* Enabled */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        />
        <span className="font-medium">Provider Enabled</span>
      </div>

      {/* Credentials */}
      {provider === "SMS" && (
        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">SMS Credentials</h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              placeholder="API Key"
              className="border px-3 py-2 rounded"
              value={smsCredentials.apiKey}
              onChange={(e) =>
                setSmsCredentials({ ...smsCredentials, apiKey: e.target.value })
              }
            />
            <input
              placeholder="Sender ID"
              className="border px-3 py-2 rounded"
              value={smsCredentials.senderId}
              onChange={(e) =>
                setSmsCredentials({
                  ...smsCredentials,
                  senderId: e.target.value,
                })
              }
            />
          </div>
        </div>
      )}

      {provider === "WHATSAPP" && (
        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">WhatsApp Credentials</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className=" flex flex-row gap-2 items-center">
            <label htmlFor="" className="w-[20%]">Auth Key :- </label>
            <input
              placeholder="Auth Key"
              className="border px-3 py-2 rounded w-full"
              value={whatsappCredentials.auth_key}
              onChange={(e) =>
                setWhatsappCredentials({
                  ...whatsappCredentials,
                  auth_key: e.target.value,
                })
              }
            />
            </div>
            <div className=" flex flex-row gap-2 items-center">
                <label htmlFor="" className=" w-[20%]">App Key:- </label>
            <input
              placeholder="App Key"
              className="border px-3 py-2 rounded w-full"
              value={whatsappCredentials.app_key}
              onChange={(e) =>
                setWhatsappCredentials({
                  ...whatsappCredentials,
                  app_key: e.target.value,
                })
              }
            /></div>
            <div className=" flex flex-row gap-2 items-center">
                <label htmlFor="" className=" w-[20%]">Device Id:- </label>
            <input
              placeholder="Device ID"
              className="border px-3 py-2 rounded w-full"
              value={whatsappCredentials.device_id}
              onChange={(e) =>
                setWhatsappCredentials({
                  ...whatsappCredentials,
                  device_id: e.target.value,
                })
              }
            />
            </div>
          </div>
        </div>
      )}

      {/* Purposes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Purpose Configuration</h3>

        {PURPOSES.map((purpose) => (
          <div
            key={purpose}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium">{purpose}</span>
              <input
                type="checkbox"
                checked={purposes[purpose].enabled}
                onChange={() => handlePurposeToggle(purpose)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Template ID"
                disabled={!purposes[purpose].enabled}
                className="border px-3 py-2 rounded"
                value={purposes[purpose].templateId || ""}
                onChange={(e) =>
                  handlePurposeChange(
                    purpose,
                    "templateId",
                    e.target.value
                  )
                }
              />
              <input
                placeholder="Template Name"
                disabled={!purposes[purpose].enabled}
                className="border px-3 py-2 rounded"
                value={purposes[purpose].templateName || ""}
                onChange={(e) =>
                  handlePurposeChange(
                    purpose,
                    "templateName",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
    <button
  onClick={submit}
  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
>
  {isEdit ? "Update Configuration" : "Save Configuration"}
</button>
    </div>
  );
};

export default AddCommunicationProviderForm;
