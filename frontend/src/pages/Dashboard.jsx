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
  const [activeTab, setActiveTab] = useState("accounts");

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

      {/* HEADER FIXE */}

      <div className="header">

        <div className="profile">
          <div className="avatar">
            {data.firstname?.charAt(0)}
            {data.lastname?.charAt(0)}
          </div>
        </div>

        <div className="header-icons">
          <Bell size={22}/>
          <HelpCircle size={22}/>
        </div>

      </div>

      {/* TABS FIXES */}

      <div className="tabs">

        <button
          className={activeTab === "accounts" ? "tab active" : "tab"}
          onClick={() => setActiveTab("accounts")}
        >
          <Landmark size={18}/> Comptes
        </button>

        <button
          className={activeTab === "cards" ? "tab active" : "tab"}
          onClick={() => setActiveTab("cards")}
        >
          <CreditCard size={18}/> Cartes
        </button>

        <button
          className={activeTab === "financing" ? "tab active" : "tab"}
          onClick={() => setActiveTab("financing")}
        >
          <Wallet size={18}/> Financement
        </button>

      </div>

      {/* CONTENU SCROLL */}

      <div className="content">

        {activeTab === "accounts" && (
          <>
            <div className="account-card">

              <div className="account-header">
                Compte principal
              </div>

              <div className="balance">
                {data.balance} €
              </div>

              <div className="balance-date">
                Solde disponible
              </div>

              <div className="owner">
                {data.firstname} {data.lastname}
              </div>

              <div className="iban">
                {data.iban}
              </div>

            </div>

            <div className="quick-actions">

              <div className="action">
                <Send size={26}/>
                <p>Virement</p>
              </div>

              <div className="action">
                <Smartphone size={26}/>
                <p>Recharge</p>
              </div>

              <div className="action">
                <Receipt size={26}/>
                <p>Facture</p>
              </div>

            </div>

            <div className="transactions">

              <h3>DERNIÈRES OPÉRATIONS</h3>

              <div className="transaction">
                <div>
                  <span className="date">02</span>
                  <span className="month">mar</span>
                </div>

                <div className="desc">
                  Frais bancaires
                </div>

                <div className="amount">
                  -26,69 €
                </div>
              </div>

            </div>
          </>
        )}

        {activeTab === "cards" && (
          <div className="account-card">
            <h3>Mes cartes</h3>
            <p>Aucune carte active</p>
          </div>
        )}

        {activeTab === "financing" && (
          <div className="account-card">
            <h3>Financement</h3>
            <p>Aucun financement disponible</p>
          </div>
        )}

      </div>

      {/* BOTTOM NAV FIXE */}

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