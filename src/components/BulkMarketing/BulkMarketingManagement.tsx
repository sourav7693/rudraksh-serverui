import axios from "axios";
import React from "react";
import TemplateCard from "./TemplateCard";
import CustomerSelectionModal from "./CustomerSelectionModal";

const BulkMarketingManagement = () => {
  const [templates, setTemplates] = React.useState([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  async function fetchAllTemplates() {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/bulk-marketing/templates`,
      );
      setTemplates(data.templates);
    } catch (error) {
      console.log(error);
    }
  }

  React.useEffect(() => {
    fetchAllTemplates();
  }, []);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleSubmit = async (formData: any) => {
    try {
      console.log("Submitting form data:", formData);

      // Here you would make your API call to send/schedule the template
      // Example:
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/bulk-marketing/create`,
        formData,
      );

      console.log("API response:", response.data);

      if (response.status !== 201) {
        throw new Error("Failed to send template. Please try again.");
      }

      // For now, just show an alert
      alert(
        `Template will be sent to: ${formData.customerType}\n${formData.sendImmediately ? "Immediately" : `Scheduled for: ${formData.scheduledDateTime}`}`,
      );

      // Reset states after successful submission
      return Promise.resolve();
    } catch (error) {
      console.error("Error sending template:", error);
      alert("Failed to send template. Please try again.");
      return Promise.reject(error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(
          (template: {
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
          }) => (
            <TemplateCard
              key={template?.id}
              template={template}
              onSelectTemplate={handleTemplateSelect}
            />
          ),
        )}
      </div>

      <CustomerSelectionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        selectedTemplate={selectedTemplate}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default BulkMarketingManagement;
