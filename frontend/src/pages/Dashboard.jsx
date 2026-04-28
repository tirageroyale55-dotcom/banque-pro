import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowRightLeft, 
  Package, 
  LifeBuoy, 
  LogOut,
  Bell,
  UserCircle
} from "lucide-react";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);
  const navigate = useNavigate();

  // --- LOGIQUE COMMUNE ---
  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transactions")
          .then((transactionsData) => {
            setData(prev => ({
              ...prev,
              transactions: transactionsData.transactions || transactionsData
            }));
          })
          .catch(err => console.error("Erreur historique :", err));
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });

    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card").then(setCard).catch(() => console.log("Erreur carte"));
    }
    window.scrollTo(0, 0);
  }, [activeTab]);

  // --- LOGIQUE MOBILE (Scroll BalanceBar) ---
  useEffect(() => {
    if (isDesktop || !data || activeTab !== "accounts") return;
    const handleScroll = () => {
      const bar = document.querySelector('.balance-bar');
      const accountCard = document.querySelector('.account-card');
      if (!bar || !accountCard) return;
      if (accountCard.getBoundingClientRect().top < 135) bar.classList.add('show');
      else bar.classList.remove('show');
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [activeTab, data, isDesktop]);

  if (!data) return null;

  // --- RENDU DES ONGLETS (Contenu Central) ---
  const renderContent = () => {
    switch (activeTab) {
      case "accounts": return <Accounts data={data} />;
      case "cards": return (
        <div className="cards-section">
          <h3 className="section-title">Mes cartes bancaires</h3>
          <div className="cards-grid">
            {card && <BankCard card={card} />}
            <div className="card-request-btn" onClick={() => navigate("/request-card")}>
              <span>+ Demander une nouvelle carte</span>
            </div>
          </div>
        </div>
      );
      case "financing": return (
        <div className="empty-state">
          <h3>Financements</h3>
          <p>Aucun dossier de financement en cours.</p>
        </div>
      );
      default: return <Accounts data={data} />;
    }
  };

  return (
    <div className={`bank-app ${isDesktop ? "desktop-mode" : "mobile-mode"}`}>
      
      {/* VERSION DESKTOP : SIDEBAR GAUCHE (Comme ton dessin) */}
      {isDesktop && (
        <aside className="main-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-nav">
            <button className={activeTab === "accounts" ? "active" : ""} onClick={() => setActiveTab("accounts")}>
              <LayoutDashboard size={20} /> Accueil
            </button>
            <button className={activeTab === "cards" ? "active" : ""} onClick={() => setActiveTab("cards")}>
              <CreditCard size={20} /> Cartes
            </button>
            <button onClick={() => setActiveTab("financing")}>
              <ArrowRightLeft size={20} /> Payer
            </button>
            <button>
              <Package size={20} /> Produits
            </button>
            <button>
              <LifeBuoy size={20} /> Lifestyle
            </button>
            <button>
              <LifeBuoy size={20} /> Aide
            </button>
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>
              <LogOut size={18} /> Déconnexion
            </button>
          </div>
        </aside>
      )}

      {/* ZONE DE CONTENU PRINCIPALE */}
      <main className="main-viewport">
        
        {/* Header (Profil/Notif en Desktop haut droite) */}
        <header className="content-header">
           {!isDesktop && <Header data={data} />} {/* Mobile Header */}
           {isDesktop && (
             <div className="desktop-top-bar">
                <div className="welcome-msg">
                  Bienvenue, <strong>{data.firstName} {data.lastName}</strong>
                </div>
                <div className="top-actions">
                  <Bell size={22} className="icon-btn" />
                  <UserCircle size={22} className="icon-btn" />
                </div>
             </div>
           )}
        </header>

        {!isDesktop && (
          <>
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <BalanceBar balance={data.balance} />
          </>
        )}

        <div className="scrollable-content">
          {renderContent()}
        </div>

      </main>

      {!isDesktop && <BottomNav />}
    </div>
  );
}