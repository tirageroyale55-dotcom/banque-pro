import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import ClientLayout from "./layouts/ClientLayout";

/* PUBLIC PAGES */

import Home from "./pages/Home";
import ApplyIntro from "./pages/ApplyIntro";
import Apply from "./pages/Apply";
import Pending from "./pages/Pending";
import Activate from "./pages/Activate";
import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

import ForgotId from "./pages/forgotId";
import ForgotPin from "./pages/forgotPin";
import ResetPassword from "./pages/ResetPassword";

/* CLIENT PAGES */

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import Accounts from "./pages/Accounts";
import Cards from "./pages/Cards";
import CardDetails from "./pages/CardDetails"; 
import CardOrderConfirmation from "./pages/CardOrderConfirmation";
import Financing from "./pages/Financing";
import Blocked from "./pages/Blocked";

import Payer from "./pages/Payer"; 
import VirementForm from "./pages/VirementForm";
import VirementInternational from "./pages/VirementInternational";
import Produits from "./pages/Produits";
import Lifestyle from "./pages/Lifestyle";
import Aide from "./pages/Aide";
/* ADMIN PAGES */

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminReset from "./pages/admin/AdminReset";
import AdminClient from "./pages/admin/AdminClient";
import AdminPrets from "./pages/admin/AdminPrets";

function SecuritySessionGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Liste des pages publiques
    const publicRoutes = [
      "/", "/apply-intro", "/apply", "/apply/form", 
      "/pending", "/activation", "/login", "/welcome", 
      "/blocked", "/forgot-id", "/forgot-pin", "/reset-password"
    ];

    // 2. Si l'utilisateur est sur une page publique (comme login), on prépare le témoin
    if (publicRoutes.includes(location.pathname)) {
      // On marque qu'on vient d'une page publique (donc pas de F5 suspect)
      sessionStorage.setItem("was_on_public_route", "true");
      return; 
    }

    // 3. S'il arrive sur une page PRIVÉE :
    // On vérifie si le témoin existe. Si le témoin n'existe PAS, c'est que la page a été actualisée de force !
    const wasOnPublic = sessionStorage.getItem("was_on_public_route");

    if (!wasOnPublic) {
      // C'est une actualisation (F5 ou retour arrière mobile) -> Sécurité maximale
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
      
      navigate("/login", { replace: true });
    } else {
      // C'est une navigation normale après connexion ! On consomme le témoin pour la prochaine fois
      // Si l'utilisateur fait F5 maintenant, le témoin n'existera plus et il sera déconnecté.
      sessionStorage.removeItem("was_on_public_route");
    }

  }, [location.pathname]); // S'active intelligemment à chaque changement de page

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
     <SecuritySessionGuard />
      <Routes>

        {/* PUBLIC ROUTES */}

        <Route path="/" element={<Home />} />
        <Route path="/apply-intro" element={<ApplyIntro />} />
        <Route path="/apply" element={<ApplyIntro />} />
        <Route path="/apply/form" element={<Apply />} />
        <Route path="/pending" element={<Pending />} />
        <Route path="/activation" element={<Activate />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />


<Route path="/blocked" element={<Blocked />} />
        <Route path="/forgot-id" element={<ForgotId />} />
        <Route path="/forgot-pin" element={<ForgotPin />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ADMIN ROUTES */}

        <Route
          path="/admin/reset"
          element={
            <AdminRoute>
              <AdminReset />
            </AdminRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/loans"
          element={
            <AdminRoute>
              <AdminPrets />
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

        <Route
          path="/admin/client/:id"
          element={
            <AdminRoute>
              <AdminClient />
            </AdminRoute>
          }
        />

        {/* CLIENT SECURE AREA */}

        <Route
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payer" element={<Payer />} />
          <Route path="/payer/virement" element={<VirementForm />} />
          <Route path="/payer/virement-international" element={<VirementInternational />} />
          <Route path="/virement-international" element={<VirementInternational />} />
          <Route path="/produits" element={<Produits />} />
          <Route path="/lifestyle" element={<Lifestyle />} />
          <Route path="/aide" element={<Aide />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/card-details" element={<CardDetails />} />
          <Route path="/order-confirmation" element={<CardOrderConfirmation />} />
          <Route path="/financing" element={<Financing />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}