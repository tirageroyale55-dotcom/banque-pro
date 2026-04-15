import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, Receipt, X } from "lucide-react";

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

// Composant pour les lignes de détails (Récupéré de Accounts.jsx)
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
  const [selectedTx, setSelectedTx] = useState(null); // État pour la transaction sélectionnée
  
  // Logique de filtrage
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
    api("/client/dashboard").then((clientData) => {
        setData(clientData);
        api("/transactions").then((transactionsData) => {
            setData(prev => ({ ...prev, transactions: transactionsData.transactions || transactionsData }));
        });
    }).catch(() => navigate("/login"));
  }, [navigate]);

  if (!data) return null;

  const filteredTransactions = (data.transactions || []).filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filterType === "all" || (filterType === "entrants" && tx.type === "CREDIT") || (filterType === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });

  // --- LOGIQUE GRAPHIQUES ---
  const grouped = {};
  filteredTransactions.forEach(tx => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });
  const dates = Object.keys(grouped).sort();
  
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
                  <div className="bper-history-header-green">
                    <h3>Historique des transactions</h3>
                    <Filter size={16} style={{cursor:'pointer'}} onClick={() => setShowFilters(!showFilters)}/>
                  </div>

                  {showFilters && (
                    <div className="desktop-filters-panel">
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  )}

                  <div className="bper-transactions-table-green">
                    {filteredTransactions.map((tr, i) => (
                      <div key={i} className="bper-tr-item-green">
                        <div className="bper-tr-left">
                           {/* LE CLIC SUR L'ICÔNE OUVRE LES DÉTAILS */}
                           <div className="bper-tr-circle-green" onClick={() => setSelectedTx(tr)} style={{cursor: 'pointer'}}>
                              {tr.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}
                           </div>
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

                <div className="bper-desktop-charts-container">
                  <div className="bper-chart-small">
                    <h4>Flux Mensuels</h4>
                    <div className="chart-wrapper"><Bar data={barData} options={{ maintainAspectRatio: false }} /></div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>

        {/* OVERLAY DE DÉTAILS (Logique Accounts.jsx appliquée au Desktop) */}
        {selectedTx && (
          <div className="bper-details-overlay">
            <div className="bper-details-modal">
              <div className="bper-details-header">
                <button onClick={() => setSelectedTx(null)} className="close-btn"><X size={20} /> Fermer</button>
                <h4>Détails de l'opération</h4>
              </div>
              <div className="bper-details-body">
                <div className="bper-details-amount" style={{ color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <p className="bper-details-label">{selectedTx.label}</p>
                
                <div className="bper-details-grid">
                  <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
                  <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
                  <DetailRow label="Type" value={selectedTx.type === 'CREDIT' ? 'Virement reçu' : 'Virement émis'} />
                  <DetailRow label="Référence" value={selectedTx._id.toUpperCase()} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <div className="mobile-app"><Accounts data={data}/></div>;
}