import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

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

        {/* PROFIL */}

        <div
          className="profile"
          onClick={() => navigate("/profile")}
        >

          <div className="avatar">

            {data.firstname?.charAt(0)}
            {data.lastname?.charAt(0)}

          </div>

        </div>

        {/* ICONES */}

        <div className="header-icons">

          <Bell
            size={22}
            onClick={() => navigate("/notifications")}
            style={{cursor:"pointer"}}
          />

          <HelpCircle
            size={22}
            onClick={() => navigate("/help")}
            style={{cursor:"pointer"}}
          />

        </div>

      </div>

      {/* TOP TABS */}

      <div className="top-tabs">

        <button
          className={activeTab === "comptes" ? "tab active" : "tab"}
          onClick={()=>{
            setActiveTab("comptes");
            navigate("/accounts");
          }}
        >
          <Landmark size={18}/> Comptes
        </button>

        <button
          className={activeTab === "cartes" ? "tab active" : "tab"}
          onClick={()=>{
            setActiveTab("cartes");
            navigate("/cards");
          }}
        >
          <CreditCard size={18}/> Cartes
        </button>

        <button
          className={activeTab === "financement" ? "tab active" : "tab"}
          onClick={()=>{
            setActiveTab("financement");
            navigate("/financing");
          }}
        >
          <Wallet size={18}/> Financement
        </button>

      </div>

      {/* CARTE COMPTE */}

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

      {/* ACTIONS */}

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

      {/* MOUVEMENTS */}

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

          <div className="amount negative">
            -26,69 €
          </div>

        </div>

      </div>

      {/* NAVIGATION BAS */}

      <div className="bottom-nav">

        <div
          className="nav-item active"
          onClick={()=>navigate("/dashboard")}
        >
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

        <div
          className="nav-item"
          onClick={()=>navigate("/help")}
        >
          <Headphones size={24}/>
          <span>Aide</span>
        </div>

      </div>

    </div>
  );
}