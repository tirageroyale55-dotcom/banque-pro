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
import BankCard from "../components/BankCard";
import Profile from "./Profile";

import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

// Détails Style Pro
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
  
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("all");

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
        api("/transactions")
          .then((transactionsData) => {
            setData(prev => ({ ...prev, transactions: transactionsData.transactions || transactionsData }));
          });
      })
      .catch(() => { navigate("/login"); });
  }, [navigate]);

  if (!data) return null;

  // Filtrage
  const allTx = data.transactions || [];
  const filteredTx = allTx.filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filterType === "all" || (filterType === "entrants" && tx.type === "CREDIT") || (filterType === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });

  const displayTx = filteredTx.slice(0, 6);

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
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profil</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstname} {data.lastname}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon" onClick={() => setActiveTab('profile')}>👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                {/* CARD SOLDE DESKTOP AVEC TOUS LES BOUTONS */}
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                    
                    {showIban && (
                      <div className="iban-display-pro" style={{marginTop: '15px', background: '#f8fafc', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', justifyContent: 'center'}}>
                        <span style={{fontWeight: '600', letterSpacing: '1px'}}>{data.iban}</span>
                        <Copy size={16} color="#0b5c5b" style={{cursor: 'pointer'}} onClick={() => {navigator.clipboard.writeText(data.iban); alert("IBAN copié !")}}/>
                      </div>
                    )}
                  </div>

                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>
                      {showIban ? "Masquer l'IBAN" : "Voir mon IBAN"}
                    </button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>
                      Effectuer un virement
                    </button>
                    <button className="bper-pill-green">Voir ma carte virtuelle</button>
                  </div>
                </section>

                {/* HISTORIQUE AVEC FILTRE À DROITE */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> 
                      <h3>Historique des transactions</h3>
                    </div>
                    <button className="filter-btn" onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Filter size={20} color="#0b5c5b"/>
                    </button>
                  </div>

                  {showFilters && (
                    <div className="desktop-filters-panel" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '15px', background: '#f8fafc', marginBottom: '10px', borderRadius: '12px', border: '1px solid #eee' }}>
                      <div style={{display:'flex', alignItems:'center', gap:'5px'}}><label style={{fontSize:'12px'}}>Du</label><input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></div>
                      <div style={{display:'flex', alignItems:'center', gap:'5px'}}><label style={{fontSize:'12px'}}>Au</label><input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} /></div>
                      <select onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="entrants">Crédits</option>
                        <option value="sortants">Débits</option>
                      </select>
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {displayTx.map((tr, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           <div className="bper-tr-circle-green" onClick={() => setSelectedTx(tr)} style={{ cursor: 'pointer' }}>
                              {tr.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{new Date(tr.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                          <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', color: '#64748b' }}>
                            {tr.type === "CREDIT" ? "Crédit" : "Débit"}
                          </span>
                          <div style={{ fontWeight: '700', color: tr.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>
                            {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
            {activeTab === "profile" && <Profile data={data} />}
          </div>
        </main>

        {/* MODAL DÉTAILS PRO */}
        {selectedTx && (
          <div className="bper-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="bper-modal-content" style={{ backgroundColor: 'white', width: '450px', borderRadius: '25px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                <h3 style={{ color: '#0b5c5b' }}>Détails de l'opération</h3>
                <button onClick={() => setSelectedTx(null)} style={{ border: 'none', background: 'none', fontSize: '22px', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ textAlign: 'center', margin: '25px 0' }}>
                <div style={{ fontSize: '34px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <p style={{ color: '#64748b', marginTop: '5px' }}>{selectedTx.label}</p>
              </div>
              <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
              <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
              <DetailRow label="Type" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
              <DetailRow label="Référence BPER" value={selectedTx._id?.toUpperCase()} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDU MOBILE RESTAURÉ (UTILISE TES COMPOSANTS TABS ET ACCOUNTS) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && <BankCard />}
        {activeTab === "financing" && <div style={{padding:'20px'}}>Page Financement en cours...</div>}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
}