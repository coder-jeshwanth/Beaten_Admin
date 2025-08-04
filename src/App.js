import React, { useState, useMemo, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context
import { AuthProvider } from "./context/AuthContext";

// Route Protection Components
import ProtectedRoute from "./components/common/ProtectedRoute";
import PublicRoute from "./components/common/PublicRoute";

// Layout Components
import Layout from "./components/layout/Layout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Promotions from "./pages/Promotions";
import Returns from "./pages/Returns";
import DataEntry from "./pages/DataEntry";
import FooterInfo from "./pages/FooterInfo";
import Marketing from "./pages/Marketing";
import Analytics from "./pages/Analytics";

// Create theme
const getInitialMode = () => {
  const savedMode = localStorage.getItem("admin_theme_mode");
  return savedMode === "dark" ? "dark" : "light";
};

function App() {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    localStorage.setItem("admin_theme_mode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#000000" },
          secondary: { main: "#666666" },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Redirect /admin to / */}
          <Route path="/admin" element={<Navigate to="/" replace />} />
          {/* Public Routes - Login and Register Pages */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Protected Routes - Admin Dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout toggleTheme={toggleTheme} mode={mode} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="returns" element={<Returns />} />
            <Route path="data-entry" element={<DataEntry />} />
            <Route path="footer-info" element={<FooterInfo />} />
            <Route path="marketing" element={<Marketing />} />
          </Route>
        </Routes>

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
