import { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaRegClock } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { BsPhone } from "react-icons/bs";
import { HiExternalLink } from "react-icons/hi";
import axios from "axios";

const parseMobileNumbers = (input: string): string[] => {
  // Split by comma, newline, or space
  return input
    .split(/[\n,]/)
    .map((num) => num.trim())
    .filter((num) => {
      // Basic validation - at least 10 digits
      const digits = num.replace(/\D/g, "");
      return digits.length >= 10;
    })
    .map((num) => {
      // Clean the number
      let cleaned = num.replace(/\D/g, "");

      // Remove leading 0
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }

      // Add country code if not present (assuming India: 91)
      if (!cleaned.startsWith("91") && cleaned.length === 10) {
        cleaned = `91${cleaned}`;
      }

      return cleaned;
    });
};

export default function CustomerSelectionModal({
  isOpen,
  onClose,
  selectedTemplate,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: any;
  onSubmit: (data: any) => void;
}) {
  const [selectedCustomerType, setSelectedCustomerType] = useState("all");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [immediateSend, setImmediateSend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateParameters, setTemplateParameters] = useState<{
    [key: string]: string;
  }>({});
  const [customerList, setCustomerList] = useState([]);
  const [mobileList, setMobileList] = useState<string[]>([]);

  // Customer type options
  const customerTypes = [
    {
      id: "all",
      label: "All Customers",
      description: "Send to all registered customers",
    },
    {
      id: "ordered",
      label: "Ordered Customers",
      description: "Customers who have placed at least one order",
    },
    {
      id: "registered",
      label: "Only Registered Customers (Not ordered)",
      description: "Registered users who haven't placed any order yet",
    },
    {
      id: "cart",
      label: "All Cart Users",
      description: "Users with items in their cart",
    },
    {
      id: "wishlist",
      label: "All Wishlist Users",
      description: "Users with items in their wishlist",
    },
  ];

  // Extract parameters from template
  const extractParameters = (template: any) => {
    const params: { [key: string]: string } = {};

    // Check all components for parameters
    template.components?.forEach((component: any) => {
      if (component.text) {
        const paramMatches = component.text.match(/{{(\d+)}}/g) || [];
        paramMatches.forEach((match: string) => {
          const paramNum = match.replace(/[{}]/g, "");
          params[paramNum] = "";
        });
      }

      // Check buttons for parameters in URLs
      if (component.type === "BUTTONS" && component.buttons) {
        component.buttons.forEach((button: { text: string; url: string }) => {
          if (button.url && button.url.includes("{{")) {
            const paramMatches = button.url.match(/{{(\d+)}}/g) || [];
            paramMatches.forEach((match: string) => {
              const paramNum = match.replace(/[{}]/g, "");
              params[paramNum] = "";
            });
          }
        });
      }
    });

    // Get example values for placeholders
    const bodyComponent = template.components?.find(
      (comp: { type: string }) => comp.type === "BODY",
    );
    if (bodyComponent?.example?.body_text?.[0]) {
      const examples = bodyComponent.example.body_text[0];
      Object.keys(params).forEach((key, index) => {
        if (examples[index]) {
          params[key] = examples[index];
        }
      });
    }

    return params;
  };

  // Format time for preview
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && selectedTemplate) {
      setSelectedCustomerType("all");
      setScheduleTime("");
      setScheduleDate("");
      setImmediateSend(true);
      setMobileList([]);
      const params = extractParameters(selectedTemplate);
      setTemplateParameters(params);
    }
  }, [isOpen, selectedTemplate]);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const handleParameterChange = (paramKey: string, value: string) => {
    setTemplateParameters((prev) => ({
      ...prev,
      [paramKey]: value,
    }));
  };

  // Render template preview
  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="bg-[#f0f0f0] p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FaWhatsapp className="h-6 w-6 text-green-600" />
            <div>
              <div className="font-medium text-gray-800">WhatsApp</div>
              <div className="text-xs text-gray-500">Business Account</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">{formatTime()}</div>
        </div>

        <div className="bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-200 p-4">
          {/* Header */}
          {selectedTemplate.components?.map(
            (component: { type: string; text: string }, index: number) => {
              if (component.type === "HEADER") {
                const headerText = Object.keys(templateParameters).reduce(
                  (text, paramKey) => {
                    return text.replace(
                      new RegExp(`{{${paramKey}}}`, "g"),
                      templateParameters[paramKey] || `{{${paramKey}}}`,
                    );
                  },
                  component.text || "",
                );

                return (
                  <div key={`header-${index}`} className="mb-3">
                    <div className="font-bold text-lg text-gray-800">
                      {headerText}
                    </div>
                  </div>
                );
              }
              return null;
            },
          )}

          {/* Body */}
          {selectedTemplate.components?.map(
            (component: { type: string; text: string }, index: number) => {
              if (component.type === "BODY") {
                let bodyText = component.text || "";

                // Replace parameters
                Object.keys(templateParameters).forEach((paramKey) => {
                  bodyText = bodyText.replace(
                    new RegExp(`{{${paramKey}}}`, "g"),
                    templateParameters[paramKey] || `{{${paramKey}}}`,
                  );
                });

                return (
                  <div key={`body-${index}`} className="mb-3">
                    <div className="text-gray-700 whitespace-pre-line">
                      {bodyText}
                    </div>
                  </div>
                );
              }
              return null;
            },
          )}

          {/* Footer */}
          {selectedTemplate.components?.map(
            (component: { type: string; text: string }, index: number) => {
              if (component.type === "FOOTER") {
                const footerText = Object.keys(templateParameters).reduce(
                  (text, paramKey) => {
                    return text.replace(
                      new RegExp(`{{${paramKey}}}`, "g"),
                      templateParameters[paramKey] || `{{${paramKey}}}`,
                    );
                  },
                  component.text || "",
                );

                return (
                  <div
                    key={`footer-${index}`}
                    className="mt-4 pt-3 border-t border-gray-100"
                  >
                    <div className="text-gray-500 text-sm">{footerText}</div>
                  </div>
                );
              }
              return null;
            },
          )}

          {/* Buttons */}
          {selectedTemplate.components?.map(
            (
              component: {
                type: string;
                buttons: { text: string; url: string; type: string }[];
              },
              index: number,
            ) => {
              if (component.type === "BUTTONS" && component.buttons) {
                return (
                  <div key={`buttons-${index}`} className="mt-4 space-y-2">
                    {component.buttons.map((button, btnIndex) => {
                      // Replace parameters in URL
                      let buttonUrl = button.url || "";
                      Object.keys(templateParameters).forEach((paramKey) => {
                        buttonUrl = buttonUrl.replace(
                          new RegExp(`{{${paramKey}}}`, "g"),
                          templateParameters[paramKey] || `{{${paramKey}}}`,
                        );
                      });

                      return (
                        <div key={`button-${btnIndex}`}>
                          {button.type === "URL" && (
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium text-center transition-colors"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <span>{button.text}</span>
                                <HiExternalLink className="h-4 w-4" />
                              </div>
                            </a>
                          )}

                          {button.type === "PHONE_NUMBER" && (
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className="block bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 py-2 px-4 rounded-lg text-sm font-medium text-center transition-colors"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <BsPhone className="h-4 w-4" />
                                <span>{button.text}</span>
                              </div>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              }
              return null;
            },
          )}
        </div>

        {/* WhatsApp signature */}
        <div className="text-xs text-gray-500 mt-3 text-center">
          You're receiving this message because you're registered with Pri Priya
          Nursery
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingParams = Object.keys(templateParameters).filter(
      (key) => !templateParameters[key]?.toString().trim(),
    );

    if (missingParams.length > 0) {
      alert(
        `Please fill all template parameters:\n${missingParams.map((p) => `Parameter ${p}`).join("\n")}`,
      );
      return;
    }

    if (!immediateSend && (!scheduleDate || !scheduleTime)) {
      alert("Please select schedule date and time");
      return;
    }

    setIsSubmitting(true);

    let scheduledDateTime = null;
    if (!immediateSend && scheduleDate && scheduleTime) {
      // Combine date and time into ISO string
      const dateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      scheduledDateTime = dateTime.toISOString();

      // Optional: Validate future date
      if (dateTime <= new Date()) {
        alert("Please select a future date and time");
        setIsSubmitting(false);
        return;
      }
    }

    const scheduleData = immediateSend
      ? { sendImmediately: true }
      : {
          sendImmediately: false,
          scheduleDate,
          scheduleTime,
          scheduledDateTime, // Use the properly combined datetime
        };

    const formData = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      customerType: selectedCustomerType,
      mobileNumbers: mobileList,
      parameters: templateParameters,
      parametersArray: Object.keys(templateParameters)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((key) => templateParameters[key]),
      ...scheduleData,
    };

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  async function fetchCustomers() {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/customer/filter?filterType=${selectedCustomerType}`,
      );
      setCustomerList(data.customers);
      data.customers.forEach((customer: { mobile: string }) => {
        setMobileList((prevList) => [...prevList, customer.mobile]);
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, [selectedCustomerType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Send WhatsApp Template
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">
                  {selectedTemplate?.name}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                  {selectedTemplate?.category?.toLowerCase()}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <AiOutlineClose className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Template Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Preview
                </label>
                {renderTemplatePreview()}
              </div>

              {/* Template Parameters */}
              {Object.keys(templateParameters).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fill Template Variables
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(templateParameters)
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .map((paramKey) => (
                        <div key={paramKey} className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            {paramKey === "1"
                              ? "First"
                              : paramKey === "2"
                                ? "Second"
                                : paramKey === "3"
                                  ? "Third"
                                  : `${paramKey}th`}{" "}
                            Variable
                          </label>
                          <input
                            type="text"
                            value={templateParameters[paramKey]}
                            onChange={(e) =>
                              handleParameterChange(paramKey, e.target.value)
                            }
                            placeholder={`Enter value for {{${paramKey}}}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Customer Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Audience
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customerTypes.map((type) => (
                    <div key={type.id} className="relative">
                      <input
                        id={`customer-type-${type.id}`}
                        type="radio"
                        checked={selectedCustomerType === type.id}
                        onChange={() => setSelectedCustomerType(type.id)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`customer-type-${type.id}`}
                        className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedCustomerType === type.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-4 w-4 border rounded-full mr-3 flex items-center justify-center ${
                              selectedCustomerType === type.id
                                ? "border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedCustomerType === type.id && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            {type.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-7">
                          {type.description}
                        </p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Options */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Sending Schedule
                </label>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Immediate Send Option */}
                  <div className="flex-1">
                    <input
                      id="immediate-send"
                      type="radio"
                      checked={immediateSend}
                      onChange={() => setImmediateSend(true)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="immediate-send"
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        immediateSend
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <div
                          className={`h-5 w-5 border rounded-full flex items-center justify-center ${
                            immediateSend
                              ? "border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {immediateSend && (
                            <div className="h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            Send Immediately
                          </span>
                          <FaRegClock className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Send to selected customers right away
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Schedule for Later Option */}
                  <div className="flex-1">
                    <input
                      id="schedule-later"
                      type="radio"
                      checked={!immediateSend}
                      onChange={() => setImmediateSend(false)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="schedule-later"
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        !immediateSend
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        <div
                          className={`h-5 w-5 border rounded-full flex items-center justify-center ${
                            !immediateSend
                              ? "border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {!immediateSend && (
                            <div className="h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <span className="font-medium text-gray-900">
                          Schedule for Later
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Set a specific date and time
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Date and Time Picker */}
                {!immediateSend && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={today}
                        max={maxDateStr}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Within next 30 days
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time
                      </label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        24-hour format
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center sticky bottom-0 bg-white z-10">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{customerList.length || 0}</span>{" "}
                customers will receive this message
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaWhatsapp className="mr-2 h-4 w-4" />
                      Send via WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
