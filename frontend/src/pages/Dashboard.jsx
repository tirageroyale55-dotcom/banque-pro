import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
// Ajout de l'import Profile au cas où il manquerait
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

  // Gestion du redimensionnement
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Chargement des données
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

  // BalanceBar (Logique Mobile uniquement)
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

  if (isDesktop) {
    return (
      <div className="bank-app desktop-layout">
        {/* SIDEBAR GAUCHE */}
        <aside className="desktop-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className="nav-item">Cartes</div>
            <div className="nav-item">Payer</div>
            <div className="nav-item">Produits</div>
            <div className="nav-item">Lifestyle</div>
            <div className="nav-item">Aide</div>
          </nav>
        </aside>

        <main className="desktop-main">
          {/* HEADER TOP DROITE (Comme le dessin) */}
          <header className="desktop-header-top">
            <div className="user-info-desktop">
              <span className="welcome-text">Bienvenue,</span>
              <span className="user-fullname">{data.firstName} {data.lastName}</span>
            </div>
            <div className="header-icons-desktop">
               <div className="icon-circle">🔔</div>
               <div className="icon-circle profile-btn" onClick={() => setActiveTab('profile')}>👤</div>
            </div>
          </header>

          <div className="desktop-content">
            {activeTab === "accounts" && (
              <>
                {/* SECTION CENTRALE (Solde + Boutons à droite comme le dessin) */}
                <div className="hero-section-desktop">
                  <div className="balance-block-desktop">
                    <p className="label">Solde disponible</p>
                    <h1 className="amount">{data.balance?.toLocaleString()} €</h1>
                    <p className="iban-display">IT37Q0538712100120619128863</p>
                  </div>
                  
                  <div className="actions-column-desktop">
                    <button className="btn-outline">Voir mon IBAN</button>
                    <button className="btn-filled">Effectuer un virement</button>
                    <button className="btn-outline">Voir ma carte virtuelle</button>
                  </div>
                </div>

                {/* LISTE TRANSACTIONS (Largeur totale en bas) */}
                <div className="history-container-desktop">
                  <div className="history-header">
                    <span className="menu-icon">≡</span> 
                    <h3>Historique des transactions</h3>
                  </div>
                  <div className="transactions-list-desktop">
                    {/* On boucle sur tes transactions ici */}
                    {data.transactions?.map((t, i) => (
                      <div key={i} className="tr-row">
                        <div className="tr-info">
                          <p className="tr-title">{t.label}</p>
                          <p className="tr-date">{t.date}</p>
                        </div>
                        <div className={`tr-amount ${t.type}`}>
                          {t.type === 'credit' ? '+' : '-'}{t.amount} €
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Autres onglets... */}
            {activeTab === "profile" && <Profile data={data} />}
          </div>
        </main>
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
      </div>
      <BottomNav />
    </div>
  );
}