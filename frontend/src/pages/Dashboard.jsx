import { useState, useEffect } from "react"; 
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

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

  const menuItems = [
    { key: "accounts", label: "Comptes" },
    { key: "cards", label: "Cartes" },
    { key: "financing", label: "Financements" },
    { key: "settings", label: "Paramètres" },
    { key: "logout", label: "Déconnexion" },
  ];

  const handleMenuClick = (key) => {
    if (key === "logout") {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }
    setActiveTab(key);
  };

  return (
    <div className="bank-app-desktop">

      {/* MENU LATÉRAL GAUCHE */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>MobilBox Vida</h2>
        </div>
        <ul className="menu-list">
          {menuItems.map(item => (
            <li
              key={item.key}
              className={`menu-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => handleMenuClick(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <div className="main-content">
        
        {/* HEADER */}
        <header className="header-desktop">
          <div className="header-left">
            <h3>{activeTab === "accounts" ? "Mes Comptes" :
                 activeTab === "cards" ? "Mes Cartes" :
                 activeTab === "financing" ? "Financements" :
                 "Paramètres"}</h3>
          </div>
          <div className="header-right">
            <div className="balance-header">
              Solde: <strong>{data.balance} €</strong>
            </div>
            <div className="avatar">A</div>
          </div>
        </header>

        {/* CONTENU DES ONGLETS */}
        <div className="content-area">
          {activeTab === "accounts" && (
            <div className="account-card">
              <h3>Comptes</h3>
              <p>Solde disponible: {data.balance} €</p>
            </div>
          )}

          {activeTab === "cards" && (
            <div className="account-card">
              <h3>Cartes</h3>
              <p>Aucune carte active</p>
            </div>
          )}

          {activeTab === "financing" && (
            <div className="account-card">
              <h3>Financements</h3>
              <p>Aucun financement disponible</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="account-card">
              <h3>Paramètres</h3>
              <p>Options du compte</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}