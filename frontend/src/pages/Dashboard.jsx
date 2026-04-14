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

  // --- LOGIQUE BALANCEBAR MOBILE (CONSERVÉE) ---
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

  // --- RENDU DESKTOP (VÉRIFIÉ) ---
  if (isDesktop) {
    return (
      <div className="desktop-main-container">
        {/* SIDEBAR GAUCHE */}
        <aside className="sidebar-desktop">
          <div className="sidebar-brand">BPER</div>
          <nav className="nav-list">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>Mes Cartes</div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Aide</div>
          </nav>
        </aside>

        {/* CONTENU DROITE */}
        <div className="content-right">
          <header className="header-desktop-top">
            <div className="profile-top-info">
              <span>{data.firstName} {data.lastName}</span>
              <div className="avatar-circle" onClick={() => setActiveTab('profile')}>
                {data.firstName[0]}{data.lastName[0]}
              </div>
            </div>
          </header>
          
          <main className="scrollable-content-desktop">
            {activeTab === "accounts" && <Accounts data={data} />}
            {activeTab === "profile" && <Profile data={data} />}
            {activeTab === "cards" && (
              <div className="cards-wrapper-desktop">
                {card ? <BankCard card={card} /> : <p>Chargement des cartes...</p>}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // --- RENDU MOBILE (STRICTEMENT INTACT) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} offset={scrollOffset} opacity={opacity} />
      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "profile" && <Profile data={data} />}
        {activeTab === "cards" && card && <BankCard card={card} />}
      </div>
      <BottomNav />
    </div>
  );
}