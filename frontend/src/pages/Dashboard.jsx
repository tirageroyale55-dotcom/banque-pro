import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
import Payer from "./Payer";
import Produits from "./Produits";  
import Lifestyle from "./Lifestyle"; 
import Aide from "./Aide";
import Profile from "./Profile";
import Notifications from "./Notifications";

// Icônes pour le menu Desktop Professionnel
import { LayoutDashboard, CreditCard, Send, Package, Heart, HelpCircle, Bell, User } from "lucide-react";

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
  const lastScrollRef = useRef(0);
  const contentRef = useRef(null);

  
  // Version sécurisée pour éviter le dashboard vide
const userInfo = data?.user || data || {};
const firstName = userInfo.firstname || userInfo.prenom || "";
const lastName = userInfo.lastname || userInfo.nom || "";

const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "??";
const profileImage = userInfo.profilePicture || null;

  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card")
        .then(setCard)
        .catch(() => console.log("Erreur carte"));
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
          })
          .catch(err => console.error("L'historique n'a pas pu être chargé :", err));
      })
      .catch((err) => {
        console.error("Session expirée ou erreur profil");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1000);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setShowBalanceBar(false);
    window.scrollTo(0, 0);
  }, [activeTab]);

  useEffect(() => {
    if (!data || activeTab !== "accounts") {
      const bar = document.querySelector('.balance-bar');
      if (bar) bar.classList.remove('show');
      return;
    }

    const handleScroll = () => {
      const bar = document.querySelector('.balance-bar');
      const accountCard = document.querySelector('.account-card');
      if (!bar || !accountCard) return;

      const cardRect = accountCard.getBoundingClientRect();
      const triggerPoint = 135; 

      if (cardRect.top < triggerPoint) {
        bar.classList.add('show');
      } else {
        bar.classList.remove('show');
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeTab, data]);

  if (!data) return null;

  // --- RENDU CONDITIONNEL : DESKTOP ---
  if (isDesktop) {
    return (
      <div className="bper-desktop-layout">
        {/* Barre latérale (Sidebar) - Inspirée de WhatsApp Image 2026-04-12 at 19.24.15.jpeg */}
        <aside className="bper-sidebar-left">
          <div className="bper-brand">BPER</div>
          <nav className="bper-side-nav">
            <div className={`nav-link ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <LayoutDashboard size={20} /> <span>Accueil</span>
            </div>
            <div className={`nav-link ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
              <CreditCard size={20} /> <span>Cartes</span>
            </div>
            
            <div 
              className={`nav-link ${activeTab === 'payer' ? 'active' : ''}`} 
              onClick={() => setActiveTab('payer')}
            >
              <Send size={20} /> <span>Payer</span>
            </div>
            
            <div className={`nav-link ${activeTab === 'produits' ? 'active' : ''}`} onClick={() => setActiveTab('produits')}>
               <Package size={20} /> <span>Produits</span>
            </div>

            <div className={`nav-link ${activeTab === 'lifestyle' ? 'active' : ''}`} onClick={() => setActiveTab('lifestyle')}>
               <Heart size={20} /> <span>Lifestyle</span>
            </div>

            <div className={`nav-link ${activeTab === 'aide' ? 'active' : ''}`} onClick={() => setActiveTab('aide')}>
               <HelpCircle size={20} /> <span>Aide</span>
             </div>
          </nav>
        </aside>

        {/* Contenu de droite */}
        <div className="bper-main-viewport">
          <header className="bper-top-bar">
            <div className="bper-welcome">
              Bienvenue, <strong>{firstName} {lastName}</strong>
            </div>
        <div className="bper-header-tools">
        <Bell 
          size={22} 
          className={`tool-icon ${activeTab === 'notifications' ? 'active-icon' : ''}`} 
          onClick={() => setActiveTab('notifications')} 
          style={{cursor: 'pointer'}}
        />
        <div 
          className={`user-avatar-circle ${activeTab === 'profile' ? 'active-avatar' : ''}`}
          onClick={() => setActiveTab('profile')}
        style={{
          cursor: 'pointer', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#eee', // Fond gris si pas de photo
          width: '40px',
          height: '40px',
          borderRadius: '50%'
         }}
        >
             {profileImage ? (
             <img src={profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#005a64' }}>
              {initials}
            </span>
           )}
          </div>
         </div>
        </header>

          <div className="bper-scroll-content">
            {activeTab === "accounts" && <Accounts data={data} setActiveTab={setActiveTab}/>}
            
            {activeTab === "cards" && (
              <div className="cards-section-desktop">
                <h3 className="cards-title">Mes cartes</h3>
                <div className="desktop-cards-grid">
                  {card && <BankCard card={card}/>}
                  <div className="card-request-desktop" onClick={() => navigate("/request-card")}>
                    <div className="card-plus">+</div>
                    <p>Demander une carte</p>
                  </div>
                </div>
              </div>
            )}

            
            {activeTab === "payer" && (
               <div className="cards-section-desktop">
                <h3 className="cards-title">Effectuer un paiement</h3>   
               <div className="payer-desktop-wrapper">
                 <Payer isDesktop={true} />
               </div>
              </div>
            )}


            {activeTab === "produits" && (
               <div className="cards-section-desktop">
                 <Produits isDesktop={true} />
               </div>
            )}

            {activeTab === "lifestyle" && (
               <div className="cards-section-desktop">
                 <Lifestyle isDesktop={true} />
               </div>
            )}

            {activeTab === "aide" && (
              <div className="cards-section-desktop">
                <Aide isDesktop={true} />
              </div>
            )}
       
            {activeTab === "notifications" && (
               <div className="cards-section-desktop">
                 <Notifications isDesktop={true} />
               </div>
            )}

            {activeTab === "profile" && (
               <div className="cards-section-desktop">
                 <Profile data={data} isDesktop={true} />
               </div>
            )}   
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU : TA VERSION MOBILE ORIGINALE (INTACTE) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} offset={scrollOffset} opacity={opacity} />

      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        
        {/* Section Profile (Si présente) */}
        {activeTab === "profile" && <div className="content">Mon Profil</div>}

        {activeTab === "cards" && (
          <div className="cards-section">
            <h3 className="cards-title">Mes cartes</h3>
            <div className="cards-slider">
              {card && (
                <div className="cards-slide">
                  <BankCard card={card}/>
                </div>
              )}
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