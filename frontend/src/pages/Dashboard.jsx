import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
 
import CardCatalog from "./CardCatalog"; 
import Accounts from "./Accounts";
import Payer from "./Payer";
import Produits from "./Produits";  
import Lifestyle from "./Lifestyle"; 
import Aide from "./Aide";
import Profile from "./Profile";
import Notifications from "./Notifications";

import { LayoutDashboard, CreditCard, Send, Package, Heart, HelpCircle, Bell } from "lucide-react";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);
  const [pendingCard, setPendingCard] = useState(null);

  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Sécurisation des noms
  const userInfo = data?.user || data || {};
  const firstName = userInfo.firstname || userInfo.prenom || "";
  const lastName = userInfo.lastname || userInfo.nom || "";
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "??";
  const profileImage = userInfo.profilePicture || null;

  useEffect(() => {
    // Charger la carte existante
    if (activeTab === "cards") {
      api("/client/card")
        .then(setCard)
        .catch(() => console.log("Pas de carte active"));
    }

    // Charger une éventuelle demande en cours
    const saved = localStorage.getItem("pending_card_request");
    if (saved) setPendingCard(JSON.parse(saved));
  }, [activeTab]);

  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData); 
        api("/transactions")
          .then((transactionsData) => {
            setData(prev => ({ ...prev, transactions: transactionsData.transactions || transactionsData }));
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

  if (!data) return null;

  // Composant interne pour gérer l'affichage conditionnel des cartes (Bouton + ou Carte en cours)
  const CardsListContent = ({ desktopMode }) => (
    <div className={desktopMode ? "desktop-cards-grid" : "cards-slider"}>
      {/* Carte Active (Base de données) */}
      {card && (
        <div className={desktopMode ? "" : "cards-slide"}>
          <BankCard card={card}/>
        </div>
      )}

      {/* Carte en attente OU Bouton Demander */}
      {pendingCard ? (
        <div className={desktopMode ? "" : "cards-slide"} style={{ position: 'relative' }}>
          <BankCard card={pendingCard} />
          <div style={{
            position: 'absolute', top: '15px', right: '15px',
            background: '#f59e0b', color: 'white', padding: '5px 12px',
            borderRadius: '20px', fontSize: '10px', fontWeight: '900', zIndex: 10,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', letterSpacing: '0.5px'
          }}>
            EN COURS
          </div>
        </div>
      ) : (
        <div className={desktopMode ? "card-request-desktop" : "cards-slide card-request"} onClick={() => navigate("/request-card")}>
          <div className={desktopMode ? "" : "card-request-inner"}>
            <div className="card-plus">+</div>
            <p>Demander une carte</p>
          </div>
        </div>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <div className="bper-desktop-layout">
        <aside className="bper-sidebar-left">
          <div className="bper-brand">BPER</div>
          <nav className="bper-side-nav">
            <div className={`nav-link ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}><LayoutDashboard size={20} /> <span>Accueil</span></div>
            <div className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}><CreditCard size={20} /> <span>Cartes</span></div>
            <div className={`nav-link ${activeTab === 'payer' ? 'active' : ''}`} onClick={() => setActiveTab('payer')}><Send size={20} /> <span>Payer</span></div>
            <div className={`nav-link ${activeTab === 'produits' ? 'active' : ''}`} onClick={() => setActiveTab('produits')}><Package size={20} /> <span>Produits</span></div>
            <div className={`nav-link ${activeTab === 'lifestyle' ? 'active' : ''}`} onClick={() => setActiveTab('lifestyle')}><Heart size={20} /> <span>Lifestyle</span></div>
            <div className={`nav-link ${activeTab === 'aide' ? 'active' : ''}`} onClick={() => setActiveTab('aide')}><HelpCircle size={20} /> <span>Aide</span></div>
          </nav>
        </aside>

        <div className="bper-main-viewport">
          <header className="bper-top-bar">
            <div className="bper-welcome">Bienvenue, <strong>{firstName} {lastName}</strong></div>
            <div className="bper-header-tools">
              <Bell size={22} className="tool-icon" onClick={() => setActiveTab('notifications')} />
              <div className="user-avatar-circle" onClick={() => setActiveTab('profile')}>
                {profileImage ? <img src={profileImage} alt="Avatar" /> : <span>{initials}</span>}
              </div>
            </div>
          </header>

          <div className="bper-scroll-content">
            {activeTab === "accounts" && <Accounts data={data} setActiveTab={setActiveTab}/>}
            {activeTab === "cards" && (
              <div className="cards-section-desktop">
                <h3 className="cards-title">Mes cartes</h3>
                <CardsListContent desktopMode={true} />
                <CardCatalog /> 
              </div>
            )}
            {activeTab === "payer" && <div className="cards-section-desktop"><Payer isDesktop={true} /></div>}
            {activeTab === "produits" && <div className="cards-section-desktop"><Produits isDesktop={true} /></div>}
            {activeTab === "lifestyle" && <div className="cards-section-desktop"><Lifestyle isDesktop={true} /></div>}
            {activeTab === "aide" && <div className="cards-section-desktop"><Aide isDesktop={true} /></div>}
            {activeTab === "notifications" && <div className="cards-section-desktop"><Notifications isDesktop={true} /></div>}
            {activeTab === "profile" && <div className="cards-section-desktop"><Profile data={data} isDesktop={true} /></div>}   
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && (
          <div className="cards-section">
            <h3 className="cards-title">Mes cartes</h3>
            <CardsListContent desktopMode={false} />
            <CardCatalog />
          </div>
        )}
      </div>
      <BottomNav/>
    </div>
  );
}