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
import BankCard from "../components/BankCard"; // Assumé pour "Cartes"
import Profile from "./Profile";
// Import de Financing si tu as le fichier, sinon on l'affiche en placeholder
// import Financing from "./Financing"; 

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
        api("/transactions").then((txData) => {
          setData(prev => ({ ...prev, transactions: txData.transactions || txData }));
        });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!data) return null;

  // Filtrage et limitation à 6 pour le Desktop
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
            <div className={`nav-item ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>Mes Cartes</div>
            <div className={`nav-item ${activeTab === 'financing' ? 'active' : ''}`} onClick={() => setActiveTab('financing')}>Financement</div>
            <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Mon Profil</div>
          </nav>
        </aside>

        <main className="bper-main-content">
          <header className="bper-header-top">
             <div className="bper-user-welcome">Bienvenue, <span className="user-name">{data.firstname} {data.lastname}</span></div>
             <div className="bper-top-icons"><div className="bper-square-icon" onClick={() => setActiveTab('profile')}>👤</div></div>
          </header>

          <div className="bper-scroll-zone">
            {activeTab === "accounts" && (
              <div className="bper-dashboard-container">
                <section className="bper-hero-card-white">
                  <div className="bper-balance-block">
                    <p className="bper-label-green">Solde disponible 👁️</p>
                    <h1 className="bper-amount-green">{formatBper(data.balance)} €</h1>
                    {showIban && (
                      <div className="iban-display" style={{display:'flex', gap:'10px', justifyContent:'center', background:'#f1f5f9', padding:'8px', borderRadius:'8px', marginTop:'10px'}}>
                        <code>{data.iban}</code>
                        <Copy size={16} onClick={() => {navigator.clipboard.writeText(data.iban); alert("Copié !")}} style={{cursor:'pointer'}}/>
                      </div>
                    )}
                  </div>
                  <div className="bper-actions-row-under">
                    <button className="bper-pill-green" onClick={() => setShowIban(!showIban)}>Voir mon IBAN</button>
                    <button className="bper-pill-green active" onClick={() => navigate("/virement-international")}>Effectuer un virement</button>
                    <button className="bper-pill-green">Voir ma carte virtuelle</button>
                  </div>
                </section>

                <section className="bper-history-block-white">
                  <div className="bper-history-header-green" style={{display:'flex', justifyContent:'space-between'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}><h3>Historique</h3></div>
                    <button onClick={() => setShowFilters(!showFilters)} style={{background:'none', border:'none'}}><Filter size={20} color="#0b5c5b"/></button>
                  </div>
                  {showFilters && (
                    <div className="filters-panel" style={{display:'flex', justifyContent:'flex-end', gap:'10px', padding:'10px'}}>
                       <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                       <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                       <select onChange={(e)=>setFilterType(e.target.value)}>
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
                           <div onClick={() => setSelectedTx(tr)} style={{cursor:'pointer', marginRight:'15px'}}>
                              {tr.type === "CREDIT" ? <PlusCircle size={20} color="#16a34a"/> : <Send size={20}/>}
                           </div>
                           <div className="bper-tr-details">
                             <p className="bper-tr-name">{tr.label}</p>
                             <p className="bper-tr-date">{new Date(tr.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className={tr.type === "CREDIT" ? "plus" : "minus"} style={{fontWeight:'bold'}}>
                          {tr.type === "CREDIT" ? "+" : "-"}{tr.amount.toLocaleString()} €
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* VUES DESKTOP POUR LES AUTRES ONGLETS */}
            {activeTab === "cards" && <div style={{padding:'20px'}}><BankCard /></div>}
            {activeTab === "financing" && <div style={{padding:'20px'}}><h2>Page Financement</h2><p>Contenu en cours...</p></div>}
            {activeTab === "profile" && <Profile data={data} />}
          </div>
        </main>

        {/* MODAL DÉTAILS PRO */}
        {selectedTx && (
          <div className="bper-modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999}}>
            <div style={{background:'white', width:'450px', padding:'30px', borderRadius:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><h3>Détails Opération</h3><button onClick={()=>setSelectedTx(null)}>✕</button></div>
              <div style={{textAlign:'center', margin:'20px 0'}}>
                <h2 style={{color: selectedTx.type==='CREDIT'?'#16a34a':'#1e293b'}}>{selectedTx.type==='CREDIT'?'+':'-'}{selectedTx.amount} €</h2>
              </div>
              <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
              <DetailRow label="Date de valeur" value={new Date(selectedTx.createdAt).toLocaleDateString()} />
              <DetailRow label="Référence" value={selectedTx._id.toUpperCase()} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDU MOBILE (RESTAURÉ À 100%) ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data}/>}
        {activeTab === "cards" && <BankCard />}
        {activeTab === "financing" && <div style={{padding:'20px'}}><h2>Page Financement</h2></div>}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
}