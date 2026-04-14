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
      <div className="bank-app bper-desktop-interface">
        {/* SIDEBAR GAUCHE (Exactement comme ton dessin) */}
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className="nav-item">Cartes</div>
            <div className="nav-item">Payer</div>
            <div className="nav-item">Produits</div>
            <div className="nav-item">Lifestyle</div>
            <div className="nav-item">Aide</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          {/* HEADER TOP DROITE (Profil + Notification exactement comme le dessin) */}
          <header className="bper-header-top">
             <div className="bper-user-welcome">
                Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span>
             </div>
             <div className="bper-top-icons">
                <div className="icon-wrapper">🔔</div> {/* Icône Notification du dessin */}
                <div className="icon-wrapper profile-trigger" onClick={() => setActiveTab('profile')}>👤</div> {/* Icône Profil du dessin */}
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-grid">
                
                {/* BLOC SOLDE (Le grand rectangle du dessin avec le portefeuille) */}
                <section className="bper-balance-card">
                  <div className="balance-info">
                    <p className="balance-label">Solde disponible 👁️</p>
                    <h2 className="balance-value">{data.balance?.toLocaleString()} €</h2>
                    <div className="wallet-icon">💼</div> {/* L'icône portefeuille en bas à droite du bloc sur ton dessin */}
                  </div>
                  
                  {/* LES BOUTONS À DROITE DU SOLDE (Arrondis comme sur ton dessin) */}
                  <div className="bper-action-buttons">
                    <button className="bper-btn"><span>📄</span> Voir mon IBAN</button>
                    <button className="bper-btn active"><span>➕</span> Effectuer un virement</button>
                    <button className="bper-btn"><span>💳</span> Voir ma carte virtuelle</button>
                  </div>
                </section>

                {/* HISTORIQUE (Le bloc large en dessous sur ton dessin) */}
                <section className="bper-history-section">
                  <div className="history-title">
                    <span className="hamburger-icon">≡</span> Historique des transactions
                  </div>
                  <div className="history-list">
                    {/* Contenu de l'historique ici */}
                    <div className="placeholder-text">Les graphes et transactions ici...</div>
                  </div>
                </section>

              </div>
            )}
            
            {activeTab === "profile" && <Profile data={data} />}
          </div>
        </main>
      </div>
    );
  }

  {/* RENDU MOBILE - NE CHANGE PAS D'UN POIL */}
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">{/* ... ton contenu mobile ... */}</div>
      <BottomNav />
    </div>
  );
}