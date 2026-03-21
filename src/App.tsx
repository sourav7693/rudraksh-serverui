import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./layout";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    
    if (window.location.pathname === "/admin-login") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/user/me`,
          {
            credentials: "include",
          },
        );

        if (!res.ok) {
          window.location.href = "/admin-login";
          return;
        }

        const data = await res.json();

        if (!data || data.status === false) {
          window.location.href = "/admin-login";
        }
      } catch {
        window.location.href = "/admin-login";
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
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
