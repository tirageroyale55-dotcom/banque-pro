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
import Financing from "./Financing"; // Assure-toi que le fichier existe

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
    // On récupère le dashboard + les transactions + la carte
    Promise.all([
      api("/client/dashboard"),
      api("/transactions"),
      api("/client/card").catch(() => null) // On évite de planter si pas de carte
    ])
    .then(([dashboardData, transactionsData, cardData]) => {
      setData({
        ...dashboardData,
        transactions: transactionsData.transactions || transactionsData,
        card: cardData
      });
    })
    .catch(() => { 
      localStorage.removeItem("token"); 
      navigate("/login"); 
    });
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

  // VERSION DESKTOP
  if (isDesktop) {
    return (
      <div className="bank-app bper-desktop-interface">
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>Cartes</div>
            <div className={`nav-item ${activeTab === 'financing' ? 'active' : ''}`} onClick={() => setActiveTab('financing')}>Financement</div>
            <div className="nav-item">Produits</div>
            <div className="nav-item">Aide</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon" onClick={() => setActiveTab('profile')}>👤</div>
             </div>
          </header>

          <div className="bper-scroll-zone">
            {/* VUE COMPTE */}
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                  </div>
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>Voir mon IBAN</button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Effectuer un virement</button>
                    <button className="bper-pill-green">Ma carte virtuelle</button>
                  </div>
                </section>

                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> 
                      <h3>Historique récent</h3>
                    </div>
                    <button className="filter-btn" onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b5c5b' }}>
                      <Filter size={20}/>
                    </button>
                  </div>

                  {showFilters && (
                    <div className="desktop-filters-panel" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px', background: '#f8fafc', marginBottom: '10px', borderRadius: '10px' }}>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
                           <div className="bper-tr-circle-green" onClick={() => setSelectedTx(tr)} style={{ cursor: 'pointer' }}>
                              {tr.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div className={`bper-tr-value-whatsapp ${tr.type === 'CREDIT' ? 'plus' : 'minus'}`}>
                          {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="bper-desktop-charts-container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px' }}>
                    <Bar data={barData} options={{ maintainAspectRatio: false }} />
                  </div>
                  <div className="bper-chart-small" style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px' }}>
                    <Line data={lineData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            )}

            {/* VUE CARTES DESKTOP */}
            {activeTab === "cards" && (
              <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ color: '#0b5c5b', marginBottom: '30px' }}>Ma Carte Bancaire</h2>
                <BankCard card={data.card} />
              </div>
            )}

            {/* VUE FINANCEMENT DESKTOP */}
            {activeTab === "financing" && <Financing />}
          </div>
        </main>

        {/* MODAL TRANSACTION */}
        {selectedTx && (
          <div className="bper-modal-overlay" onClick={() => setSelectedTx(null)}>
            <div className="bper-modal-content" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ color: '#0b5c5b', fontSize: '18px' }}>Opération</h2>
                <button onClick={() => setSelectedTx(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{selectedTx.amount.toLocaleString()} €</div>
                <p>{selectedTx.label}</p>
              </div>
              <DetailRow label="Statut" value="Validé" color="#16a34a" />
              <DetailRow label="Date" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
              <DetailRow label="Référence" value={selectedTx._id?.toUpperCase()} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // VERSION MOBILE
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data}/>}
        
        {activeTab === "cards" && (
          <div className="cards-section" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Mes Cartes</h3>
            <BankCard card={data.card} />
          </div>
        )}
        
        {activeTab === "financing" && <Financing />}
      </div>
      
      <BottomNav />
    </div>
  );
}