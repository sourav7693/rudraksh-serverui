import Helmet from "react-helmet"
import BulkMarketingManagement from "../components/BulkMarketing/BulkMarketingManagement"

const BulkMarketing = () => {
  return (
   <div className="self-padding">
    <Helmet>
      <title>Ganapati Rudrakshaam Admin | Bulk Marketing</title>
    </Helmet>
      <h2 className="text-2xl font-semibold">Bulk SMS / Bulk Marketing</h2>
       <BulkMarketingManagement />
    </div>
  )
}

export default BulkMarketing