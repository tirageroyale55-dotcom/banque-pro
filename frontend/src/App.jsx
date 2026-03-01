import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import ApplyIntro from "./pages/ApplyIntro";
import Apply from "./pages/Apply";
import Pending from "./pages/Pending";
import Activate from "./pages/Activate";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserDetails from "./pages/admin/AdminUserDetails";

import ForgotId from "./pages/ForgotId";
import ForgotPin from "./pages/ForgotPin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/apply-intro" element={<ApplyIntro />} />
        <Route path="/apply" element={<ApplyIntro />} />
        <Route path="/apply/form" element={<Apply />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/activation" element={<Activate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/forgot-id" element={<ForgotId />} />
        <Route path="/forgot-pin" element={<ForgotPin />} />
        {/* CLIENT */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/user/:id"
          element={
            <AdminRoute>
              <AdminUserDetails />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
