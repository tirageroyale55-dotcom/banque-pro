import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";

// Icônes pour le menu Desktop (Pro BPER)
import { LayoutDashboard, CreditCard, Send, Package, Heart, HelpCircle, Bell, User } from "lucide-react";

import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);

  const navigate = useNavigate();
  const contentRef = useRef(null);

  // 1. Chargement des données (Ton code original préservé)
  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData); 
        
        // Chargement de l'historique
        api("/transactions")
          .then((transactionsData) => {
            // On s'assure de bien merger les transactions dans l'état 'data'
            setData(prev => ({
              ...prev,
              transactions: transactionsData.transactions || transactionsData 
            }));
          })
          .catch(err => console.error("Erreur transactions:", err));
      })
      .catch((err) => {
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
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gestion du scroll BalanceBar (Mobile uniquement)
  useEffect(() => {
    if (!data || activeTab !== "accounts" || isDesktop) return;
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

  // ==========================================
  // RENDU DESKTOP (Inspiré de ton dessin BPER)
  // ==========================================
  if (isDesktop) {
    return (
      <div className="bper-desktop-layout">
        <aside className="bper-sidebar-left">
          <div className="bper-brand">BPER</div>
          <nav className="bper-side-nav">
            <div className={`nav-link ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <LayoutDashboard size={20} /> <span>Accueil</span>
            </div>
            <div className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={20} /> <span>Cartes</span>
            </div>
            <div className="nav-link" onClick={() => setActiveTab('financing')}>
              <Send size={20} /> <span>Payer</span>
            </div>
            <div className="nav-link"><Package size={20} /> <span>Produits</span></div>
            <div className="nav-link"><Heart size={20} /> <span>Lifestyle</span></div>
            <div className="nav-link"><HelpCircle size={20} /> <span>Aide</span></div>
          </nav>
        </aside>

        <div className="bper-main-viewport">
          <header className="bper-top-bar">
            <div className="bper-welcome">Bienvenue, <strong>{data.firstName} {data.lastName}</strong></div>
            <div className="bper-header-tools">
              <Bell size={22} />
              <div className="user-avatar-circle"><User size={20} /></div>
            </div>
          </header>

          <div className="bper-scroll-content">
            {/* CORRECTION : On passe data ET explicitement transactions */}
            {activeTab === "accounts" && <Accounts data={data} transactions={data.transactions} />}
            
            {activeTab === "cards" && (
              <div className="desktop-card-grid">
                {card && <BankCard card={card}/>}
                <div className="card-request-desktop" onClick={() => navigate("/request-card")}>
                  <span>+ Demander une carte</span>
                </div>
              </div>
            )}

            {activeTab === "financing" && (
               <div className="account-card">
                  <h3>Financements</h3>
                  <p>Aucun financement disponible</p>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDU MOBILE (Ton code original exact)
  // ==========================================
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} />

      <div className="page-content" ref={contentRef}>
        {/* CORRECTION ICI AUSSI */}
        {activeTab === "accounts" && <Accounts data={data} transactions={data.transactions} />}

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