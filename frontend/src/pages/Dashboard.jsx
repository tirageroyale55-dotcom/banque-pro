import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
import Payer from "./Payer";
// Ajout de Profile si tu l'utilises
// import Profile from "./Profile"; 

// Icônes pour le menu Desktop Professionnel
import { LayoutDashboard, CreditCard, Send, Package, Heart, HelpCircle, Bell, User } from "lucide-react";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [showBalanceBar, setShowBalanceBar] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);

  const [scrollOffset, setScrollOffset] = useState(-60); 
  const [opacity, setOpacity] = useState(0);

  const navigate = useNavigate();
  const lastScrollRef = useRef(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card")
        .then(setCard)
        .catch(() => console.log("Erreur carte"));
    }
  }, [activeTab]);

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
          .catch(err => console.error("L'historique n'a pas pu être chargé :", err));
      })
      .catch((err) => {
        console.error("Session expirée ou erreur profil");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setShowBalanceBar(false);
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    if (!data || activeTab !== "accounts") {
      const bar = document.querySelector('.balance-bar');
      if (bar) bar.classList.remove('show');
      return;
    }

    const handleScroll = () => {
      const bar = document.querySelector('.balance-bar');
      const accountCard = document.querySelector('.account-card');
      if (!bar || !accountCard) return;

      const cardRect = accountCard.getBoundingClientRect();
      const triggerPoint = 135; 

      if (cardRect.top < triggerPoint) {
        bar.classList.add('show');
      } else {
        bar.classList.remove('show');
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeTab, data]);

  if (!data) return null;

  // --- RENDU CONDITIONNEL : DESKTOP ---
  if (isDesktop) {
    return (
      <div className="bper-desktop-layout">
        {/* Barre latérale (Sidebar) - Inspirée de WhatsApp Image 2026-04-12 at 19.24.15.jpeg */}
        <aside className="bper-sidebar-left">
          <div className="bper-brand">BPER</div>
          <nav className="bper-side-nav">
            <div className={`nav-link ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <LayoutDashboard size={20} /> <span>Accueil</span>
            </div>
            <div className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={20} /> <span>Cartes</span>
            </div>
            
            
<div className={`nav-link ${activeTab === 'payer' ? 'active' : ''}`} onClick={() => setActiveTab('payer')}>
  <Send size={20} /> <span>Payer</span>
</div>
            <div className="nav-link">
              <Package size={20} /> <span>Produits</span>
            </div>
            <div className="nav-link">
              <Heart size={20} /> <span>Lifestyle</span>
            </div>
            <div className="nav-link">
              <HelpCircle size={20} /> <span>Aide</span>
            </div>
          </nav>
        </aside>

        {/* Contenu de droite */}
        <div className="bper-main-viewport">
          <header className="bper-top-bar">
            <div className="bper-welcome">
              Bienvenue, <strong>{data.firstname} {data.lastname}</strong>
            </div>
            <div className="bper-header-tools">
              <Bell size={22} className="tool-icon" />
              <div className="user-avatar-circle"><User size={20} /></div>
            </div>
          </header>

          <div className="bper-scroll-content">
            {activeTab === "accounts" && <Accounts data={data} setActiveTab={setActiveTab}/>}
            
            {activeTab === "cards" && (
              <div className="cards-section-desktop">
                <h3 className="cards-title">Mes cartes</h3>
                <div className="desktop-cards-grid">
                  {card && <BankCard card={card}/>}
                  <div className="card-request-desktop" onClick={() => navigate("/request-card")}>
                    <div className="card-plus">+</div>
                    <p>Demander une carte</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dans Dashboard.jsx (Rendu Desktop uniquement) */}
{activeTab === "payer" && (
  <div className="cards-section-desktop is-desktop-view"> 
    <h3 className="cards-title">Opérations</h3>
    <div className="payer-desktop-wrapper">
       <Payer />
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU : TA VERSION MOBILE ORIGINALE (INTACTE) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} offset={scrollOffset} opacity={opacity} />

      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        
        {/* Section Profile (Si présente) */}
        {activeTab === "profile" && <div className="content">Mon Profil</div>}

        {activeTab === "cards" && (
          <div className="cards-section">
            <h3 className="cards-title">Mes cartes</h3>
            <div className="cards-slider">
              {card && (
                <div className="cards-slide">
                  <BankCard card={card}/>
                </div>
              )}
              <div className="cards-slide card-request" onClick={() => navigate("/request-card")}>
                <div className="card-request-inner">
                  <div className="card-plus">+</div>
                  <p>Demander une carte</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "financing" && (
          <div className="content">
            <div className="account-card">
              <h3>Financements</h3>
              <p>Aucun financement disponible</p>
            </div>
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  );
}