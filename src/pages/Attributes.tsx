import Helmet  from "react-helmet";
import AttributeManagement from "../components/Attributes/AttributeManagement";


const Attributes = () => {
  return (
    <>
    <Helmet>
      Pri Priya Nursury Admin | Attribute
    </Helmet>
      <div className="self-padding">
        <h2 className="text-2xl font-semibold">Manage Attributes</h2>
        <AttributeManagement />
      </div>
    </>
  );
};

export default Attributes;
