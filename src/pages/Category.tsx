import  Helmet from "react-helmet"
import CategoryMangment from "../components/category/CategoryManagment"


const Category = () => {
  return (
    <>
    <Helmet>
      <title>Ganapati Rudrakshaam Admin | Category</title>
    </Helmet>
    
     <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Category</h2>
          <CategoryMangment/>

      </div>
    </>
  )
}

export default Category