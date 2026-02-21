import Helmet from "react-helmet";
import VariableManagement from "../components/Variables/VariableManagement";

const Variables = () => {
  return (
    <>
    <Helmet>
      <title>Pri Priya Nursury Admin | Varibles</title>
    </Helmet>
      <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Variables</h2>
        <VariableManagement />
        
      </div>
    </>
  );
};

export default Variables;
