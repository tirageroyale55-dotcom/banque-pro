import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowRightLeft, 
  Package, 
  Heart, 
  HelpCircle,
  LogOut,
  Bell,
  User
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

  useEffect(() => {
    // Chargement des données BPER
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

  // Logique de scroll BalanceBar (Uniquement Mobile)
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

  return (
    <div className={`bank-app ${isDesktop ? "is-desktop-layout" : ""}`}>
      
      {/* SIDEBAR DESKTOP - Affichée selon ton dessin */}
      {isDesktop && (
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <LayoutDashboard size={22} /> <span>Accueil</span>
            </div>
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={22} /> <span>Cartes</span>
            </div>
            <div className="nav-item">
              <ArrowRightLeft size={22} /> <span>Payer</span>
            </div>
            <div className="nav-item">
              <Package size={22} /> <span>Produits</span>
            </div>
            <div className="nav-item">
              <Heart size={22} /> <span>Lifestyle</span>
            </div>
            <div className="nav-item">
              <HelpCircle size={22} /> <span>Aide</span>
            </div>
          </nav>
        </aside>
      )}

      <div className="main-container">
        {/* HEADER : Mobile (Ton Header) vs Desktop (Barre de bienvenue) */}
        {!isDesktop ? (
          <Header data={data} />
        ) : (
          <header className="desktop-top-header">
            <div className="welcome-text">
              Bienvenue, <strong>{data.firstName} {data.lastName}</strong>
            </div>
            <div className="top-icons">
              <Bell size={24} />
              <div className="profile-circle"><User size={20} /></div>
            </div>
          </header>
        )}

        {!isDesktop && <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />}
        
        {!isDesktop && <BalanceBar balance={data.balance} />}

        <div className="content-area">
          {activeTab === "accounts" && <Accounts data={data} />}
          
          {activeTab === "cards" && (
            <div className="cards-wrapper">
              <h2 className="section-title">Mes Cartes</h2>
              <div className="cards-display">
                {card && <BankCard card={card} />}
                <div className="add-card-placeholder" onClick={() => navigate("/request-card")}>
                  <div className="plus-icon">+</div>
                  <p>Demander une carte</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isDesktop && <BottomNav />}
    </div>
  );
}