import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, Receipt, ChevronDown } from "lucide-react";

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
  const [showIban, setShowIban] = useState(false);
  
  // Logique de filtrage (récupérée de Accounts.jsx)
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");

  const navigate = useNavigate();

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

  // --- FILTRAGE DES TRANSACTIONS ---
  const filteredTransactions = (data.transactions || []).filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filterType === "all" || (filterType === "entrants" && tx.type === "CREDIT") || (filterType === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });

  // --- LOGIQUE DES GRAPHIQUES ---
  const grouped = {};
  filteredTransactions.forEach(tx => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });

  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));
  
  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a", borderRadius: 5 },
      { label: "Sorties", data: dates.map(d => grouped[d].out), backgroundColor: "#dc2626", borderRadius: 5 }
    ]
  };

  const lineData = {
    labels: dates,
    datasets: [{
      label: "Solde",
      data: dates.map((_, i) => dates.slice(0, i+1).reduce((acc, d) => acc + (grouped[d].in - grouped[d].out), 0)),
      borderColor: "#0b5c5b",
      backgroundColor: "rgba(11, 92, 91, 0.1)",
      fill: true,
      tension: 0.4
    }]
  };

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
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon" onClick={() => setShowFilters(!showFilters)}><Filter size={18} /></div>
                <div className="bper-square-icon">👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                
                {/* CARTE SOLDE (Inchangée) */}
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                  </div>
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>Voir mon IBAN</button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Effectuer un virement</button>
                    <button className="bper-pill-green">Voir ma carte virtuelle</button>
                  </div>
                </section>

                {/* HISTORIQUE AVEC FILTRE */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> 
                      <h3>Historique des transactions</h3>
                    </div>
                    <button className="filter-trigger" onClick={() => setShowFilters(!showFilters)}>
                      <Filter size={16} /> Filtrer par date
                    </button>
                  </div>

                  {showFilters && (
                    <div className="desktop-filters-panel">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                      <select onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="entrants">Crédits</option>
                        <option value="sortants">Débits</option>
                      </select>
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {filteredTransactions.map((tr, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           <div className="bper-tr-circle-green">{tr.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}</div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{new Date(tr.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div className="bper-tr-right-aligned">
                          <span className="bper-type-inline">{tr.type === "CREDIT" ? "Crédit" : "Débit"}</span>
                          <div className={`bper-tr-value-whatsapp ${tr.type === 'CREDIT' ? 'plus' : 'minus'}`}>
                            {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* GRAPHIQUES PROPORTIONNÉS */}
                <div className="bper-desktop-charts-container">
                  <div className="bper-chart-small">
                    <h4>Flux Mensuels</h4>
                    <div className="chart-wrapper"><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                  <div className="bper-chart-small">
                    <h4>Évolution Solde</h4>
                    <div className="chart-wrapper"><Line data={lineData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                </div>

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
      <div className="page-content">{activeTab === "accounts" && <Accounts data={data}/>}</div>
      <BottomNav />
    </div>
  );
}