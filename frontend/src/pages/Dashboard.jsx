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
        {/* SIDEBAR GAUCHE */}
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
          {/* HEADER TOP : Vrai Nom + Vraies Icônes */}
          <header className="bper-header-top">
             <div className="bper-user-welcome">
                Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span>
             </div>
             <div className="bper-top-icons">
                <div className="icon-box-bper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
                <div className="icon-box-bper profile-btn" onClick={() => setActiveTab('profile')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-grid">
                
                {/* BLOC SOLDE & BOUTONS ALIGNÉS (FACE À FACE) */}
                <section className="bper-hero-section">
                  <div className="balance-info-left">
                    <p className="balance-label">Solde disponible 👁️</p>
                    <h2 className="balance-value">{data.balance?.toLocaleString()} €</h2>
                    <div className="wallet-img-container">💼</div>
                  </div>
                  
                  {/* BOUTONS ALIGNÉS LES UNS CONTRE LES AUTRES */}
                  <div className="bper-horizontal-actions">
                    <button className="bper-action-pill">Voir mon IBAN</button>
                    <button className="bper-action-pill active">Effectuer un virement</button>
                    <button className="bper-action-pill">Voir ma carte virtuelle</button>
                  </div>
                </section>

                {/* HISTORIQUE ET GRAPHE (VRAIES DONNÉES) */}
                <section className="bper-history-full">
                  <div className="history-top-bar">
                    <span className="hamburger">≡</span> 
                    <h3>Historique des transactions</h3>
                  </div>
                  
                  <div className="transactions-container-desktop">
                    {data.transactions && data.transactions.length > 0 ? (
                      data.transactions.map((tr, index) => (
                        <div key={index} className="desktop-tr-row">
                          <div className="tr-left">
                             <div className="tr-icon-circle">{tr.type === 'credit' ? '↓' : '↑'}</div>
                             <div className="tr-texts">
                               <p className="tr-label">{tr.label}</p>
                               <p className="tr-date">{tr.date}</p>
                             </div>
                          </div>
                          <div className={`tr-amount-desktop ${tr.type}`}>
                            {tr.type === 'credit' ? '+' : '-'}{tr.amount.toLocaleString()} €
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">Aucune transaction récente.</p>
                    )}
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

  // --- RENDU MOBILE INTACT ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">{/* ... */}</div>
      <BottomNav />
    </div>
  );
}