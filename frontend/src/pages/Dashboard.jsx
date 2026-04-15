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
          {/* HEADER : Bienvenue à GAUCHE, Profil à DROITE */}
          <header className="bper-header-top">
             <div className="bper-user-welcome-left">
                Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span>
             </div>
             <div className="bper-top-icons-right">
                <div className="bper-square-icon">
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 22a2.02 2.02 0 0 1-2.01-2h4.02A2.02 2.02 0 0 1 12 22zm7-3H5v-2l2-1V9c0-3.07 1.63-5.64 4.5-6.32V2h1v.68C15.37 3.36 17 5.92 17 9v6l2 1v2z"/></svg>
                </div>
                <div className="bper-square-icon profile-btn" onClick={() => setActiveTab('profile')}>
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                
                {/* CARTE SOLDE : BLANCHE AVEC TEXTE VERT */}
                <section className="bper-hero-card-white">
                  <div className="bper-balance-box-main">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{data.balance?.toLocaleString()} €</h1>
                    <p className="bper-iban-green">IT37Q0538712100120619128863</p>
                  </div>
                  
                  {/* BOUTONS EN DESSOUS DU SOLDE - ALIGNÉS HORIZONTALEMENT */}
                  <div className="bper-actions-footer">
                    <button className="bper-pill-green">Voir mon IBAN</button>
                    <button className="bper-pill-green active">Effectuer un virement</button>
                    <button className="bper-pill-green">Voir ma carte virtuelle</button>
                  </div>
                </section>

                {/* SECTION HISTORIQUE AVEC LES GRAPHES */}
                <section className="bper-history-block-dark">
                  <div className="bper-history-header">
                    <span className="bper-menu-symbol">≡</span> 
                    <h3>Historique des transactions</h3>
                  </div>

                  {/* Zone pour les Graphes (simulation visuelle comme ton dessin) */}
                  <div className="bper-graph-area">
                     <div className="graph-bar" style={{height: '60%'}}></div>
                     <div className="graph-bar" style={{height: '80%'}}></div>
                     <div className="graph-bar" style={{height: '40%'}}></div>
                     <div className="graph-bar" style={{height: '90%'}}></div>
                     <p className="graph-label">Statistiques mensuelles</p>
                  </div>
                  
                  <div className="bper-transactions-list">
                    {data.transactions?.map((tr, i) => (
                      <div key={i} className="bper-tr-item">
                        <div className="bper-tr-left">
                           <div className="bper-tr-circle">{tr.type === 'credit' ? '↓' : '↑'}</div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{tr.date}</p>
                           </div>
                        </div>
                        <div className={`bper-tr-value ${tr.type}`}>
                          {tr.type === 'credit' ? '+' : '-'}{tr.amount.toLocaleString()} €
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">{/* ... */}</div>
      <BottomNav />
    </div>
  );
}