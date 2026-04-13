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
  const contentRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/client/dashboard").then(setData).catch(() => navigate("/login"));
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card").then(setCard).catch(() => console.log("Erreur carte"));
    }
  }, [activeTab]);

  if (!data) return null;

  // --- RENDU DESKTOP ---
  if (isDesktop) {
    return (
      <div className="bank-app desktop-layout">
        <aside className="desktop-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-nav">
            {/* Tous les boutons sont maintenant gérés ici pour le Desktop */}
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <span className="nav-icon">🏠</span> Accueil
            </div>
            <div className="nav-item"><span className="nav-icon">📑</span> Comptes</div>
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <span className="nav-icon">💳</span> Cartes
            </div>
            <div className="nav-item"><span className="nav-icon">⇄</span> Payer</div>
            <div className="nav-item"><span className="nav-icon">🏢</span> Produits</div>
            <div className="nav-item"><span className="nav-icon">💎</span> Lifestyle</div>
            {/* L'aide est remplacée par le Profil ici comme demandé */}
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <span className="nav-icon">👤</span> Mon Profil
            </div>
          </nav>
        </aside>

        <main className="desktop-main">
          {/* Le Header Desktop ne contient plus que les infos essentielles (Notifs/Profil) */}
          <header className="desktop-header-minimal">
             <div className="header-actions">
                <span className="icon-btn">🔔</span>
                <div className="user-profile-circle" onClick={() => setActiveTab('profile')}>
                   {data.firstname?.charAt(0)}{data.lastname?.charAt(0)}
                </div>
             </div>
          </header>

          <div className="desktop-scroll-area">
            {/* On affiche directement le contenu selon l'onglet actif sans le composant <Tabs /> */}
            {activeTab === "accounts" && (
               <div className="welcome-section">
                  <h1 className="welcome-text">Bienvenue, {data.firstname} {data.lastname}</h1>
                  <Accounts data={data} />
               </div>
            )}
            
            {activeTab === "profile" && <Profile data={data} />}

            {activeTab === "cards" && (
              <div className="cards-section">
                <h3 className="cards-title">Mes cartes</h3>
                <div className="cards-grid">
                  {card && <BankCard card={card}/>}
                  <div className="card-request-box" onClick={() => navigate("/request-card")}>
                    <span>+</span>
                    <p>Demander une carte</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // --- RENDU MOBILE (STRICTEMENT INTACT) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} />
      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "profile" && <Profile data={data} />}
        {activeTab === "cards" && (
          <div className="cards-section">
            <h3 className="cards-title">Mes cartes</h3>
            <div className="cards-slider">
              {card && <div className="cards-slide"><BankCard card={card}/></div>}
              <div className="cards-slide card-request" onClick={() => navigate("/request-card")}>
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