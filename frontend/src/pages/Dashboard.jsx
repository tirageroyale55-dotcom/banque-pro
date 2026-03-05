import { useState, useEffect } from "react";
import { api } from "../services/api";
import {
  Bell,
  HelpCircle,
  Landmark,
  CreditCard,
  Wallet,
  Send,
  Smartphone,
  Receipt,
  Home,
  ArrowRightLeft,
  Grid,
  Gem,
  Headphones
} from "lucide-react";

import "./dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("comptes");

  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        window.location = "/login";
      });
  }, []);

  if (!data) return null;

  return (
    <div className="bank-app">

      {/* HEADER */}
      <div className="header">

        <div className="profile">
          <div className="avatar">GD</div>
        </div>

        <div className="header-icons">
          <Bell size={22}/>
          <HelpCircle size={22}/>
        </div>

      </div>

      {/* TOP TABS */}

      <div className="top-tabs">

        <button
          className={activeTab === "comptes" ? "tab active" : "tab"}
          onClick={() => setActiveTab("comptes")}
        >
          <Landmark size={18}/> Comptes
        </button>

        <button
          className={activeTab === "cartes" ? "tab active" : "tab"}
          onClick={() => setActiveTab("cartes")}
        >
          <CreditCard size={18}/> Cartes
        </button>

        <button
          className={activeTab === "financement" ? "tab active" : "tab"}
          onClick={() => setActiveTab("financement")}
        >
          <Wallet size={18}/> Financement
        </button>

      </div>

      {/* COMPTE */}

      <div className="account-card">

        <div className="account-header">
          <span>Compte 3735584</span>
        </div>

        <div className="balance">
          {data.balance} €
        </div>

        <div className="balance-date">
          Solde disponible
        </div>

        <div className="owner">
          {data.name}
        </div>

        <div className="iban">
          {data.iban}
        </div>

      </div>

      {/* ACTIONS RAPIDES */}

      <div className="quick-actions">

        <div className="action">
          <Send size={26}/>
          <p>Virement</p>
        </div>

        <div className="action">
          <Smartphone size={26}/>
          <p>Recharge mobile</p>
        </div>

        <div className="action">
          <Receipt size={26}/>
          <p>Paiement facture</p>
        </div>

      </div>


      {/* DERNIERS MOUVEMENTS */}

      <div className="transactions">

        <h3>DERNIÈRES OPÉRATIONS</h3>

        <div className="transaction">

          <div>
            <span className="date">02</span>
            <span className="month">mar</span>
          </div>

          <div className="desc">
            Frais bancaires autorisés
          </div>

          <div className="amount negative">
            -26,69 €
          </div>

        </div>

      </div>


      {/* BOTTOM NAV */}

      <div className="bottom-nav">

        <div className="nav-item active">
          <Home size={24}/>
          <span>Accueil</span>
        </div>

        <div className="nav-item">
          <ArrowRightLeft size={24}/>
          <span>Payer</span>
        </div>

        <div className="nav-item">
          <Grid size={24}/>
          <span>Produits</span>
        </div>

        <div className="nav-item">
          <Gem size={24}/>
          <span>Lifestyle</span>
        </div>

        <div className="nav-item">
          <Headphones size={24}/>
          <span>Aide</span>
        </div>

      </div>

    </div>
  );
}