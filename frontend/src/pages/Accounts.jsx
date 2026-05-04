import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Receipt, Filter, Copy, CreditCard, Eye, EyeOff } from "lucide-react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

function DetailRow({ label, value, color = '#1e293b' }) {
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
      <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: color, fontWeight: '500' }}>{value}</div>
    </div>
  );
}

export default function Accounts({ data, setActiveTab }) {
  const navigate = useNavigate(); 
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null); 

  const today = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setMonth(today.getMonth() - 6); 

  const formatDate = (date) => date.toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(formatDate(defaultStartDate));
  const [endDate, setEndDate] = useState(formatDate(today));

  const rawTransactions = data.transactions || [];

  const [showBalance, setShowBalance] = useState(true);
  const [showIban, setShowIban] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("IBAN copié !"); 
  };

  const formatBper = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const transactions = rawTransactions
    .filter(tx => {
      const dateVal = tx.createdAt || tx.date;
      if (!dateVal) return false;
      const txDate = new Date(dateVal);
      const txDateString = txDate.toISOString().split("T")[0];
      const matchType = filter === "all" || (filter === "entrants" && tx.type === "CREDIT") || (filter === "sortants" && tx.type === "DEBIT");
      return matchType && (startDate ? txDateString >= startDate : true) && (endDate ? txDateString <= endDate : true);
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return sortAsc ? dateA - dateB : dateB - dateA;
    })
    .slice(0, 10);

  // Logique Graphes
  const grouped = {};
  transactions.forEach(tx => {
    const dateKey = new Date(tx.createdAt || tx.date).toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });

  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));
  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d]?.in || 0), backgroundColor: "#16a34a" },
      { label: "Sorties", data: dates.map(d => grouped[d]?.out || 0), backgroundColor: "#dc2626" }
    ]
  };

  let runningBalance = 0;
  const balanceData = dates.map(d => {
    runningBalance += (grouped[d]?.in || 0) - (grouped[d]?.out || 0);
    return runningBalance;
  });

  const lineData = {
    labels: dates,
    datasets: [{ label: "Solde", data: balanceData, borderColor: "#2563eb", tension: 0.3 }]
  };

  return (
    <div className="content">
      
      {/* --- CARTE SOLDE MISE À JOUR --- */}
<div className="account-card-container">
  <div className="account-card">
    <div className="balance-section">
      <div className="balance-label">
        Solde disponible 
        {/* L'icône change selon l'état et bascule au clic */}
        <span onClick={() => setShowBalance(!showBalance)} style={{ marginLeft: '8px', cursor: 'pointer' }}>
          {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
        </span>
      </div>

      <div className="balance">
        {/* Si showBalance est faux, on affiche des étoiles */}
        {showBalance ? `${formatBper(data.balance)} €` : "•••••• €"}
      </div>

      <div className="owner owner-name">{data.firstname} {data.lastname}</div>
      
      {/* Affichage de l'IBAN (Mobile) */}
      <div className="iban mobile-only">
        {showIban ? data.iban : "IT** **** **** **** ****"}
        <button onClick={() => { copyToClipboard(data.iban); setShowIban(true); }} className="copy-btn-clean">
          <Copy size={14} />
        </button>
      </div>
    </div>

    {/* --- BOUTONS VERTICAUX (DESKTOP) --- */}
    <div className="desktop-only-actions">
      <button className="bper-btn-outline" onClick={() => setShowIban(!showIban)}>
        <div className="btn-icon-circle"><Eye size={18} /></div>
        <span>{showIban ? data.iban : "Voir mon Iban"}</span>
      </button>

      <button className="bper-btn-outline" onClick={() => navigate("/virement-international")}>
        <div className="btn-icon-circle"><Send size={18} /></div>
        <span>Effectuer un virement</span>
      </button>

      <button 
    className="bper-btn-outline" 
    onClick={() => setActiveTab("cards")} // On change l'onglet au lieu de naviguer
  >
    <div className="btn-icon-circle"><CreditCard size={18} /></div>
    <span>Voir mes cartes virtuelles</span>
  </button>

    </div>
  </div>
</div>

      {/* --- ACTIONS RAPIDES (MOBILE ONLY) --- */}
      <div className="quick-actions mobile-only">
        <div onClick={() => navigate("/virement-international")} style={{ cursor: 'pointer' }}>
          <Send size={20}/> Virement
        </div>
        <div><PlusCircle size={20}/> Ajouter</div>
        <div><Receipt size={20}/> Paiement</div>
      </div>

      {/* HISTORIQUE */}
      <div className="transactions">
        <div className="transactions-header">
          <h3>Historique</h3>
          <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18}/>
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <select onChange={(e)=>setFilter(e.target.value)} value={filter}>
              <option value="all">Toutes</option>
              <option value="entrants">Entrées</option>
              <option value="sortants">Sorties</option>
            </select>
            <div className="date-field">
              <label>Du</label>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
            </div>
            <div className="date-field">
              <label>Au</label>
              <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
            </div>
            <button onClick={()=>setSortAsc(!sortAsc)}>{sortAsc ? "↑ Croissant" : "↓ Décroissant"}</button>
          </div>
        )}

        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="empty-transactions">Aucune transaction disponible</div>
          ) : (
            transactions.map((tx, i) => (
              <div key={tx._id || i} className="transaction" data-type={tx.type === "CREDIT" ? "Crédit" : "Débit"}>
                <div className="left">
                  {/* LE CLIC EST ICI : Il ouvre l'overlay en dessous */}
                  <div onClick={() => setSelectedTx(tx)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}>
                    {tx.type === "DEBIT" ? <Send size={18} /> : <PlusCircle size={18} color="#16a34a" />}
                  </div>
                  <div>
                    <div className="motif">{tx.label || "Transaction bancaire"}</div> 
                    <div className="date">{new Date(tx.createdAt || tx.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
                <div className={tx.type === "CREDIT" ? "amount plus" : "amount minus"}>
                  {tx.type === "CREDIT" ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`} €
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts">
        <div className="chart"><Bar data={barData}/></div>
        <div className="chart"><Line data={lineData}/></div>
      </div>

      {/* --- CET OVERLAY ÉTAIT VIDE DANS TON CODE PRÉCÉDENT --- */}
      {selectedTx && (
        <div className="tx-overlay" onClick={() => setSelectedTx(null)}>
          <div className="tx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tx-modal-header">
              <h4>Détails de l'opération</h4>
              <button className="close-modal" onClick={() => setSelectedTx(null)}>×</button>
            </div>
            
            <div className="tx-modal-body">
              <div className="tx-amount-large" style={{ color: selectedTx.type === "CREDIT" ? "#16a34a" : "#dc2626", textAlign: 'center', fontSize: '24px', margin: '20px 0', fontWeight: 'bold' }}>
                {selectedTx.type === "CREDIT" ? "+" : "-"}{selectedTx.amount.toLocaleString()} €
              </div>
              
              <div className="tx-details-list">
                <DetailRow label="Libellé / Motif" value={selectedTx.label || "Transaction BPER"} />
                <DetailRow label="Date" value={new Date(selectedTx.createdAt || selectedTx.date).toLocaleString('fr-FR')} />
                <DetailRow label="Type d'opération" value={selectedTx.type === "CREDIT" ? "CRÉDIT (Entrant)" : "DÉBIT (Sortant)"} />
                <DetailRow label="Référence de transaction" value={selectedTx._id ? selectedTx._id.toUpperCase() : "EN COURS..."} />
                <DetailRow label="État" value="Exécuté" color="#16a34a" />
              </div>

              <button className="bper-btn-full" style={{ marginTop: '20px', width: '100%', padding: '12px', background: '#005a64', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }} onClick={() => window.print()}>
                Télécharger le justificatif
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}