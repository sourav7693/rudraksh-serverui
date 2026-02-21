import {
  BiCalendar,
  BiCheck,
  BiGlobe,
  BiHash,
  BiLink,
  BiPhone,
} from "react-icons/bi";
import { BsEye } from "react-icons/bs";

const getStatusColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "UTILITY":
      return "bg-blue-100 text-blue-800";
    case "MARKETING":
      return "bg-purple-100 text-purple-800";
    case "AUTHENTICATION":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TemplateCard({
  template,
  onSelectTemplate,
}: {
  template: {
    id: string;
    name: string;
    library_template_name: string;
    category: string;
    status: string;
    components: {
      type: string;
      text: string;
      buttons: { text: string; type: string }[];
      links: { text: string; type: string }[];
      dates: { text: string; type: string }[];
    }[];
    message_send_ttl_seconds: number;
    sub_category: string;
    language: string;
  };
  onSelectTemplate?: (template: any) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {template.name}
              </h3>
              {template.library_template_name && (
                <span className="text-xs px-2 py-1 border border-gray-300 rounded-full">
                  Clone
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <BiHash className="h-3 w-3" />
              {template.id}
            </p>
          </div>
          <button
            // onClick={() => copyToClipboard(template.id)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Copy ID"
          >
            <BiCheck className="h-4 w-4 text-green-600" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Template Preview */}
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="space-y-2">
            {template.components?.map(
              (
                component: {
                  type: string;
                  text: string;
                  buttons: { text: string; type: string }[];
                },
                index: number,
              ) => (
                <div key={index} className="text-sm">
                  {component.type === "HEADER" && component.text && (
                    <div className="font-semibold text-gray-900">
                      {component.text.replace(/\{\{\d+\}\}/g, "[VAR]")}
                    </div>
                  )}
                  {component.type === "BODY" && component.text && (
                    <div className="text-gray-700 whitespace-pre-line">
                      {component.text.replace(/\{\{\d+\}\}/g, "[VAR]")}
                    </div>
                  )}
                  {component.type === "FOOTER" && component.text && (
                    <div className="text-gray-500 text-xs mt-2">
                      {component.text}
                    </div>
                  )}
                  {component.type === "BUTTONS" && component.buttons && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {component.buttons.map(
                        (
                          button: { text: string; type: string },
                          btnIndex: number,
                        ) => (
                          <span
                            key={btnIndex}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-xs"
                          >
                            {button.type === "URL" && (
                              <BiLink className="h-3 w-3" />
                            )}
                            {button.type === "PHONE_NUMBER" && (
                              <BiPhone className="h-3 w-3" />
                            )}
                            {button.text}
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BiGlobe className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{template.language}</span>
          </div>
          {template.message_send_ttl_seconds && (
            <div className="flex items-center gap-2">
              <BiCalendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">
                {template.message_send_ttl_seconds / 60} min TTL
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}
            >
              {template.status}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}
            >
              {template.category}
            </span>
            {template.sub_category && (
              <span className="px-2 py-1 border border-gray-300 rounded-full text-xs">
                {template.sub_category}
              </span>
            )}
          </div>
          <button
            onClick={() => onSelectTemplate && onSelectTemplate(template)}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 bg-blue-50 text-blue-700"
          >
            <BsEye className="h-4 w-4" />
            Select & Send
          </button>
        </div>
      </div>
    </div>
  );
}
