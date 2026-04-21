import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, ArrowUp, ArrowDown } from "lucide-react";

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
import BottomNav from "../components/BottomNav";
import Accounts from "./Accounts";
import Profile from "./Profile";

import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

function DetailRow({ label, value, color = '#1e293b' }) {
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: color, fontWeight: '500' }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [showIban, setShowIban] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null); 
  
  // Logique Filtres (Issue de Accounts.jsx)
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortAsc, setSortAsc] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const formatBper = (amount) => {
    return new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/client/dashboard").then((clientData) => {
      setData(clientData);
      api("/transactions").then((txData) => {
        setData(prev => ({ ...prev, transactions: txData.transactions || txData }));
      });
    }).catch(() => { navigate("/login"); });
  }, [navigate]);

  if (!data) return null;

  // Filtrage et Tri identique à Accounts.jsx
  const transactions = (data.transactions || [])
    .filter(tx => {
      const txDateString = new Date(tx.createdAt).toISOString().split("T")[0];
      const matchType = filter === "all" || (filter === "entrants" && tx.type === "CREDIT") || (filter === "sortants" && tx.type === "DEBIT");
      const matchStart = startDate ? txDateString >= startDate : true;
      const matchEnd = endDate ? txDateString <= endDate : true;
      return matchType && matchStart && matchEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  // Limiter à 6 pour l'affichage principal
  const displayTransactions = transactions.slice(0, 6);

  // Graphiques
  const grouped = {};
  transactions.forEach(tx => {
    const dKey = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    if (!grouped[dKey]) grouped[dKey] = { in: 0, out: 0 };
    tx.type === "CREDIT" ? grouped[dKey].in += tx.amount : grouped[dKey].out += Math.abs(tx.amount);
  });
  const dates = Object.keys(grouped).sort();

  if (isDesktop) {
    return (
      <div className="bank-app bper-desktop-interface">
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
             <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
             <div className="nav-item">Cartes</div>
             <div className="nav-item">Virements</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Bienvenue, <span>{data.firstName} {data.lastName}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon" onClick={() => setShowFilters(!showFilters)}><Filter size={18} /></div>
                <div className="bper-square-icon">👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                  </div>
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>IBAN</button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Virement</button>
                  </div>
                </section>

                <section className="bper-history-block-white">
                  <div className="bper-history-header-green">
                    <h3>Historique (6 dernières)</h3>
                    <button className="filter-btn-round" onClick={() => setShowFilters(!showFilters)}><Filter size={16}/></button>
                  </div>

                  {showFilters && (
                    <div className="filters-panel-desktop" style={{ display:'flex', gap:'10px', padding:'15px', background:'#f8fafc', borderRadius:'10px', marginBottom:'15px' }}>
                      <select onChange={(e)=>setFilter(e.target.value)} value={filter}>
                        <option value="all">Toutes</option>
                        <option value="entrants">Entrées</option>
                        <option value="sortants">Sorties</option>
                      </select>
                      <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                      <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                      <button onClick={()=>setSortAsc(!sortAsc)} className="sort-toggle">
                        {sortAsc ? <ArrowUp size={14}/> : <ArrowDown size={14}/>} Tri
                      </button>
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {displayTransactions.map((tx, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           <div className="bper-tr-circle-green" onClick={() => setSelectedTx(tx)} style={{ cursor: 'pointer' }}>
                              {tx.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tx.label}</p>
                             <p className="bper-tr-date">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <span className="bper-type-label-inline">{tx.type === "CREDIT" ? "Crédit" : "Débit"}</span>
                          <div className={`amount-text ${tx.type === 'CREDIT' ? 'plus' : 'minus'}`}>
                            {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="bper-desktop-charts-container">
                  <div className="bper-chart-small">
                    <Bar data={{ labels: dates, datasets: [{ label: "Entrées", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a" }, { label: "Sorties", data: dates.map(d => grouped[d].out), backgroundColor: "#dc2626" }] }} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* MODAL DÉTAILS (STYLE PRO BPER) */}
        {selectedTx && (
          <div className="bper-modal-overlay" onClick={() => setSelectedTx(null)}>
            <div className="bper-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Détails de l'opération</h2>
                <button onClick={() => setSelectedTx(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="amount-header">
                  <div className={`amount ${selectedTx.type === 'CREDIT' ? 'plus' : 'minus'}`}>
                    {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                  </div>
                  <p>{selectedTx.label}</p>
                </div>
                <div className="details-grid">
                  <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
                  <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                  <DetailRow label="Date de valeur" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                  <DetailRow label="Type de paiement" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
                  <DetailRow label="Référence interne" value={selectedTx._id.toUpperCase()} />
                  <DetailRow label="Description BPER" value={selectedTx.type === 'CREDIT' ? `Transaction de crédit autorisée. ID : ${selectedTx._id.slice(-8)}` : `Ordre de virement débité. Réf : ${selectedTx._id.slice(-8)}`} />
                </div>
              </div>
            </div>
          </div>
        )}
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