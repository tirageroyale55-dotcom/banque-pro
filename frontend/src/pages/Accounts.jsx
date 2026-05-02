import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Receipt, Filter, Copy } from "lucide-react";
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

export default function Accounts({ data }) {
  const navigate = useNavigate();
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("all");
  
  const today = new Date();
  // MODIFICATION : On remonte à 3 mois en arrière par défaut pour être sûr de voir des transactions
  const defaultStart = new Date();
  defaultStart.setMonth(today.getMonth() - 3);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(defaultStart));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null); 

  // 🔹 RECUPERATION DES DONNEES
  const rawTransactions = data.transactions || [];

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

  // 🔹 FILTRAGE DES TRANSACTIONS
  const transactions = rawTransactions
    .filter(tx => {
      // On s'assure d'avoir une date valide
      const dateString = tx.createdAt || tx.date; 
      if (!dateString) return false;

      const txDate = new Date(dateString);
      const txDateString = txDate.toISOString().split("T")[0];

      const matchType =
        filter === "all" ||
        (filter === "entrants" && tx.type === "CREDIT") ||
        (filter === "sortants" && tx.type === "DEBIT");

      const matchStart = startDate ? txDateString >= startDate : true;
      const matchEnd = endDate ? txDateString <= endDate : true;

      return matchType && matchStart && matchEnd;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  // 🔹 LOGIQUE GRAPHIQUES
  const grouped = {};
  transactions.forEach(tx => {
    const d = new Date(tx.createdAt || tx.date);
    const dateKey = d.toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });

  const dates = Object.keys(grouped).sort((a, b) => 
    new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'))
  );

  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a" },
      { label: "Sorties", data: dates.map(d => grouped[d].out), backgroundColor: "#dc2626" }
    ]
  };

  let currentBalance = 0;
  const balanceData = dates.map(d => {
    currentBalance += (grouped[d].in - grouped[d].out);
    return currentBalance;
  });

  const lineData = {
    labels: dates,
    datasets: [{ label: "Solde", data: balanceData, borderColor: "#2563eb", tension: 0.3 }]
  };

  return (
    <div className="content">
      {/* CARD SOLDE BPER */}
      <div className="account-card">
        <div className="balance">{formatBper(data.balance)} €</div>
        <div className="owner">{data.firstName} {data.lastName}</div>
        <div className="iban" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {data.iban}
          <button onClick={() => copyToClipboard(data.iban)} className="copy-btn">
            <Copy size={14} />
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <div onClick={() => navigate("/virement-international")} style={{ cursor: 'pointer' }}>
          <Send size={20}/> Virement
        </div>
        <div><PlusCircle size={20}/> Ajouter</div>
        <div><Receipt size={20}/> Paiement</div>
      </div>

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
            <button onClick={()=>setSortAsc(!sortAsc)}>
              {sortAsc ? "↑ Croissant" : "↓ Décroissant"}
            </button>
          </div>
        )}

        <div className="transactions-list">
          {transactions.length === 0 ? (
            <div className="empty-transactions">
                <p>Aucune transaction disponible</p>
                <small style={{color: '#94a3b8'}}>Vérifiez vos filtres de date</small>
            </div>
          ) : (
            transactions.map((tx, i) => (
              <div key={tx._id || i} className="transaction" onClick={() => setSelectedTx(tx)}>
                <div className="left">
                  <div className="icon-wrapper">
                    {tx.type === "DEBIT" ? <Send size={18} /> : <PlusCircle size={18} color="#16a34a" />}
                  </div>
                  <div>
                    <div className="motif">{tx.label}</div> 
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

      {/* OVERLAY DETAILS */}
      {selectedTx && (
        <div className="tx-details-overlay">
          <div className="tx-details-header">
            <button onClick={() => setSelectedTx(null)}>← Retour</button>
            <div className="header-title">Détails de l'opération</div>
          </div>
          <div className="tx-details-body">
            <div className="tx-main-amount">
                <div className={selectedTx.type === 'CREDIT' ? 'val plus' : 'val'}>
                    {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <div className="tx-label">{selectedTx.label}</div>
            </div>
            <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
            <DetailRow label="Date" value={new Date(selectedTx.createdAt || selectedTx.date).toLocaleDateString('fr-FR')} />
            <DetailRow label="Type" value={selectedTx.type === 'CREDIT' ? 'Crédit' : 'Débit'} />
            <DetailRow label="Référence" value={selectedTx._id?.toUpperCase() || "N/A"} />
          </div>
        </div>
      )}

      <div className="charts">
        <div className="chart"><Bar data={barData} options={{ responsive: true }}/></div>
        <div className="chart"><Line data={lineData} options={{ responsive: true }}/></div>
      </div>
    </div>
  );
}