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

  // Logique filtrage Desktop
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
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profil</div>
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
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                {/* CARTE SOLDE DESKTOP */}
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                    {showIban && (
                      <div className="iban-box" style={{marginTop: '10px', background: '#f1f5f9', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center'}}>
                        <span style={{fontWeight: 'bold'}}>{data.iban}</span>
                        <Copy size={16} style={{cursor: 'pointer'}} onClick={() => {navigator.clipboard.writeText(data.iban); alert("IBAN copié !")}}/>
                      </div>
                    )}
                  </div>
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>{showIban ? "Masquer l'IBAN" : "Voir mon IBAN"}</button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Effectuer un virement</button>
                  </div>
                </section>

                {/* HISTORIQUE DESKTOP */}
                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><h3>Historique (6 dernières)</h3></div>
                    <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Filter size={20} color="#0b5c5b"/></button>
                  </div>

                  {showFilters && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '10px' }}>
                      <input type="date" onChange={(e) => setStartDate(e.target.value)} />
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
                           <div onClick={() => setSelectedTx(tr)} style={{ cursor: 'pointer' }}>
                              {tr.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a" /> : <Send size={18} />}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{new Date(tr.createdAt).toLocaleDateString('fr-FR')}</p>
                           </div>
                        </div>
                        <div className={`bper-tr-value-whatsapp ${tr.type === 'CREDIT' ? 'plus' : 'minus'}`} style={{fontWeight:'bold', color: tr.type === 'CREDIT' ? '#16a34a' : '#dc2626'}}>
                          {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
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

        {/* OVERLAY DÉTAILS PRO DESKTOP */}
        {selectedTx && (
          <div className="bper-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="bper-modal-content" style={{ backgroundColor: 'white', width: '500px', borderRadius: '25px', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h2 style={{ fontSize: '18px' }}>Détails de l'opération</h2>
                <button onClick={() => setSelectedTx(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <p style={{ color: '#64748b' }}>{selectedTx.label}</p>
              </div>
              <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
              <DetailRow label="Date" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
              <DetailRow label="Référence interne" value={selectedTx._id?.toUpperCase()} />
              <DetailRow label="Description BPER" value={`Transaction ${selectedTx.type === 'CREDIT' ? 'crédit' : 'débit'} autorisée. ID : ${selectedTx._id?.slice(-8)}`} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDU MOBILE (PROTECTION TOTALE DU CODE ORIGINAL) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      {/* Correction : On passe bien les props pour que Tabs change l'état */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="page-content" style={{ paddingBottom: '80px' }}>
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && <BankCard />}
        {/* Ajout du support pour les autres onglets s'ils existent */}
        {activeTab === "profile" && <Profile data={data} />}
      </div>

      <BottomNav setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
}