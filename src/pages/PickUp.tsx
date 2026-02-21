
import Helmet from "react-helmet"
import PickupManagement from "../components/picup/PickupManagment"


const PickUp = () => {
  return (
    <>
    <Helmet>
      <title>Pri Priya Nursury Admin | Pickup</title>
    </Helmet>
    
     <div className="self-padding">
            <h2 className="text-2xl font-semibold">Manage Pickup</h2>
            <PickupManagement/>
    
          </div>
    
    </>
  )
}

export default PickUp