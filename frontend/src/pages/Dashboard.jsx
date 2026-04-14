import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
// Ajout de l'import Profile au cas où il manquerait
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

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Chargement des données
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

  // --- RENDU DESKTOP (MODIFIÉ SELON TON DESSIN) ---
  if (isDesktop) {
    return (
      <div className="bank-app desktop-layout">
        {/* Menu latéral gauche (Sidebar) */}
        <aside className="desktop-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className="nav-item">Cartes</div>
            <div className="nav-item">Payer</div>
            <div className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Produits</div>
            <div className="nav-item">Lifestyle</div>
            <div className="nav-item">Aide</div>
          </nav>
        </aside>

        {/* Contenu de droite */}
        <main className="desktop-main">
          {/* Header Desktop : Nom + Icônes à droite (selon dessin) */}
          <header className="desktop-header-top">
            <div className="user-welcome">
              Bienvenue, {data.firstName} {data.lastName}
            </div>
            <div className="header-icons">
               <div className="icon-box">🔔</div> {/* Notification */}
               <div className="icon-box profile-trigger" onClick={() => setActiveTab('profile')}>👤</div> {/* Profil */}
            </div>
          </header>

          {/* Note: Le composant <Tabs /> est supprimé ici pour le Desktop */}

          <div className="desktop-scroll-area">
            {activeTab === "accounts" && <Accounts data={data} />}
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

  // --- RENDU MOBILE (STRICTEMENT INTACT COMME DEMANDÉ) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} offset={scrollOffset} opacity={opacity} />
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