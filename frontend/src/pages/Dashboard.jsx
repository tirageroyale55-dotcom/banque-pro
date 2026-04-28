import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, CreditCard, ArrowRightLeft, 
  Package, Heart, LifeBuoy, LogOut, Bell, User 
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

  // Chargement des données (Identique pour les deux versions)
  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transactions")
          .then((tData) => {
            setData(prev => ({ ...prev, transactions: tData.transactions || tData }));
          }).catch(err => console.error(err));
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

  // --- VERSION DESKTOP (Basée sur ton dessin) ---
  if (isDesktop) {
    return (
      <div className="bper-desktop-container">
        {/* Barre Latérale (Sidebar) */}
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <LayoutDashboard size={20} /> Accueil
            </div>
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={20} /> Cartes
            </div>
            <div className="nav-item"><ArrowRightLeft size={20} /> Payer</div>
            <div className="nav-item"><Package size={20} /> Produits</div>
            <div className="nav-item"><Heart size={20} /> Lifestyle</div>
            <div className="nav-item"><LifeBuoy size={20} /> Aide</div>
          </nav>
        </aside>

        {/* Contenu Principal */}
        <main className="bper-main">
          <header className="bper-topbar">
            <div className="user-welcome">
              Bienvenue, <strong>{data.firstName} {data.lastName}</strong>
            </div>
            <div className="topbar-icons">
              <div className="icon-circle"><Bell size={18} /></div>
              <div className="icon-circle"><User size={18} /></div>
            </div>
          </header>

          <section className="bper-content">
            <div className="bper-card-summary">
               <div className="solde-box">
                  <p>Solde disponible</p>
                  <h2>{data.balance?.toLocaleString()} €</h2>
                  <div className="action-buttons">
                    <button className="btn-light">Voir mon IBAN</button>
                    <button className="btn-dark">Effectuer un virement</button>
                    <button className="btn-light">Voir ma carte virtuelle</button>
                  </div>
               </div>
            </div>

            <div className="bper-history-section">
              <h3><ArrowRightLeft size={18} /> Historique des transactions</h3>
              <div className="history-full-width">
                 {/* Ici le composant Accounts en mode large */}
                 <Accounts data={data} isDesktop={true} />
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // --- VERSION MOBILE (Code original préservé à 100%) ---
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