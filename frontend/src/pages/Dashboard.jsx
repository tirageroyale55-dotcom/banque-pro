import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
import Profile from "./Profile"; 

import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/client/dashboard").then(setData).catch(() => navigate("/login"));
  }, [navigate]);

  if (!data) return null;

  // ==========================================
  // 1. RENDU DESKTOP (SÉPARÉ ET PERSONNALISÉ)
  // ==========================================
  if (isDesktop) {
    return (
      <div className="bank-app desktop-layout">
        {/* SIDEBAR BPER PRO */}
        <aside className="desktop-sidebar">
          <div className="sidebar-logo">BPER</div>
          
          <nav className="sidebar-nav">
            <div 
              className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} 
              onClick={() => setActiveTab('accounts')}
            >
              <span className="icon">🏠</span> Accueil
            </div>
            <div className="nav-item"><span className="icon">📂</span> Comptes</div>
            <div 
              className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} 
              onClick={() => setActiveTab('cards')}
            >
              <span className="icon">💳</span> Mes Cartes
            </div>
            <div className="nav-item"><span className="icon">💸</span> Payer</div>
            <div className="nav-item"><span className="icon">📈</span> Produits</div>
            <div className="nav-item"><span className="icon">💎</span> Lifestyle</div>
            
            {/* REMPLACEMENT DE 'HELP' PAR 'PROFILE' */}
            <div 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
              onClick={() => setActiveTab('profile')}
            >
              <span className="icon">👤</span> Mon Profil
            </div>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* CONTENU PRINCIPAL (SANS TABS) */}
        <main className="desktop-main">
          <Header data={data} />
          
          <div className="desktop-scroll-area">
            {activeTab === "accounts" && (
              <div className="desktop-view-container">
                <h2 className="welcome-text">Bienvenue, {data.firstName} {data.lastName}</h2>
                <Accounts data={data} />
              </div>
            )}
            
            {activeTab === "profile" && <Profile data={data} />}

            {activeTab === "cards" && (
              <div className="cards-section">
                <h3 className="cards-title">Gestion de vos cartes</h3>
                <div className="cards-grid">
                  {card && <BankCard card={card}/>}
                  <div className="add-card-box" onClick={() => navigate("/request-card")}>
                    <span>+</span>
                    <p>Demander une nouvelle carte</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // 2. RENDU MOBILE (TON CODE D'ORIGINE INTACT)
  // ==========================================
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "profile" && <Profile data={data} />}
        {activeTab === "cards" && (
          <div className="cards-section">
            <h3 className="cards-title">Mes cartes</h3>
            <div className="cards-slider">
              {card && <div className="cards-slide"><BankCard card={card}/></div>}
              <div className="cards-slide card-request" onClick={()=>navigate("/request-card")}>
                <div className="card-request-inner"><div className="card-plus">+</div><p>Demander une carte</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}