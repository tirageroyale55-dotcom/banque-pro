import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Copy, Filter } from "lucide-react";

// Imports pour les graphiques
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
import Profile from "./Profile"; 

import "../styles/dashboard.css";

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);
  const [showIban, setShowIban] = useState(false); // Pour le bouton Voir mon IBAN

  const navigate = useNavigate();
  const contentRef = useRef(null);

  // --- LOGIQUE DE FORMATAGE & CALCULS (Tirée de Accounts.jsx) ---
  const formatBper = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

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

  // --- PRÉPARATION DES DONNÉES GRAPHIQUES (Desktop) ---
  const rawTransactions = data.transactions || [];
  const grouped = {};
  rawTransactions.forEach(tx => {
    const dateKey = new Date(tx.createdAt || tx.date).toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    if (tx.type === "CREDIT" || tx.type === "credit") {
      grouped[dateKey].in += tx.amount;
    } else {
      grouped[dateKey].out += Math.abs(tx.amount);
    }
  });

  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));
  
  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d]?.in || 0), backgroundColor: "#16a34a" },
      { label: "Sorties", data: dates.map(d => grouped[d]?.out || 0), backgroundColor: "#dc2626" }
    ]
  };

  // --- RENDU DESKTOP ---
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
          <header className="bper-header-top">
             <div className="bper-user-welcome">
                Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span>
             </div>
             <div className="bper-top-icons">
                <div className="bper-square-icon"><Filter size={20} /></div>
                <div className="bper-square-icon profile-btn" onClick={() => setActiveTab('profile')}>
                   <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                    {showIban && <p className="bper-iban-text">IBAN: {data.iban}</p>}
                  </div>
                  
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>
                      {showIban ? "Masquer l'IBAN" : "Voir mon IBAN"}
                    </button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Effectuer un virement</button>
                    <button className="bper-pill-green">Voir ma carte virtuelle</button>
                  </div>
                </section>

                <section className="bper-history-block-white">
                  <div className="bper-history-header-green">
                    <span className="bper-menu-symbol-green">≡</span> 
                    <h3>Historique des transactions</h3>
                  </div>

                  <div className="bper-transactions-table-green">
                    {rawTransactions.map((tr, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           <div className="bper-tr-circle-green">
                              {tr.type === 'credit' || tr.type === 'CREDIT' ? <PlusCircle size={16} color="#16a34a"/> : <Send size={16}/>}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{new Date(tr.createdAt || tr.date).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div className={`bper-tr-value-green ${tr.type === 'credit' || tr.type === 'CREDIT' ? 'plus' : 'minus'}`}>
                          {tr.type === 'credit' || tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AFFICHAGE DU GRAPHIQUE */}
                  <div className="bper-desktop-charts">
                    <h4 style={{ color: '#0b5c5b', margin: '20px 0' }}>Analyse des flux</h4>
                    <div style={{ height: '300px', width: '100%' }}>
                      <Bar data={barData} options={{ maintainAspectRatio: false }} />
                    </div>
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

  // --- RENDU MOBILE (STRICTEMENT IDENTIQUE À TON ORIGINAL) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} offset={scrollOffset} opacity={opacity} />
      <div className="page-content" ref={contentRef}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && <BankCard card={card} />}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav />
    </div>
  );
}