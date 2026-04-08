import { useState } from "react";
import { Send, PlusCircle, Receipt, Filter } from "lucide-react";
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

  // 🔹 FILTRE + TRI
  const rawTransactions = data.transactions || [];

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
  // 🔹 GRAPH basé sur transactions filtrées
  const grouped = {};
  transactions.forEach(tx => {
    if (!grouped[tx.date]) {
      grouped[tx.date] = { in: 0, out: 0 };
    }
    tx.amount > 0
      ? grouped[tx.date].in += tx.amount
      : grouped[tx.date].out += Math.abs(tx.amount);
  });

  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(a) - new Date(b)
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

      {/* CARD */}
      <div className="account-card">
        <div className="balance">{data.balance} €</div>
        <div className="owner">{data.firstname} {data.lastname}</div>
        <div className="iban">{data.iban}</div>
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

        {/* LISTE DES TRANSACTIONS CORRIGÉE */}
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
          {/* Icône dynamique selon le type */}
          {tx.type === "DEBIT" ? <Send size={18}/> : <PlusCircle size={18} color="#16a34a"/>}

          <div>
            {/* ✅ Correction : On utilise .label */}
            <div className="motif">{tx.label}</div> 
            {/* ✅ Correction : On formate la date MongoDB (createdAt) */}
            <div className="date">
              {new Date(tx.createdAt).toLocaleDateString('fr-FR')} à {new Date(tx.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        </div>

        {/* ✅ Correction : Gestion de la couleur du montant */}
        <div className={tx.type === "CREDIT" ? "amount plus" : "amount minus"}>
          {tx.type === "CREDIT" ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`} €
        </div>

        <div className="details">
          ID: {tx._id.substring(tx._id.length - 8)}
        </div>
      </div>
    ))
  )}
</div>
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