import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import { Bell, Headphones } from "lucide-react";

import Accounts from "./Accounts";
import "../styles/dashboard.css";

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");

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

  // MENU ITEMS
  const menuItems = [
    { key: "accounts", label: "Accueil" },
    { key: "payer", label: "Payer" },
    { key: "produits", label: "Produits" },
    { key: "lifestyle", label: "Lifestyle" },
    { key: "cards", label: "Cartes" },
    { key: "financing", label: "Financements" },
  ];

  return (
    <div className="bank-app-desktop">

      {/* MENU GAUCHE */}
      <aside className="sidebar">
        <div className="profile">
          <div className="avatar">{data.user?.initials || "U"}</div>
          <span className="username">{data.user?.name || "Utilisateur"}</span>
        </div>
        <nav className="menu">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`menu-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className="main-content">
        {/* HEADER */}
        <header className="desktop-header">
          <div className="header-left">
            <h2>{menuItems.find(i => i.key === activeTab)?.label}</h2>
          </div>
          <div className="header-right">
            <button className="icon-btn"><Bell size={24} /></button>
            <button className="icon-btn"><Headphones size={24} /></button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="content-wrapper">
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

          {/* Autres onglets */}
          {["payer","produits","lifestyle"].includes(activeTab) && (
            <div className="content">
              <div className="account-card">
                <h3>{menuItems.find(i => i.key === activeTab)?.label}</h3>
                <p>Contenu en développement</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}