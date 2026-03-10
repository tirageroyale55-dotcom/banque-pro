import { useState, useEffect } from "react"; 
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";

import Accounts from "./Accounts";

import "../styles/dashboard.css";

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [showBalanceBar, setShowBalanceBar] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, []);

  if (!data) return null;

  const tabs = [
    { key: "accounts", label: "Comptes" },
    { key: "cards", label: "Cartes" },
    { key: "financing", label: "Financements" },
  ];

  return (
    <div className="bank-app-desktop">

      {/* HEADER LARGE */}
      <header className="header-desktop">
        <div className="header-left">
          <h2 className="bank-logo">MobilBox Vida</h2>
        </div>
        <div className="header-right">
          <span className="user-name">{data.userName}</span>
          <div className="avatar">{data.userInitials}</div>
        </div>
      </header>

      {/* MENU DESKTOP */}
      <nav className="desktop-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-desktop ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* BALANCE BAR */}
      <BalanceBar balance={data.balance} visible={showBalanceBar} />

      {/* CONTENU CENTRAL */}
      <main className="content-desktop">
        {activeTab === "accounts" && <Accounts data={data}/>}

        {activeTab === "cards" && (
          <div className="account-card">
            <h3>Mes cartes</h3>
            <p>Aucune carte active</p>
          </div>
        )}

        {activeTab === "financing" && (
          <div className="account-card">
            <h3>Financements</h3>
            <p>Aucun financement disponible</p>
          </div>
        )}
      </main>

      {/* Bottom nav pour mobile */}
      <BottomNav />
    </div>
  );
}