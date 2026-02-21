import Helmet from "react-helmet";
import CustomerManagment from "../components/customer/CustomerManagment";

const Customer = () => {
  return (
    <>
      <Helmet>
        <title>Pri Priya Nursury Admin | Customer</title>
      </Helmet>
      <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Customer</h2>
        <CustomerManagment />
      </div>
    </>
  );
};

export default Customer;
