import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Receipt, Filter, Copy } from "lucide-react";

// Imports Graphiques
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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);
  
  // États pour les filtres (logique Accounts.jsx)
  const [filter, setFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(today);

  const navigate = useNavigate();

  // Formatage Italien (BPER)
  const formatBper = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  if (!data) return null;

  // --- LOGIQUE DE TRAITEMENT DES TRANSACTIONS ---
  const rawTransactions = data.transactions || [];
  const filteredTransactions = rawTransactions
    .filter(tx => {
      const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
      const matchType = filter === "all" || (filter === "entrants" && tx.type === "CREDIT") || (filter === "sortants" && tx.type === "DEBIT");
      const matchStart = startDate ? txDate >= startDate : true;
      const matchEnd = endDate ? txDate <= endDate : true;
      return matchType && matchStart && matchEnd;
    })
    .sort((a, b) => sortAsc ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt));

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
                Bienvenue, <span className="user-name">{data.firstname} {data.lastname}</span>
             </div>
             <div className="bper-top-icons">
                <div className="bper-square-icon"><Filter size={20} onClick={() => {}} /></div>
                <div className="bper-square-icon profile-btn" onClick={() => setActiveTab('profile')}>👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                
                {/* SECTION SOLDE (Image 4 & 5) */}
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                    <div className="bper-iban-row">
                        <span>{data.iban}</span>
                        <Copy size={14} onClick={() => navigator.clipboard.writeText(data.iban)} style={{cursor:'pointer'}}/>
                    </div>
                  </div>
                  
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => navigate("/virement-international")}><Send size={16}/> Virement</button>
                    <button className="bper-pill-green active"><PlusCircle size={16}/> Ajouter</button>
                    <button className="bper-pill-green"><Receipt size={16}/> Paiement</button>
                  </div>
                </section>

                {/* SECTION HISTORIQUE (Style Image 5) */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green">
                    <span className="bper-menu-symbol-green">≡</span> 
                    <h3>Historique des transactions</h3>
                  </div>

                  <div className="bper-transactions-list-desktop">
                    {filteredTransactions.map((tx, i) => (
                      <div key={tx._id || i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           <div className="bper-tr-circle-green">
                              {tx.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a"/> : <Send size={18}/>}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tx.label}</p>
                             <p className="bper-tr-date">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div className="bper-tr-right">
                          {/* BADGE CRÉDIT/DÉBIT EXACTEMENT COMME SUR L'IMAGE WHATSAPP */}
                          <span className="bper-type-badge-whatsapp">{tx.type === "CREDIT" ? "Crédit" : "Débit"}</span>
                          <div className={`bper-amount-val ${tx.type === "CREDIT" ? "plus" : "minus"}`}>
                            {tx.type === "CREDIT" ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* SECTION GRAPHES (En bas) */}
                <section className="bper-history-block-white">
                   <h4 style={{color:'#0b5c5b', marginBottom:'20px'}}>Analyse des flux</h4>
                   <div style={{height: '300px'}}>
                      <Bar 
                        data={{
                            labels: [...new Set(filteredTransactions.map(t => new Date(t.createdAt).toLocaleDateString()))].reverse(),
                            datasets: [{
                                label: 'Transactions',
                                data: filteredTransactions.map(t => t.amount),
                                backgroundColor: '#0b5c5b'
                            }]
                        }} 
                        options={{ maintainAspectRatio: false }} 
                      />
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

  // --- RENDU MOBILE (STRICTEMENT INCHANGÉ) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && <BankCard card={card} />}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav />
    </div>
  );
}