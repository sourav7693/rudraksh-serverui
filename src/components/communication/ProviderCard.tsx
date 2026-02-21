import type { CommunicationProviderItem } from "../../types/types";

interface Props {
  data: CommunicationProviderItem;
  onEdit: () => void;
  onDelete: ()=>void
}

const ProviderCard: React.FC<Props> = ({ data, onEdit,onDelete }) => {
  return (
    <div className=" rounded-xl p-5 bg-white inset-shadow-custom-light">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
          <p
        className={`text-sm mb-3 ${
          data.enabled ? "text-green-600" : "text-red-500"
        }`}
      >
        {data.enabled ? "Enabled" : "Disabled"}
      </p>
      <div className=" flex flex-row gap-2">
        <button
          onClick={onEdit}
          className="text-blue-600 text-sm font-medium"
        >
          Edit
        </button>
         <button
          onClick={onDelete}
          className="text-red-600 text-sm font-medium"
        >
          Edit
        </button>
        </div>
      </div>

      {/* STATUS */}
    

      {/* CREDENTIALS */}
      {data.provider === "WHATSAPP" && (
        <div className="text-sm space-y-1 mb-4">
          <p><b>Auth Key:</b> {data.whatsapp_credentials?.auth_key || "-"}</p>
          <p><b>App Key:</b> {data.whatsapp_credentials?.app_key || "-"}</p>
          <p><b>Device ID:</b> {data.whatsapp_credentials?.device_id || "-"}</p>
        </div>
      )}

      {data.provider === "SMS" && (
        <div className="text-sm space-y-1 mb-4">
          <p><b>API Key:</b> {data.sms_credentials?.apiKey || "-"}</p>
          <p><b>Sender ID:</b> {data.sms_credentials?.senderId || "-"}</p>
        </div>
      )}

      {/* PURPOSES */}
      <div>
        <h4 className="font-semibold mb-2">Enabled Purposes</h4>

        <div className="flex flex-wrap gap-2">
          {Object.entries(data.purposes)
            .filter(([, cfg]) => cfg.enabled)
            .map(([key, cfg]) => (
              <div
                key={key}
                className="bg-gray-50 border rounded-md p-2 text-xs"
              >
                <p className="font-medium">{key}</p>
                <p>Template ID: {cfg.templateId || "-"}</p>
                <p>Template Name: {cfg.templateName || "-"}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
