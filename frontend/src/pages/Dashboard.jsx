import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import { Bell, HelpCircle, Landmark, CreditCard, Wallet, Send, Smartphone, Receipt } from "lucide-react";

import "./dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  if (!data) return null;

  return (
    <div className="bank-app">

      {/* HEADER */}
      <div className="header">
        <div className="profile" onClick={() => navigate("/profile")}>
          <div className="avatar">
            {data.firstname?.charAt(0)}
            {data.lastname?.charAt(0)}
          </div>
        </div>

        <div className="header-icons">
          <Bell size={22} onClick={() => navigate("/notifications")} style={{cursor:"pointer"}} />
          <HelpCircle size={22} onClick={() => navigate("/help")} style={{cursor:"pointer"}} />
        </div>
      </div>

      {/* TOP TABS */}
      <div className="top-tabs">
        <button className="tab active" onClick={() => navigate("/accounts")}>
          <Landmark size={18} /> Comptes
        </button>
        <button className="tab" onClick={() => navigate("/cards")}>
          <CreditCard size={18} /> Cartes
        </button>
        <button className="tab" onClick={() => navigate("/financing")}>
          <Wallet size={18} /> Financement
        </button>
      </div>

      {/* ACCOUNT CARD */}
      <div className="account-card">
        <div className="account-header">Compte principal</div>
        <div className="balance">{data.balance} €</div>
        <div className="balance-date">Solde disponible</div>
        <div className="owner">{data.firstname} {data.lastname}</div>
        <div className="iban">{data.iban}</div>
      </div>

      {/* ACTIONS RAPIDES */}
      <div className="quick-actions">
        <div className="action">
          <Send size={26} />
          <p>Virement</p>
        </div>
        <div className="action">
          <Smartphone size={26} />
          <p>Recharge mobile</p>
        </div>
        <div className="action">
          <Receipt size={26} />
          <p>Paiement facture</p>
        </div>
      </div>

      {/* NAVIGATION BAS */}
      <div className="bottom-nav">
        <div className="nav-item active" onClick={() => navigate("/dashboard")}>
          <Landmark size={24} />
          <span>Comptes</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/transactions")}>
          <Send size={24} />
          <span>Payer</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/cards")}>
          <CreditCard size={24} />
          <span>Cartes</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/financing")}>
          <Wallet size={24} />
          <span>Financement</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/help")}>
          <HelpCircle size={24} />
          <span>Aide</span>
        </div>
      </div>

    </div>
  );
}