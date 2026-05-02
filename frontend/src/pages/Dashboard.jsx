import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, CreditCard, ArrowRightLeft, 
  Package, Heart, HelpCircle, Bell, User 
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
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transactions").then((tData) => {
          setData(prev => ({ ...prev, transactions: tData.transactions || tData }));
        }).catch(() => {});
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
      api("/client/card").then(setCard).catch(() => {});
    }
  }, [activeTab]);

  if (!data) return null;

  // --- RENDU MOBILE (TON CODE ORIGINAL NON TOUCHÉ) ---
  const renderMobile = () => (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} />
      <div className="page-content">
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

  // --- RENDU DESKTOP (STRICTEMENT BASÉ SUR L'IMAGE WhatsApp Image 2026-04-12 at 19.24.15.jpeg) ---
  const renderDesktop = () => (
    <div id="BPER-DESKTOP-CONTAINER">
      <aside className="bper-sidebar">
        <div className="sidebar-logo">BPER</div>
        <nav className="sidebar-nav">
          <div className={`nav-link ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
            <LayoutDashboard size={20} /> <span>Accueil</span>
          </div>
          <div className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
            <CreditCard size={20} /> <span>Cartes</span>
          </div>
          <div className="nav-link"><ArrowRightLeft size={20} /> <span>Payer</span></div>
          <div className="nav-link"><Package size={20} /> <span>Produits</span></div>
          <div className="nav-link"><Heart size={20} /> <span>Lifestyle</span></div>
          <div className="nav-link"><HelpCircle size={20} /> <span>Aide</span></div>
        </nav>
      </aside>

      <main className="bper-main-content">
        <header className="bper-navbar">
          <div className="bper-welcome">
            Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span>
          </div>
          <div className="bper-top-icons">
            <Bell size={22} />
            <div className="bper-avatar"><User size={20} /></div>
          </div>
        </header>

        <section className="bper-page-wrapper">
          {activeTab === "accounts" && <Accounts data={data} />}
          {activeTab === "cards" && (
            <div className="desktop-cards-layout">
              {card && <BankCard card={card} />}
              <div className="desktop-add-card" onClick={() => navigate("/request-card")}>
                <div className="plus-circle">+</div>
                <p>Demander une carte</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );

  return isDesktop ? renderDesktop() : renderMobile();
}