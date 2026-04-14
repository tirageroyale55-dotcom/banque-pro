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
  const [scrollOffset, setScrollOffset] = useState(-60);
  const [opacity, setOpacity] = useState(0);

  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          .catch(err => console.error("Erreur transactions", err));
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card").then(setCard).catch(() => console.log("Erreur carte"));
    }
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // BalanceBar (Logique Mobile uniquement)
  useEffect(() => {
    if (!data || activeTab !== "accounts" || isDesktop) return;
    const handleScroll = () => {
      const bar = document.querySelector('.balance-bar');
      const accountCard = document.querySelector('.account-card');
      if (!bar || !accountCard) return;
      const cardRect = accountCard.getBoundingClientRect();
      if (cardRect.top < 135) bar.classList.add('show');
      else bar.classList.remove('show');
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [activeTab, data, isDesktop]);

  if (!data) return null;

  // --- RENDU DESKTOP (LOGO GAUCHE | PROFIL DROITE) ---
  if (isDesktop) {
    return (
      <div className="bank-app desktop-layout">
        {/* BARRE LATERALE (SIDEBAR) */}
        <aside className="desktop-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className="nav-item" onClick={() => setActiveTab('accounts')}>Comptes</div>
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>Cartes</div>
            <div className="nav-item">Payer</div>
            <div className="nav-item">Produits</div>
            <div className="nav-item">Lifestyle</div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Aide</div>
          </nav>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="desktop-main">
          {/* HEADER : ICI LE PROFIL EST POUSSÉ À DROITE COMME SUR TON DESSIN */}
          <header className="desktop-header-top">
            <div className="user-profile-top">
              <span className="welcome-name">Bienvenue, {data.firstName} {data.lastName}</span>
              <div className="header-icons">
                <div className="icon-circle">🔔</div>
                <div className="profile-avatar" onClick={() => setActiveTab('profile')}>
                   {data.firstName.charAt(0)}{data.lastName.charAt(0)}
                </div>
              </div>
            </div>
          </header>
          
          <div className="desktop-scroll-area">
            {activeTab === "accounts" && (
                <div className="dashboard-view">
                    <Accounts data={data} />
                </div>
            )}
            
            {activeTab === "profile" && <Profile data={data} />}
            
            {activeTab === "cards" && (
              <div className="cards-section">
                <h3 className="cards-title">Mes cartes</h3>
                <div className="cards-slider">
                  {card && <div className="cards-slide"><BankCard card={card}/></div>}
                  <div className="cards-slide card-request" onClick={() => navigate("/request-card")}>
                    <div className="card-request-inner">
                      <div className="card-plus">+</div>
                      <p>Demander une carte</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // --- RENDU MOBILE (NON TOUCHÉ) ---
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
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}