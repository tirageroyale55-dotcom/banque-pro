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

  // --- VERSION DESKTOP (Inspirée de ton dessin) ---
  if (isDesktop) {
    return (
      <div className="bper-desktop-root">
        <aside className="bper-sidebar">
          <div className="sidebar-brand">BPER</div>
          <nav className="sidebar-menu">
            <div className={`menu-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <LayoutDashboard size={20} /> Accueil
            </div>
            <div className={`menu-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={20} /> Cartes
            </div>
            <div className="menu-item"><ArrowRightLeft size={20} /> Payer</div>
            <div className="menu-item"><Package size={20} /> Produits</div>
            <div className="menu-item"><Heart size={20} /> Lifestyle</div>
            <div className="menu-item"><HelpCircle size={20} /> Aide</div>
          </nav>
        </aside>

        <main className="bper-main">
          <header className="bper-topbar">
            <div className="user-welcome">
              Bienvenue, <strong>{data.firstName} {data.lastName}</strong>
            </div>
            <div className="user-actions">
              <Bell size={20} />
              <div className="avatar"><User size={18} /></div>
            </div>
          </header>

          <section className="bper-content">
            {activeTab === "accounts" && <Accounts data={data} />}
            {activeTab === "cards" && (
              <div className="desktop-cards-grid">
                {card && <BankCard card={card} />}
                <div className="new-card-box" onClick={() => navigate("/request-card")}>
                  <span>+ Demander une carte</span>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  // --- VERSION MOBILE (Ton code original, intact) ---
  return (
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
}