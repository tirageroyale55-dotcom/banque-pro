import { useState, useEffect } from "react"; 
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";

import Accounts from "./Accounts";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [showBalanceBar, setShowBalanceBar] = useState(false);

  const navigate = useNavigate();

  // Récupération données utilisateur
  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, []);

  // Reset scroll et balance bar à chaque tab
  useEffect(() => {
    setShowBalanceBar(false);
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Affichage balance bar au scroll
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab !== "accounts") {
        setShowBalanceBar(false);
        return;
      }
      const scroll = window.scrollY;
      setShowBalanceBar(scroll > 160);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  if (!data) return null;

  return (
    <div className="bank-app">

      {/* Header fixe */}
      <Header data={data} />

      {/* Tabs fixes sous header */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Balance bar */}
      <BalanceBar balance={data.balance} visible={showBalanceBar} />

      {/* Contenu principal */}
      <div className="page-content">

        {activeTab === "accounts" && <Accounts data={data} />}

        {activeTab === "cards" && (
          <div className="content">
            <div className="account-card">
              <h3>Mes cartes</h3>
              <p>Aucune carte active</p>
            </div>
          </div>
        )}

        {activeTab === "financing" && (
          <div className="content">
            <div className="account-card">
              <h3>Financements</h3>
              <p>Aucun financement disponible</p>
            </div>
          </div>
        )}

      </div>

      {/* Navigation bottom */}
      <BottomNav />

    </div>
  );
}