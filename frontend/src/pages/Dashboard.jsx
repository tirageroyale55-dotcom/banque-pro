import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, Copy } from "lucide-react";

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

// Ligne de détail style BPER
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
  
  // Filtres (Logique Accounts.jsx)
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState("all");
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
    }).catch(() => navigate("/login"));
  }, [navigate]);

  if (!data) return null;

  // Filtrage intelligent
  const transactions = (data.transactions || []).filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filter === "all" || (filter === "entrants" && tx.type === "CREDIT") || (filter === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });

  // Graphes (Basés sur les transactions filtrées)
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

  const lineData = {
    labels: dates,
    datasets: [{
      label: "Solde",
      data: dates.map((_, i) => dates.slice(0, i+1).reduce((acc, d) => acc + (grouped[d].in - grouped[d].out), 0)),
      borderColor: "#2563eb",
      tension: 0.3,
      fill: false
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
            <div className="nav-item">Virement</div>
            <div className="nav-item">Profil</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstname} {data.lastname}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon" onClick={() => setShowFilters(!showFilters)} style={{ cursor: 'pointer' }}><Filter size={20} /></div>
                <div className="bper-square-icon">👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                
                {/* SOLDE */}
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

                {/* HISTORIQUE (LIMITE 5 + FILTRES) */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <span className="bper-menu-symbol-green">≡</span> 
                       <h3>Dernières transactions</h3>
                    </div>
                  </div>

                  {showFilters && (
                    <div className="filters-panel-desktop" style={{ display: 'flex', gap: '10px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '15px' }}>
                      <select onChange={(e)=>setFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <option value="all">Toutes</option>
                        <option value="entrants">Entrées</option>
                        <option value="sortants">Sorties</option>
                      </select>
                      <input type="date" onChange={(e)=>setStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
                      <input type="date" onChange={(e)=>setEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {transactions.slice(0, 5).map((tx, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           {/* ICON CLIC -> DETAILS */}
                           <div onClick={() => setSelectedTx(tx)} className="bper-tr-circle-green" style={{ cursor: 'pointer' }}>
                              {tx.type === "CREDIT" ? <PlusCircle size={20} color="#16a34a" /> : <Send size={20} />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tx.label}</p>
                             <p className="bper-tr-date">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{tx.type === 'CREDIT' ? 'Crédit' : 'Débit'}</span>
                          <div className={`amount ${tx.type === 'CREDIT' ? 'plus' : 'minus'}`} style={{ fontWeight: 'bold', color: tx.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>
                            {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* GRAPHES (HORIZONTAUX & ÉQUILIBRÉS) */}
                <div className="bper-charts-container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <div className="bper-chart-card" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '280px' }}>
                    <h4 style={{ color: '#0b5c5b', fontSize: '14px', marginBottom: '10px' }}>Flux Entrées/Sorties</h4>
                    <div style={{ height: '180px' }}><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                  <div className="bper-chart-card" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '280px' }}>
                    <h4 style={{ color: '#0b5c5b', fontSize: '14px', marginBottom: '10px' }}>Évolution du Solde</h4>
                    <div style={{ height: '180px' }}><Line data={lineData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>

        {/* OVERLAY DÉTAILS PRO */}
        {selectedTx && (
          <div className="bper-detail-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', width: '450px', borderRadius: '24px', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ color: '#0b5c5b' }}>Détails de l'opération</h3>
                  <button onClick={() => setSelectedTx(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
               </div>
               
               <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                    {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                  </div>
                  <p style={{ color: '#64748b' }}>{selectedTx.label}</p>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
                  <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                  <DetailRow label="Type de paiement" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
                  <DetailRow label="Référence interne" value={selectedTx._id.toUpperCase()} />
                  <DetailRow label="Description BPER" value={selectedTx.type === 'CREDIT' ? "Transfert créditeur autorisé" : "Prélèvement de service"} />
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Rendu Mobile (Inchangé pour garder la stabilité)
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">{activeTab === "accounts" && <Accounts data={data}/>}</div>
      <BottomNav />
    </div>
  );
}