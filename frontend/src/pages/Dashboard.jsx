import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, Copy, Landmark, CreditCard, Wallet } from "lucide-react";

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

  // Filtrage pour Desktop (6 dernières transactions)
  const allTx = data.transactions || [];
  const filteredTx = allTx.filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filterType === "all" || (filterType === "entrants" && tx.type === "CREDIT") || (filterType === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });
  const displayTx = filteredTx.slice(0, 6);

  // Graphes
  const grouped = {};
  filteredTx.forEach(tx => {
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
      borderColor: "#0b5c5b",
      tension: 0.4,
      fill: true,
      backgroundColor: "rgba(11, 92, 91, 0.05)"
    }]
  };

  // --- RENDU DESKTOP ---
  if (isDesktop) {
    return (
      <div className="bank-app bper-desktop-interface">
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>Mes Cartes</div>
            <div className={`nav-item ${activeTab === 'financing' ? 'active' : ''}`} onClick={() => setActiveTab('financing')}>Financement</div>
            <div className="nav-item" onClick={() => setActiveTab('profile')}>Profil</div>
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
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                    
                    {/* BOUTON IBAN RESTAURÉ SUR DESKTOP */}
                    {showIban && (
                      <div className="iban-display-pro" style={{marginTop: '15px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px dashed #0b5c5b', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center'}}>
                        <span style={{fontFamily: 'monospace', fontWeight: 'bold', fontSize: '16px'}}>{data.iban}</span>
                        <Copy size={18} style={{cursor: 'pointer', color: '#0b5c5b'}} onClick={() => {navigator.clipboard.writeText(data.iban); alert("IBAN copié !")}}/>
                      </div>
                    )}
                  </div>
                  
                  {/* BOUTONS ACTIONS DESKTOP RESTAURÉS */}
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>{showIban ? "Masquer IBAN" : "Voir mon IBAN"}</button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Effectuer un virement</button>
                    <button className="bper-pill-green">Voir ma carte virtuelle</button>
                  </div>
                </section>

                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> 
                      <h3>Historique des transactions</h3>
                    </div>
                    {/* FILTRE À DROITE */}
                    <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Filter size={22} color="#0b5c5b"/>
                    </button>
                  </div>

                  {showFilters && (
                    <div className="desktop-filters-panel" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', padding: '15px', background: '#f8fafc', marginBottom: '10px', borderRadius: '10px' }}>
                      <div className="date-field"><label>Du </label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                      <div className="date-field"><label>Au </label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                      <select onChange={(e) => setFilterType(e.target.value)} style={{padding: '5px', borderRadius: '5px'}}>
                        <option value="all">Toutes les opérations</option>
                        <option value="entrants">Crédits (Entrées)</option>
                        <option value="sortants">Débits (Sorties)</option>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <span className="bper-type-badge" style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                            {tr.type === "CREDIT" ? "CRÉDIT" : "DÉBIT"}
                          </span>
                          <div style={{ fontWeight: 'bold', color: tr.type === 'CREDIT' ? '#16a34a' : '#dc2626', width: '100px', textAlign: 'right' }}>
                            {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="bper-desktop-charts-container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '25px', height: '320px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#0b5c5b', marginBottom: '15px' }}>Analyse des flux</h4>
                    <div style={{ height: '220px' }}><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '25px', height: '320px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h4 style={{ color: '#0b5c5b', marginBottom: '15px' }}>Évolution du solde</h4>
                    <div style={{ height: '220px' }}><Line data={lineData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                </div>
              </div>
            )}

            {/* VUES CARTES ET FINANCEMENT DESKTOP */}
            {activeTab === "cards" && (
              <div style={{padding: '20px'}}><h3 style={{color: '#0b5c5b'}}>Mes Cartes</h3><BankCard /></div>
            )}
            {activeTab === "financing" && (
              <div style={{padding: '20px'}}><div className="account-card"><h3>Financements</h3><p>Aucun financement disponible pour le moment.</p></div></div>
            )}
            {activeTab === "profile" && <Profile data={data} />}
          </div>
        </main>

        {/* MODAL DÉTAILS PRO */}
        {selectedTx && (
          <div className="bper-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="bper-modal-content" style={{ backgroundColor: 'white', width: '550px', borderRadius: '30px', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ color: '#0b5c5b', fontSize: '20px' }}>Détails de l'opération</h2>
                <button onClick={() => setSelectedTx(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
              </div>
              <div style={{ textAlign: 'center', margin: '30px 0' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <p style={{ color: '#64748b', fontSize: '18px', marginTop: '10px' }}>{selectedTx.label}</p>
              </div>
              <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
              <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
              <DetailRow label="Date de valeur" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
              <DetailRow label="Référence interne" value={selectedTx._id?.toUpperCase()} />
              <DetailRow label="Description BPER" value={selectedTx.type === 'CREDIT' ? `Virement reçu - ID ${selectedTx._id?.slice(-8)}` : `Prélèvement autorisé - Réf ${selectedTx._id?.slice(-8)}`} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDU MOBILE (RESTAURATION COMPLÈTE DE TES PAGES) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data} />}
        
        {/* TA SECTION CARTES MOBILE RESTAURÉE */}
        {activeTab === "cards" && (
          <div className="cards-section">
            <h3 className="cards-title">Mes cartes</h3>
            <div className="cards-slider">
              <div className="cards-slide">
                <BankCard />
              </div>
              <div className="cards-slide card-request" onClick={() => navigate("/request-card")}>
                <div className="card-request-inner">
                  <div className="card-plus">+</div>
                  <p>Demander une carte</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TA SECTION FINANCEMENT MOBILE RESTAURÉE */}
        {activeTab === "financing" && (
          <div className="content">
            <div className="account-card">
              <h3>Financements</h3>
              <p>Aucun financement disponible</p>
            </div>
          </div>
        )}

        {activeTab === "profile" && <Profile data={data} />}
      </div>

      <BottomNav setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
}