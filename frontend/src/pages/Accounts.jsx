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

  // --- CORRECTION : ON REMONTE À 2024 OU AU MOINS 6 MOIS PAR DÉFAUT ---
  // Cela permet d'afficher les transactions même si elles ne sont pas de ce mois-ci.
  const defaultStartDate = new Date();
  defaultStartDate.setMonth(today.getMonth() - 6); 

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(defaultStartDate)); // Changé ici
  const [endDate, setEndDate] = useState(formatDate(today));
  const [showFilters, setShowFilters] = useState(false);

  const [selectedTx, setSelectedTx] = useState(null); 

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

  // Filtrage intelligent
  // 2. Filtrage intelligent + Limitation à 10
  const transactions = rawTransactions
    .filter(tx => {
      const dateVal = tx.createdAt || tx.date;
      if (!dateVal) return false;

      const txDate = new Date(dateVal);
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
      // On garde le plus récent en haut (sortAsc est généralement false par défaut)
      return sortAsc ? dateA - dateB : dateB - dateA;
    })
    .slice(0, 10); // <--- CETTE LIGNE LIMITE À 10 RÉSULTATS

  // Logique Graphes
  const grouped = {};
  transactions.forEach(tx => {
    const dateKey = new Date(tx.createdAt || tx.date).toLocaleDateString('fr-FR');
    if (!grouped[dateKey]) {
      grouped[dateKey] = { in: 0, out: 0 };
    }
    if (tx.type === "CREDIT") {
      grouped[dateKey].in += tx.amount;
    } else {
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

  let runningBalance = 0;
  const balanceData = dates.map(d => {
    runningBalance += (grouped[d]?.in || 0) - (grouped[d]?.out || 0);
    return runningBalance;
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

      <div className="account-card">
        <div className="balance">{formatBper(data.balance)} €</div>
        {/* Dans Accounts.jsx, trouve cette ligne et ajoute la classe "owner-name" */}
        <div className="owner owner-name">{data.firstname} {data.lastname}</div>
        
        <div className="iban" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {data.iban}
          <button 
            onClick={() => copyToClipboard(data.iban)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.8 }}
          >
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
            <div className="empty-transactions">Aucune transaction disponible</div>
          ) : (
            transactions.map((tx, i) => (
              <div key={tx._id || i} className="transaction" data-type={tx.type === "CREDIT" ? "Crédit" : "Débit"}>
                <div className="left">
                  <div onClick={() => setSelectedTx(tx)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '5px' }}>
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

        {selectedTx && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', background: '#f8fafc' }}>
              <button onClick={() => setSelectedTx(null)} style={{ background: 'none', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ← Retour
              </button>
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', marginRight: '40px' }}>Détails de l'opération</div>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: selectedTx.type === 'CREDIT' ? '#16a34a' : '#1e293b' }}>
                  {selectedTx.type === 'CREDIT' ? '+' : '-'}{selectedTx.amount.toLocaleString()} €
                </div>
                <div style={{ color: '#64748b', marginTop: '8px' }}>{selectedTx.label}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <DetailRow label="Statut" value="Comptabilisé" color="#16a34a" />
                <DetailRow label="Date d'opération" value={new Date(selectedTx.createdAt || selectedTx.date).toLocaleDateString('fr-FR')} />
                <DetailRow label="Date de valeur" value={new Date(selectedTx.createdAt || selectedTx.date).toLocaleDateString('fr-FR')} />
                <DetailRow label="Type de paiement" value={selectedTx.type === 'CREDIT' ? 'Virement SEPA reçu' : 'Virement SEPA émis'} />
                <DetailRow label="Référence interne" value={selectedTx._id.toUpperCase()} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="charts">
        <div className="chart"><Bar data={barData}/></div>
        <div className="chart"><Line data={lineData}/></div>
      </div>
    </div>
  );
}