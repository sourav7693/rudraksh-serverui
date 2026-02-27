import  Helmet  from "react-helmet";
import SliderManagement from "../components/Slider/SliderManagement";


const Slider = () => {
  return (
    <div className="self-padding">
      <Helmet>
        <title>Ganapati Rudrakshaam Admin | Slider</title>
      </Helmet>
      <h2 className="text-2xl font-semibold">Manage Sliders</h2>
      <SliderManagement />
    </div>
  );
}

export default Slider