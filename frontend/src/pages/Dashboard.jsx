import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

// Tes imports originaux
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
// Ajout des icônes pour le menu desktop professionnel
import { LayoutDashboard, CreditCard, Send, Package, Heart, HelpCircle, Bell, UserCircle } from "lucide-react";

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
  const contentRef = useRef(null);

  // --- LOGIQUE API (Identique à ton original) ---
  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card").then(setCard).catch(() => console.log("Erreur carte"));
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
          }).catch(err => console.error("Erreur transactions", err));
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setShowBalanceBar(false);
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Logique de scroll mobile (Uniquement active sur mobile)
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

  // ==========================================
  // Rendu 1 : VERSION DESKTOP (Image BPER)
  // ==========================================
  if (isDesktop) {
    return (
      <div className="desktop-bper-container">
        {/* Barre Latérale (Sidebar selon ton dessin) */}
        <aside className="bper-desktop-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-menu">
            <div className={`menu-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <LayoutDashboard size={20} /> Accueil
            </div>
            <div className={`menu-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={20} /> Cartes
            </div>
            <div className="menu-item"><Send size={20} /> Payer</div>
            <div className="menu-item"><Package size={20} /> Produits</div>
            <div className="menu-item"><Heart size={20} /> Lifestyle</div>
            <div className="menu-item"><HelpCircle size={20} /> Aide</div>
          </nav>
        </aside>

        {/* Zone de contenu droite */}
        <main className="bper-desktop-main">
          <header className="bper-desktop-header">
            <div className="welcome-info">
              Bienvenue, <strong>{data.firstName} {data.lastName}</strong>
            </div>
            <div className="top-icons">
              <Bell size={22} />
              <UserCircle size={26} />
            </div>
          </header>

          <div className="bper-desktop-content">
            {activeTab === "accounts" && <Accounts data={data} />}
            {activeTab === "cards" && (
              <div className="desktop-card-grid">
                {card && <BankCard card={card} />}
                <div className="desktop-add-card" onClick={() => navigate("/request-card")}>
                   <span>+ Demander une carte</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // Rendu 2 : TA VERSION MOBILE (Zéro changement)
  // ==========================================
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} offset={scrollOffset} opacity={opacity} />

      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
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
      <BottomNav/>
    </div>
  );
}