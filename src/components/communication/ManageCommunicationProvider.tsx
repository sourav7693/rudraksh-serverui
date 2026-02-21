import React, { useEffect, useState } from 'react'
import AddCommunicationProviderForm from './AddCommunicationProviderForm'
import Drawer from '../../global/Drawer';
import type { CommunicationProviderItem } from '../../types/types';
import axios from 'axios';
import ProviderCard from './ProviderCard';

const ManageCommunicationProvider = () => {
     const [openForm, setOpenForm] = useState(false);
      const [popupKey, setPopupKey] = useState(0);
      const [providers, setProviders] = useState<CommunicationProviderItem[]>([]);
        const [editData, setEditData] =
    useState<CommunicationProviderItem | null>(null);

      const fetchProviders = async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/communication-provider`
    );
    setProviders(res.data.data || []);
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const deleteProvider = async (id: string) => {
  if (!confirm("Are you sure you want to delete this provider?")) return;

  await axios.delete(
    `${import.meta.env.VITE_BASE_URL}/api/communication-provider/${id}`
  );

  fetchProviders(); // refresh list
};

  const whatsappProviders = providers.filter(
    (p) => p.provider === "WHATSAPP"
  );
  const smsProviders = providers.filter(
    (p) => p.provider === "SMS"
  );
  return (
    <div className=' flex flex-col gap-6'>
      <div className=' flex flex-row justify-between items-center'>
        <div></div>
        <div>
            <button onClick={() => {
          setOpenForm(true);
          setPopupKey((k)=> k+1)
        }} className=' px-6 w-fit h-[3.5rem] flex justify-center items-center bg-defined-blue text-white rounded-md'>
                Add Provider
            </button>
        </div>
      </div>

         <div>
        <h2 className="text-xl font-semibold mb-4">WhatsApp Provider</h2>

        <div className="grid grid-cols-2 gap-6">
          {whatsappProviders.map((item) => (
            <ProviderCard
              key={item._id}
              data={item}
              onEdit={() => {
                setEditData(item);
                setOpenForm(true);
              }}
              onDelete={() =>deleteProvider(item._id)}
            />
          ))}
        </div>
      </div>

      {/* SMS SECTION */}
      <div>
        <h2 className="text-xl font-semibold mb-4">SMS Provider</h2>

        <div className="grid grid-cols-2 gap-6">
          {smsProviders.map((item) => (
            <ProviderCard
              key={item._id}
              data={item}
              onEdit={() => {
                setEditData(item);
                setOpenForm(true);
              }}
               onDelete={() =>deleteProvider(item._id)}
            />
          ))}
        </div>
      </div>

    <Drawer
  open={!!openForm}
  onClose={() => {
    setOpenForm(false);
    setEditData(null);
  }}
  title={editData ? "Edit Communication Provider" : "Add Communication Provider"}
>
  <AddCommunicationProviderForm
    editData={editData}
    onSuccess={() => {
      fetchProviders();
      setOpenForm(false);
      setEditData(null);
    }}
    onClose={() => {
      setOpenForm(false);
      setEditData(null);
    }}
    fetchProviders={fetchProviders}
    key={popupKey}
  />
</Drawer>

      
    </div>
  )
}

export default ManageCommunicationProvider
