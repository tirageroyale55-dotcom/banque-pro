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
        {/* SIDEBAR GAUCHE - TEXTE VERTICAL COMME TON DESSIN */}
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
          {/* HEADER TOP : Vraies informations et icônes du projet */}
          <header className="bper-header-top">
             <div className="bper-user-welcome">
                Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span>
             </div>
             <div className="bper-top-icons">
                {/* On utilise les styles de ton projet pour les icônes */}
                <div className="icon-wrapper notification-icon"></div> 
                <div className="icon-wrapper profile-icon" onClick={() => setActiveTab('profile')}></div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-grid">
                
                {/* SECTION SOLDE : Structure exacte du dessin */}
                <section className="bper-balance-card">
                  <div className="balance-left">
                    <p className="balance-label">Solde disponible <span className="eye-icon"></span></p>
                    <h2 className="balance-value">{data.balance?.toLocaleString('fr-FR')} €</h2>
                    <div className="wallet-image"></div> {/* Ton icône portefeuille */}
                  </div>
                  
                  {/* BOUTONS À DROITE : Alignement serré comme le plan */}
                  <div className="bper-action-buttons">
                    <button className="bper-btn-outline">Voir mon IBAN</button>
                    <button className="bper-btn-filled">Effectuer un virement</button>
                    <button className="bper-btn-outline">Voir ma carte virtuelle</button>
                  </div>
                </section>

                {/* HISTORIQUE ET GRAPHES : On affiche les vraies transactions */}
                <section className="bper-history-section">
                  <div className="history-header">
                    <span className="hamburger-icon">≡</span> 
                    <h3>Historique des transactions</h3>
                  </div>
                  
                  <div className="transactions-container">
                    {data.transactions && data.transactions.length > 0 ? (
                      data.transactions.map((tr, index) => (
                        <div key={index} className="desktop-tr-row">
                          <div className="tr-left">
                            <div className={`tr-icon ${tr.type}`}></div>
                            <div>
                              <p className="tr-label">{tr.label}</p>
                              <p className="tr-date">{tr.date}</p>
                            </div>
                          </div>
                          <div className={`tr-amount ${tr.type}`}>
                            {tr.type === 'credit' ? '+' : '-'}{tr.amount} €
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

  {/* RENDU MOBILE - INCHANGÉ */}
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav />
    </div>
  );
}