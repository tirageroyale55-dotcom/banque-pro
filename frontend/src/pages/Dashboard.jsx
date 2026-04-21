import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, ChevronDown, X } from "lucide-react";
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

// Composant pour les lignes de détails (Fichage professionnel)
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
  const [selectedTx, setSelectedTx] = useState(null);
  
  // États du Panel Filtre (Identique à ton Accounts.jsx)
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortAsc, setSortAsc] = useState(false);

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
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transactions").then((txData) => {
          setData(prev => ({ ...prev, transactions: txData.transactions || txData }));
        });
      })
      .catch(() => { navigate("/login"); });
  }, [navigate]);

  if (!data) return null;

  // LOGIQUE DE FILTRAGE (Exactement comme dans ton fichier)
  const rawTransactions = data.transactions || [];
  const transactions = rawTransactions
    .filter(tx => {
      const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
      const matchType = filter === "all" || (filter === "entrants" && tx.type === "CREDIT") || (filter === "sortants" && tx.type === "DEBIT");
      const matchStart = startDate ? txDate >= startDate : true;
      const matchEnd = endDate ? txDate <= endDate : true;
      return matchType && matchStart && matchEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  // LOGIQUE GRAPHIQUES (Format réduit)
  const grouped = {};
  transactions.forEach(tx => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });
  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a" },
      { label: "Sorties", data: dates.map(d => grouped[d].out), backgroundColor: "#dc2626" }
    ]
  };

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
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon" onClick={() => setShowFilters(!showFilters)}><Filter size={18} /></div>
                <div className="bper-square-icon">👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                
                {/* 1. CARTE SOLDE (Inchangée) */}
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                  </div>
                </section>

                {/* 2. HISTORIQUE AVEC PANEL FILTRE */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> 
                      <h3>Historique des transactions</h3>
                    </div>
                    <button className="filter-btn-desktop" onClick={() => setShowFilters(!showFilters)}>
                       <Filter size={18} />
                    </button>
                  </div>

                  {/* PANEL FILTRE (Identique au tien) */}
                  {showFilters && (
                    <div className="filters-panel-desktop" style={{ display: 'flex', gap: '20px', padding: '20px', background: '#f8fafc', borderBottom: '1px solid #eee' }}>
                      <select onChange={(e)=>setFilter(e.target.value)} className="f-input">
                        <option value="all">Toutes</option>
                        <option value="entrants">Entrées</option>
                        <option value="sortants">Sorties</option>
                      </select>
                      <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="f-input" />
                      <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="f-input" />
                      <button onClick={()=>setSortAsc(!sortAsc)} className="f-btn">{sortAsc ? "↑" : "↓"} Tri</button>
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {transactions.map((tx, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           {/* CLIC SUR L'ICONE DÉCLENCHE LES DÉTAILS */}
                           <div className="bper-tr-circle-green" onClick={() => setSelectedTx(tx)} style={{ cursor: 'pointer' }}>
                              {tx.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tx.label}</p>
                             <p className="bper-tr-date">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div className="bper-tr-right-aligned">
                          <span className="bper-type-label-simple">{tx.type === "CREDIT" ? "Crédit" : "Débit"}</span>
                          <div className={`bper-tr-value-whatsapp ${tx.type === 'CREDIT' ? 'plus' : 'minus'}`} style={{ color: tx.type === 'CREDIT' ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                            {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. GRAPHIQUES RÉDUITS (HORIZONTAUX) */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <div className="bper-chart-card-small">
                    <h4 style={{ color: '#0b5c5b', fontSize: '13px', marginBottom: '10px' }}>Flux Entrants/Sortants</h4>
                    <div style={{ height: '180px' }}><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* --- PAGE DE DÉTAILS (OVERLAY DESKTOP) --- */}
        {selectedTx && (
          <div className="bper-detail-overlay">
            <div className="bper-detail-card">
              <div className="detail-header-pro">
                <button onClick={() => setSelectedTx(null)} className="back-btn-pro">← Retour</button>
                <div className="detail-title-pro">Détails de l'opération</div>
              </div>
              <div className="detail-body-pro">
                <div className="detail-amount-center">
                  <div className={selectedTx.type === 'CREDIT' ? 'a-plus' : 'a-minus'}>
                    {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                  </div>
                  <div className="a-label">{selectedTx.label}</div>
                </div>
                <div className="detail-grid-pro">
                  <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
                  <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                  <DetailRow label="Date de valeur" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                  <DetailRow label="Type de paiement" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
                  <DetailRow label="Référence interne" value={selectedTx._id.toUpperCase()} />
                  <DetailRow 
                    label="Description BPER" 
                    value={selectedTx.type === 'CREDIT' 
                      ? `Transaction créditrice autorisée. Identifiant : ${selectedTx._id.slice(-8)}`
                      : `Ordre de virement débité. Mandat : ${selectedTx._id.slice(-8)}`
                    } 
                  />
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