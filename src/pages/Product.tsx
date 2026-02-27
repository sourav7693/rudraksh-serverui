import  Helmet from "react-helmet"
import ProductManagement from "../components/Products/ProductManagement"



const Product = () => {
  return (
    <>
    <Helmet>
      <title>Ganapati Rudrakshaam Admin | Products</title>
    </Helmet>
    
    
        <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Product</h2>          
           <ProductManagement/>

      </div>
    
    
    </>
  )
}

export default Product