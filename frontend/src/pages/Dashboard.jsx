import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, CreditCard, ArrowRightLeft, 
  Package, Heart, HelpCircle, Bell, UserCircle 
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

  // --- RENDU 1 : VERSION DESKTOP (Basé sur l'image envoyée) ---
  const DesktopView = () => (
    <div className="bper-desktop-layout">
      {/* Barre Latérale Gauche */}
      <aside className="bper-sidebar-fixed">
        <div className="bper-logo-area">BPER</div>
        <nav className="bper-side-nav">
          <div className={`side-link ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
            <LayoutDashboard size={20} /> <span>Accueil</span>
          </div>
          <div className={`side-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
            <CreditCard size={20} /> <span>Cartes</span>
          </div>
          <div className="side-link"><ArrowRightLeft size={20} /> <span>Payer</span></div>
          <div className="side-link"><Package size={20} /> <span>Produits</span></div>
          <div className="side-link"><Heart size={20} /> <span>Lifestyle</span></div>
          <div className="side-link"><HelpCircle size={20} /> <span>Aide</span></div>
        </nav>
      </aside>

      {/* Contenu de droite */}
      <main className="bper-desktop-main">
        <header className="bper-desktop-header">
          <div className="bper-welcome">
            Bienvenue, <strong>{data.firstName} {data.lastName}</strong>
          </div>
          <div className="bper-top-icons">
            <Bell size={24} className="icon-clickable" />
            <div className="profile-placeholder">
              <UserCircle size={28} />
            </div>
          </div>
        </header>

        <section className="bper-desktop-body">
          {activeTab === "accounts" && <Accounts data={data} />}
          {activeTab === "cards" && (
            <div className="desktop-cards-container">
              {card && <BankCard card={card} />}
              <div className="desktop-card-add" onClick={() => navigate("/request-card")}>
                <div className="plus-btn">+</div>
                <p>Demander une carte</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );

  // --- RENDU 2 : VERSION MOBILE (Ton code original exact) ---
  const MobileView = () => (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data} />}
        {activeTab === "cards" && (
          <div className="cards-section">
            <h3 className="cards-title">Mes cartes</h3>
            <div className="cards-slider">
              {card && <div className="cards-slide"><BankCard card={card} /></div>}
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
      <BottomNav />
    </div>
  );

  return isDesktop ? <DesktopView /> : <MobileView />;
}