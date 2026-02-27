import Helmet from "react-helmet"
import OrderManagment from "../components/order/OrderManagment"


const Order = () => {
  return (
    <>
    <Helmet>
      <title>Ganapati Rudrakshaam Admin | Order</title>
    </Helmet>
     <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Order</h2>
           <OrderManagment/>

      </div>
    
    </>
  )
}

export default Order