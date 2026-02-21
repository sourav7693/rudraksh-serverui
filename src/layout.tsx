import { Navigate, useLocation, Routes, Route } from "react-router-dom";
import Header from "./global/Header";

import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminAuth";
import ProtectedRoute from "./routes/ProtectedRoute";
import Product from "./pages/Product";
import Category from "./pages/Category";
import Order from "./pages/Order";
import Customer from "./pages/Customer";
import PickUp from "./pages/PickUp";
import Brand from "./pages/Brand";
import Attributes from "./pages/Attributes";
import Variables from "./pages/Variables";
import Coupon from "./pages/Coupon";
import Slider from "./pages/Slider";
import BulkMarketing from "./pages/BulkMarketing";
import Users from "./pages/Users";
import CommuicationProvider from "./pages/CommuicationProvider";
import Reviews from "./pages/Reviews";
// import other pages…

const Layout = () => {
  const location = useLocation();
  const hideHeader = location.pathname === "/admin-login";

  return (
    <>
      {!hideHeader && <Header />}

      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-products"
          element={
            <ProtectedRoute permission="products">
              <Product />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-category"
          element={
            <ProtectedRoute permission="category">
              <Category />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-order"
          element={
            <ProtectedRoute permission="orders">
              <Order />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-customers"
          element={
            <ProtectedRoute permission="customers">
              <Customer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-pickup"
          element={
            <ProtectedRoute permission="pickup">
              <PickUp />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-brand"
          element={
            <ProtectedRoute permission="brand">
              <Brand />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-attributes"
          element={
            <ProtectedRoute permission="attributes">
              <Attributes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-variables"
          element={
            <ProtectedRoute permission="variables">
              <Variables />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-coupon"
          element={
            <ProtectedRoute permission="coupon">
              <Coupon />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-slider"
          element={
            <ProtectedRoute permission="slider">
              <Slider />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-bulk-marketing"
          element={
            <ProtectedRoute permission="bulk_marketing">
              <BulkMarketing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-users"
          element={
            <ProtectedRoute permission="users">
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/communication-provider"
          element={
            <ProtectedRoute permission="communication_provider">
              <CommuicationProvider />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-reviews"
          element={
            <ProtectedRoute permission="communication_provider">
              <Reviews />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/admin-login" replace />} />
      </Routes>
    </>
  );
};

export default Layout;
