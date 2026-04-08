import { useState } from "react";
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

  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("all");
  
  const today = new Date();

// début du mois
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

// format YYYY-MM-DD (obligatoire pour input date)
const formatDate = (date) => date.toISOString().split("T")[0];

const [startDate, setStartDate] = useState(formatDate(firstDay));
const [endDate, setEndDate] = useState(formatDate(today));
  const [showFilters, setShowFilters] = useState(false);

  
const [expandedId, setExpandedId] = useState(null);
const [selectedTx, setSelectedTx] = useState(null); 

  // 🔹 FILTRE + TRI
  const rawTransactions = data.transactions || [];

  const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    // Méthode moderne (HTTPS)
    navigator.clipboard.writeText(text);
    alert("IBAN copié !");
  } else {
    // Méthode de secours (HTTP)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Évite de faire défiler la page
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert("IBAN copié (mode compatibilité) !");
    } catch (err) {
      console.error("Erreur de copie :", err);
    }
    document.body.removeChild(textArea);
  }
};

  // À placer juste avant le return (
const formatBper = (amount) => {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

  // 2. Filtrage intelligent basé sur les champs réels de ta base de données
  const transactions = rawTransactions
    .filter(tx => {
      // ⚠️ CORRECTION : Utilisation de createdAt (Date MongoDB)
      const txDate = new Date(tx.createdAt);
      const txDateString = txDate.toISOString().split("T")[0]; // Format YYYY-MM-DD pour comparer

      // ⚠️ CORRECTION : Filtrage par TYPE (CREDIT/DEBIT) et non par montant
      const matchType =
        filter === "all" ||
        (filter === "entrants" && tx.type === "CREDIT") ||
        (filter === "sortants" && tx.type === "DEBIT");

      const matchStart = startDate ? txDateString >= startDate : true;
      const matchEnd = endDate ? txDateString <= endDate : true;

      return matchType && matchStart && matchEnd;
    })
    .sort((a, b) => {
      // ⚠️ CORRECTION : Tri par date de création (le plus récent en haut)
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  // 🔹 GRAPH basé sur transactions filtrées (CORRIGÉ)
  const grouped = {};
  transactions.forEach(tx => {
    // ⚠️ Correction 1 : Utiliser createdAt pour la clé de date
    const dateKey = new Date(tx.createdAt).toLocaleDateString('fr-FR');
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = { in: 0, out: 0 };
    }
    
    // ⚠️ Correction 2 : Utiliser le TYPE pour classer in/out
    if (tx.type === "CREDIT") {
      grouped[dateKey].in += tx.amount;
    } else {
      // On utilise Math.abs au cas où le montant est négatif en BDD
      grouped[dateKey].out += Math.abs(tx.amount);
    }
  });

  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'))
  );

  const barData = {
    labels: dates,
    datasets: [
      {
        label: "Entrées",
        data: dates.map(d => grouped[d]?.in || 0),
        backgroundColor: "#16a34a"
      },
      {
        label: "Sorties",
        data: dates.map(d => grouped[d]?.out || 0),
        backgroundColor: "#dc2626"
      }
    ]
  };

  let balance = 0;
  const balanceData = dates.map(d => {
    balance += (grouped[d]?.in || 0) - (grouped[d]?.out || 0);
    return balance;
  });

  const lineData = {
    labels: dates,
    datasets: [
      {
        label: "Solde",
        data: balanceData,
        borderColor: "#2563eb",
        tension: 0.3
      }
    ]
  };

  return (
    <div className="content">

      {/* CARD SOLDE */}
<div className="account-card">
  <div className="balance">{formatBper(data.balance)} €</div>
  <div className="owner">{data.firstname} {data.lastname}</div>
  
  <div className="iban" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    {data.iban}
    <button 
      onClick={() => copyToClipboard(data.iban)}
      style={{ 
        background: 'none', 
        border: 'none', 
        color: 'inherit', 
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        opacity: 0.8
      }}
      title="Copier l'IBAN"
    >
      <Copy size={14} />
    </button>
  </div>
</div>

      {/* ACTIONS */}
      <div className="quick-actions">
        <div><Send size={20}/> Virement</div>
        <div><PlusCircle size={20}/> Ajouter</div>
        <div><Receipt size={20}/> Paiement</div>
      </div>

      {/* HISTORIQUE */}
      <div className="transactions">

        <div className="transactions-header">
          <h3>Historique</h3>

          <button 
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18}/>
          </button>
        </div>

        {/* PANEL FILTRE */}
        {showFilters && (
          <div className="filters-panel">

            <select onChange={(e)=>setFilter(e.target.value)}>
              <option value="all">Toutes</option>
              <option value="entrants">Entrées</option>
              <option value="sortants">Sorties</option>
            </select>

            <div className="date-field">
  <label>Du</label>
  <input 
    type="date"
    value={startDate}
    onChange={(e)=>setStartDate(e.target.value)}
  />
</div>

<div className="date-field">
  <label>Au</label>
  <input 
    type="date"
    value={endDate}
    onChange={(e)=>setEndDate(e.target.value)}
  />
</div>

            <button onClick={()=>setSortAsc(!sortAsc)}>
              {sortAsc ? "↑ Croissant" : "↓ Décroissant"}
            </button>

          </div>
        )}

        

{/* --- LISTE DES TRANSACTIONS (AVEC TYPE RÉTABLI) --- */}
<div className="transactions-list">
  {transactions.length === 0 ? (
    <div className="empty-transactions">Aucune transaction disponible</div>
  ) : (
    transactions.map((tx, i) => (
      <div 
        key={tx._id || i} 
        className="transaction"
        
        data-type={tx.type === "CREDIT" ? "Crédit" : "Débit"}
      >
        <div className="left">
          {/* SEUL L'ICÔNE DÉCLENCHE LA PAGE DÉTAILS */}
          <div 
            onClick={() => setSelectedTx(tx)} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}
          >
            {tx.type === "DEBIT" ? (
              <Send size={18} />
            ) : (
              <PlusCircle size={18} color="#16a34a" />
            )}
          </div>

          <div>
            <div className="motif">{tx.label}</div> 
            <div className="date">
              {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Montant avec ses classes originales */}
        <div className={tx.type === "CREDIT" ? "amount plus" : "amount minus"}>
          {tx.type === "CREDIT" ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`} €
        </div>
      </div>
    ))
  )}
</div>

{/* --- PAGE DE DÉTAILS (OVERLAY) --- */}
{selectedTx && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column'
  }}>
    {/* HEADER DE LA PAGE DÉTAILS */}
    <div style={{ 
      padding: '20px', display: 'flex', alignItems: 'center', 
      borderBottom: '1px solid #eee', background: '#f8fafc' 
    }}>
      <button 
        onClick={() => setSelectedTx(null)}
        style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← Retour
      </button>
      <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', marginRight: '40px' }}>
        Détails de l'opération
      </div>
    </div>

    {/* CONTENU DE LA PAGE */}
    <div style={{ padding: '24px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
          {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
        </div>
        <div style={{ color: '#64748b', marginTop: '8px' }}>{selectedTx.label}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
        <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
        <DetailRow label="Date de valeur" value={new Date(selectedTx.createdAt).toLocaleDateString('fr-FR')} />
        <DetailRow label="Type de paiement" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
        <DetailRow label="Référence interne" value={selectedTx._id.toUpperCase()} />
        <DetailRow 
          label="Description BPER" 
          value={selectedTx.type === 'CREDIT' 
            ? `Transaction de crédit autorisée par le service central. Identifiant : ${selectedTx._id.slice(-8)}`
            : `Ordre de virement débité. Référence mandat : ${selectedTx._id.slice(-8)}`
          } 
        />
      </div>
    </div>
  </div>
)}
      </div>

      {/* CHARTS */}
      <div className="charts">
        <div className="chart">
          <Bar data={barData}/>
        </div>
        <div className="chart">
          <Line data={lineData}/>
        </div>
      </div>

    </div>
  );
}