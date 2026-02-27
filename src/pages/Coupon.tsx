import Helmet from "react-helmet"
import CouponManagment from "../components/cupon/CouponManagment"

const Coupon = () => {
  return (
    <>
    <Helmet>
      <title>Ganapati Rudrakshaam Admin | Coupon</title>
    </Helmet>
    
     <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Coupon</h2>
       <CouponManagment/>

      </div>
    </>
  )
}

export default Coupon