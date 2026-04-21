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
      .catch(() => { localStorage.removeItem("token"); navigate("/login"); });
  }, [navigate]);

  if (!data) return null;

  // --- LOGIQUE FILTRAGE (POUR GRAPHIQUES ET DESKTOP) ---
  const allTx = data.transactions || [];
  const filteredTx = allTx.filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filterType === "all" || (filterType === "entrants" && tx.type === "CREDIT") || (filterType === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });

  const displayTx6 = filteredTx.slice(0, 6); // Limite à 6 pour le desktop

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
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>Cartes</div>
            <div className="nav-item">Payer</div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profil</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span></div>
             <div className="bper-top-icons">
                <div className="bper-square-icon" onClick={() => setActiveTab('profile')} style={{cursor:'pointer'}}>👤</div>
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

                <section className="bper-history-block-white">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="bper-menu-symbol-green">≡</span> <h3>Dernières transactions</h3>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b5c5b' }}>
                      <Filter size={20}/>
                    </button>
                  </div>

                  {showFilters && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '10px', marginBottom: '10px' }}>
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
                    {displayTx6.map((tr, i) => (
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
                        <div className={`bper-tr-value-whatsapp ${tr.type === 'CREDIT' ? 'plus' : 'minus'}`} style={{ fontWeight: 'bold', color: tr.type === 'CREDIT' ? '#16a34a' : '#dc2626' }}>
                          {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '300px' }}>
                    <Bar data={barData} options={{ maintainAspectRatio: false }} />
                  </div>
                  <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '20px', height: '300px' }}>
                    <Line data={lineData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            )}
            {activeTab === "cards" && <BankCard />}
            {activeTab === "profile" && <Profile data={data} />}
          </div>
        </main>

        {/* MODAL DÉTAILS */}
        {selectedTx && (
          <div className="bper-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="bper-modal-content" style={{ backgroundColor: 'white', width: '450px', borderRadius: '20px', padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h3 style={{fontSize:'16px'}}>Détails de l'opération</h3>
                <button onClick={() => setSelectedTx(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize:'18px' }}>✕</button>
              </div>
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <p style={{ color: '#64748b' }}>{selectedTx.label}</p>
              </div>
              <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
              <DetailRow label="Date" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
              <DetailRow label="Référence" value={selectedTx._id?.toUpperCase()} />
              <DetailRow label="Description BPER" value={selectedTx.type === 'CREDIT' ? "Virement reçu" : "Virement émis"} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDU MOBILE (INCHANGÉ, FONCTIONNE AVEC TABS) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && <BankCard />}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}