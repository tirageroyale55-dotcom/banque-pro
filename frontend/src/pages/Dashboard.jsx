import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
// Ajout de Profile si tu l'utilises
import Profile from "./Profile"; 

// Icônes pour la Sidebar Desktop (Image WhatsApp)
import { LayoutDashboard, CreditCard, Send, Package, Heart, HelpCircle, Bell, User } from "lucide-react";

import "../styles/dashboard.css";

export default function Dashboard() {

const [data, setData] = useState(null);
const [activeTab, setActiveTab] = useState("accounts");
const [showBalanceBar, setShowBalanceBar] = useState(false);
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
const [card,setCard] = useState(null);

const [scrollOffset, setScrollOffset] = useState(-60); // Cachée par défaut
const [opacity, setOpacity] = useState(0);

const navigate = useNavigate();

const lastScrollRef = useRef(0);
const contentRef = useRef(null);

useEffect(()=>{

if(activeTab === "cards"){

api("/client/card")
.then(setCard)
.catch(()=>console.log("Erreur carte"));

}

},[activeTab]);

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
}, []);

useEffect(()=>{
const handleResize = () => {
setIsDesktop(window.innerWidth >= 1000);
};
window.addEventListener("resize", handleResize);
return () => window.removeEventListener("resize", handleResize);
},[]);

useEffect(()=>{
setShowBalanceBar(false)
window.scrollTo(0,0)
},[activeTab])

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

return (
<div className={`bank-app ${isDesktop ? "desktop-layout" : ""}`}>

  {/* --- SIDEBAR DESKTOP (Basée sur ton dessin) --- */}
  {isDesktop && (
    <aside className="bper-sidebar">
      <div className="bper-logo">BPER</div>
      <nav className="bper-nav-menu">
        <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
          <LayoutDashboard size={20} /> <span>Accueil</span>
        </div>
        <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>
          <CreditCard size={20} /> <span>Cartes</span>
        </div>
        <div className="nav-item" onClick={() => setActiveTab('financing')}>
          <Send size={20} /> <span>Payer</span>
        </div>
        <div className="nav-item">
          <Package size={20} /> <span>Produits</span>
        </div>
        <div className="nav-item">
          <Heart size={20} /> <span>Lifestyle</span>
        </div>
        <div className="nav-item">
          <HelpCircle size={20} /> <span>Aide</span>
        </div>
      </nav>
    </aside>
  )}

  {/* --- ZONE PRINCIPALE --- */}
  <div className={isDesktop ? "desktop-main-content" : ""}>

    {/* HEADER : On garde ton composant, mais on l'adapte pour le Desktop en haut à droite */}
    <div className="header-container">
      {isDesktop ? (
        <div className="bper-desktop-topbar">
          <div className="welcome-msg">Bienvenue, <strong>{data.firstName} {data.lastName}</strong></div>
          <div className="topbar-icons">
            <Bell size={22} />
            <div className="user-avatar"><User size={20} /></div>
          </div>
        </div>
      ) : (
        <Header data={data} />
      )}
    </div>

    {/* Onglets et BalanceBar : Uniquement Mobile */}
    {!isDesktop && (
      <>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <BalanceBar balance={data.balance} offset={scrollOffset} opacity={opacity} />
      </>
    )}

    {/* --- CONTENU DES PAGES (TON CODE INTACT) --- */}
    <div className="page-content" ref={contentRef}>

      {activeTab === "accounts" && <Accounts data={data}/>}

      {activeTab === "profile" && <Profile data={data} />}

      {activeTab === "cards" && (
        <div className="cards-section">
          <h3 className="cards-title">Mes cartes</h3>
          <div className="cards-slider">
            {card && (
              <div className="cards-slide">
                <BankCard card={card}/>
              </div>
            )}
            <div className="cards-slide card-request" onClick={()=>navigate("/request-card")}>
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
  </div>

  {!isDesktop && <BottomNav/>}

</div>
);
}