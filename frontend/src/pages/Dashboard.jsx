import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, Copy, Plus } from "lucide-react"; // Ajout de Plus

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
  Legend,
  Filler
} from "chart.js";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BottomNav from "../components/BottomNav";
import Accounts from "./Accounts";
import BankCard from "../components/BankCard";
import Profile from "./Profile";
import Financing from "./Financing";

import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

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
  const [card, setCard] = useState(null);
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
        api("/transactions").then((txData) => {
          setData(prev => ({ ...prev, transactions: txData.transactions || txData }));
        });
      })
      .catch(() => navigate("/login"));

    api("/client/card").then(setCard).catch(() => console.log("Erreur carte"));
  }, [navigate]);

  if (!data) return null;

  // Logique de filtrage pour les graphiques et la liste Desktop
  const transactions = data.transactions || [];
  const filteredTx = transactions.filter(tx => {
    const txDate = new Date(tx.createdAt).toISOString().split("T")[0];
    const matchType = filterType === "all" || (filterType === "entrants" && tx.type === "CREDIT") || (filterType === "sortants" && tx.type === "DEBIT");
    const matchStart = startDate ? txDate >= startDate : true;
    const matchEnd = endDate ? txDate <= endDate : true;
    return matchType && matchStart && matchEnd;
  });

  // Calcul des données graphiques (In/Out)
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
      label: "Évolution Solde",
      data: dates.map((_, i) => dates.slice(0, i+1).reduce((acc, d) => acc + (grouped[d].in - grouped[d].out), 0)),
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.1)",
      fill: true,
      tension: 0.4
    }]
  };

  if (isDesktop) {
    return (
      <div className="bank-app bper-desktop-interface">
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Mon Profil</div>
            <div className="nav-item">Mes Cartes</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Tableau de bord de <span className="user-name">{data.firstname} {data.lastname}</span></div>
             <div className="bper-top-icons" onClick={() => setActiveTab('profile')} style={{cursor:'pointer'}}>👤</div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-grid">
                
                {/* SECTION GAUCHE : SOLDE & CARTES */}
                <div className="bper-left-col">
                  <section className="bper-hero-card-white">
                    <div className="bper-balance-block">
                      <p className="bper-label-green">Solde total disponible</p>
                      <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                      {showIban && (
                        <div className="iban-box-desktop">
                          <span>{data.iban}</span>
                          <Copy size={14} onClick={() => {navigator.clipboard.writeText(data.iban); alert("IBAN copié !")}}/>
                        </div>
                      )}
                    </div>
                    <div className="bper-actions-row-under">
                      <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>{showIban ? "Cacher" : "Voir mon IBAN"}</button>
                      <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Virement</button>
                      <button className="bper-pill-green"><Plus size={14} /> Ajouter une carte</button>
                    </div>
                  </section>

                  {/* LES GRAPHS SONT ICI */}
                  <section className="bper-charts-section">
                    <div className="chart-container-desktop">
                      <h4>Analyse des flux financiers</h4>
                      <div style={{height: '220px'}}><Bar data={barData} options={{maintainAspectRatio: false}} /></div>
                    </div>
                    <div className="chart-container-desktop">
                      <h4>Variation du patrimoine</h4>
                      <div style={{height: '220px'}}><Line data={lineData} options={{maintainAspectRatio: false}} /></div>
                    </div>
                  </section>
                </div>

                {/* SECTION DROITE : HISTORIQUE */}
                <div className="bper-right-col">
                  <section className="bper-history-block-white">
                    <div className="bper-history-header-green">
                      <h3>Dernières opérations</h3>
                      <Filter size={18} onClick={() => setShowFilters(!showFilters)} style={{cursor:'pointer'}}/>
                    </div>

                    <div className="bper-transactions-table-green">
                      {filteredTx.slice(0, 8).map((tr, i) => (
                        <div key={i} className="bper-tr-item-green" onClick={() => setSelectedTx(tr)}>
                          <div className="bper-tr-left">
                             <div className="bper-tr-circle-green">
                                {tr.type === "CREDIT" ? <PlusCircle size={16} color="#16a34a" /> : <Send size={16} />}
                             </div>
                             <div>
                               <p className="bper-tr-name">{tr.label}</p>
                               <p className="bper-tr-date">{new Date(tr.createdAt).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className={tr.type === 'CREDIT' ? 'amt plus' : 'amt minus'}>
                            {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()} €
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
            {activeTab === "profile" && <Profile data={data} />}
          </div>
        </main>

        {/* MODAL TRANSACTION PRO */}
        {selectedTx && (
          <div className="bper-modal-overlay" onClick={() => setSelectedTx(null)}>
            <div className="bper-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header-pro">
                <h3>Détails Bancaires</h3>
                <button onClick={() => setSelectedTx(null)}>✕</button>
              </div>
              <div className="modal-body-pro">
                <div className="main-amount">{selectedTx.amount.toLocaleString()} €</div>
                <DetailRow label="Libellé" value={selectedTx.label} />
                <DetailRow label="Date comptable" value={new Date(selectedTx.createdAt).toLocaleDateString()} />
                <DetailRow label="Nature" value={selectedTx.type === 'CREDIT' ? 'Crédit' : 'Débit'} color={selectedTx.type === 'CREDIT' ? '#16a34a' : '#dc2626'} />
                <DetailRow label="Référence" value={selectedTx._id?.toUpperCase()} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDU MOBILE ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && <BankCard card={card} />}
        {activeTab === "financing" && <Financing />}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
}