import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter } from "lucide-react";

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
import Financing from "./Financing"

import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

// Composant pour les lignes de détails (Style Pro)
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
  
  // Filtres (Initialisés comme dans Accounts.jsx)
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
      .catch(() => { localStorage.removeItem("token"); navigate("/login"); });
  }, [navigate]);

  if (!data) return null;

  // --- LOGIQUE FILTRAGE & LIMITATION À 6 ---
  const allTx = data.transactions || [];
  const filteredTx = allTx.filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filterType === "all" || (filterType === "entrants" && tx.type === "CREDIT") || (filterType === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });

  // On garde seulement les 6 dernières
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
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon">👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                
                {/* CARTE SOLDE */}
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

                {/* HISTORIQUE */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> 
                      <h3>Historique des transactions</h3>
                    </div>
                    {/* ICONE FILTRE A DROITE */}
                    <button className="filter-btn" onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b5c5b' }}>
                      <Filter size={20}/>
                    </button>
                  </div>

                  {/* PANEL FILTRE BIEN A DROITE */}
                  {showFilters && (
                    <div className="desktop-filters-panel" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px', background: '#f8fafc', marginBottom: '10px', borderRadius: '10px' }}>
                      <div className="date-field"><label style={{fontSize: '11px', marginRight: '5px'}}>Du</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
                      <div className="date-field"><label style={{fontSize: '11px', marginRight: '5px'}}>Au</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
                      <select onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="entrants">Entrées</option>
                        <option value="sortants">Sorties</option>
                      </select>
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {displayTx.map((tr, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           {/* SEUL L'ICÔNE DÉCLENCHE LES DÉTAILS */}
                           <div className="bper-tr-circle-green" onClick={() => setSelectedTx(tr)} style={{ cursor: 'pointer' }}>
                              {tr.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{new Date(tr.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <span className="bper-type-badge-simple" style={{ fontSize: '10px', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                            {tr.type === "CREDIT" ? "Crédit" : "Débit"}
                          </span>
                          <div className={`bper-tr-value-whatsapp ${tr.type === 'CREDIT' ? 'plus' : 'minus'}`} style={{ fontWeight: 'bold', color: tr.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>
                            {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* GRAPHES */}
                <div className="bper-desktop-charts-container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '300px' }}>
                    <h4 style={{ color: '#0b5c5b', marginBottom: '10px' }}>Crédit / Débit</h4>
                    <div style={{ height: '200px' }}><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '300px' }}>
                    <h4 style={{ color: '#0b5c5b', marginBottom: '10px' }}>Évolution Solde</h4>
                    <div style={{ height: '200px' }}><Line data={lineData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* --- MODAL DÉTAILS (EXACTEMENT COMME ACCOUNTS.JSX) --- */}
        {selectedTx && (
          <div className="bper-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="bper-modal-content" style={{ backgroundColor: 'white', width: '500px', borderRadius: '25px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h2 style={{ color: '#0b5c5b', fontSize: '18px' }}>Détails de l'opération</h2>
                <button onClick={() => setSelectedTx(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <p style={{ color: '#64748b', marginTop: '8px' }}>{selectedTx.label}</p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
                <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                <DetailRow label="Date de valeur" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                <DetailRow label="Type de paiement" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
                <DetailRow label="Référence interne" value={selectedTx._id?.toUpperCase()} />
                <DetailRow 
                  label="Description BPER" 
                  value={selectedTx.type === 'CREDIT' 
                    ? `Transaction de crédit autorisée par le service central. Identifiant : ${selectedTx._id?.slice(-8)}`
                    : `Ordre de virement débité. Référence mandat : ${selectedTx._id?.slice(-8)}`
                  } 
                />
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
      <div className="page-content">
  {/* Affiche les comptes */}
  {activeTab === "accounts" && <Accounts data={data}/>}

  {/* Affiche la carte bancaire si l'onglet est "cards" */}
  {activeTab === "cards" && (
    <div style={{ padding: "20px" }}>
      {/* On passe la première carte de la liste si elle existe */}
      {data.cards && data.cards.length > 0 ? (
        <BankCard card={data.cards[0]} />
      ) : (
        <p>Aucune carte disponible</p>
      )}
    </div>
  )}

  {/* Affiche le financement */}
  {activeTab === "financing" && <Financing />}
</div>
      <BottomNav />
    </div>
  );
}