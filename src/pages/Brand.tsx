import Helmet from "react-helmet";
import BrandManagment from "../components/Brand/BrandManagment";


const Brand = () => {
  return (
    <>
    <Helmet>
      <title>Ganapati Rudrakshaam Admin | Brand</title>
    </Helmet>
      <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Brand</h2>
        <BrandManagment />
      </div>
    </>
  );
};

export default Brand;
