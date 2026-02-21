import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./layout";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
