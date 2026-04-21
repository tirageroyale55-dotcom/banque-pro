import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, ChevronLeft } from "lucide-react";

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
import BankCard from "../components/BankCard";
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
  
  // LOGIQUE FILTRE (Accounts.jsx)
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filter, setFilter] = useState("all");

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
      api("/transactions").then((transactionsData) => {
        setData(prev => ({ ...prev, transactions: transactionsData.transactions || transactionsData }));
      });
    }).catch(() => { localStorage.removeItem("token"); navigate("/login"); });
  }, [navigate]);

  if (!data) return null;

  // --- TRAITEMENT DES TRANSACTIONS (Filtre + Limite 6) ---
  const rawTransactions = data.transactions || [];
  const transactions = rawTransactions
    .filter(tx => {
      const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
      const matchType = filter === "all" || (filter === "entrants" && tx.type === "CREDIT") || (filter === "sortants" && tx.type === "DEBIT");
      const matchStart = startDate ? txDate >= startDate : true;
      const matchEnd = endDate ? txDate <= endDate : true;
      return matchType && matchStart && matchEnd;
    })
    .slice(0, 6); // Affiche seulement les 6 dernières

  // Données graphiques
  const grouped = {};
  transactions.forEach(tx => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });
  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));

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
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>Voir mon IBAN</button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Virement</button>
                  </div>
                </section>

                {/* HISTORIQUE AVEC PANEL FILTRE À DROITE */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> 
                      <h3>Historique (6 dernières)</h3>
                    </div>
                    <button className="filter-btn" onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b5c5b' }}>
                      <Filter size={20} />
                    </button>
                  </div>

                  {showFilters && (
                    <div className="filters-panel" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '10px', marginBottom: '15px' }}>
                      <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                      <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                      <select onChange={(e)=>setFilter(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="entrants">Crédits</option>
                        <option value="sortants">Débits</option>
                      </select>
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {transactions.map((tx, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           {/* DÉCLENCHEUR DÉTAILS SUR L'ICÔNE UNIQUEMENT */}
                           <div onClick={() => setSelectedTx(tx)} style={{ cursor: 'pointer', marginRight: '15px' }}>
                              {tx.type === "CREDIT" ? <PlusCircle size={22} color="#16a34a" /> : <Send size={22} color="#0b5c5b" />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tx.label}</p>
                             <p className="bper-tr-date">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', display: 'block', color: '#94a3b8' }}>{tx.type === "CREDIT" ? "Crédit" : "Débit"}</span>
                          <span style={{ fontWeight: 'bold', color: tx.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>
                            {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '280px' }}>
                    <Bar data={{ labels: dates, datasets: [{ label: "Flux", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a" }] }} options={{ maintainAspectRatio: false }} />
                  </div>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '280px' }}>
                    <Line data={{ labels: dates, datasets: [{ label: "Solde", data: dates.map((_, i) => dates.slice(0, i+1).reduce((acc, d) => acc + (grouped[d].in - grouped[d].out), 0)), borderColor: "#0b5c5b" }] }} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* OVERLAY DÉTAILS (PAGE COMPLÈTE) */}
        {selectedTx && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <button onClick={() => setSelectedTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#0b5c5b', fontWeight: 'bold' }}>
                <ChevronLeft size={24} /> Retour
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '18px', color: '#0b5c5b' }}>Détails de l'opération</div>
            </div>
            <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <div style={{ color: '#64748b', fontSize: '16px', marginTop: '10px' }}>{selectedTx.label}</div>
              </div>
              <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
              <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
              <DetailRow label="Type de paiement" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
              <DetailRow label="Référence interne" value={selectedTx._id.toUpperCase()} />
              <DetailRow label="Description BPER" value={selectedTx.type === 'CREDIT' ? `Transaction de crédit autorisée. ID : ${selectedTx._id.slice(-8)}` : `Ordre de virement débité. Réf : ${selectedTx._id.slice(-8)}`} />
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