import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [card, setCard] = useState(null);
  
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // --- LOGIQUE MOBILE (Scroll BalanceBar) ---
  useEffect(() => {
    if (!data || activeTab !== "accounts" || isDesktop) return;

    const handleScroll = () => {
      const bar = document.querySelector('.balance-bar');
      const accountCard = document.querySelector('.account-card');
      if (!bar || !accountCard) return;

      const cardRect = accountCard.getBoundingClientRect();
      if (cardRect.top < 135) {
        bar.classList.add('show');
      } else {
        bar.classList.remove('show');
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [activeTab, data, isDesktop]);

  // --- RESPONSIVE CHECK ---
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- API CALLS ---
  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transactions")
          .then((transactionsData) => {
            setData(prev => ({ ...prev, transactions: transactionsData.transactions || transactionsData }));
          })
          .catch(err => console.error("Historique indisponible", err));
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
    window.scrollTo(0, 0);
  }, [activeTab]);

  if (!data) return null;

  return (
    <div className={`bank-app-container ${isDesktop ? "desktop-mode" : "mobile-mode"}`}>
      
      {/* NAVIGATION LATERALE (DESKTOP UNIQUEMENT) - Selon ton dessin */}
      {isDesktop && (
        <aside className="desktop-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-nav">
            <button className={activeTab === 'accounts' ? 'active' : ''} onClick={() => setActiveTab('accounts')}>Accueil</button>
            <button className={activeTab === 'cards' ? 'active' : ''} onClick={() => setActiveTab('cards')}>Cartes</button>
            <button onClick={() => navigate('/pay')}>Payer</button>
            <button onClick={() => navigate('/products')}>Produits</button>
            <button onClick={() => navigate('/lifestyle')}>Lifestyle</button>
            <button onClick={() => navigate('/help')}>Aide</button>
          </nav>
        </aside>
      )}

      <main className="main-content">
        {/* Header (Nom + Notifications + Profil) */}
        <Header data={data} />

        {/* Tabs (uniquement mobile car desktop utilise la sidebar) */}
        {!isDesktop && <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />}

        {/* BalanceBar (Logique Mobile uniquement) */}
        {!isDesktop && <BalanceBar balance={data.balance} />}

        <div className="page-body" ref={contentRef}>
          {activeTab === "accounts" && <Accounts data={data} isDesktop={isDesktop} />}
          
          {activeTab === "cards" && (
            <div className="cards-section">
              <h3 className="section-title">Mes cartes bancaires</h3>
              <div className="cards-grid">
                {card && <BankCard card={card} />}
                <div className="card-request-btn" onClick={() => navigate("/request-card")}>
                  <span>+</span>
                  <p>Demander une nouvelle carte</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation Basse (Mobile uniquement) */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}