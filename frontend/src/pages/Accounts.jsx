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

export default function Accounts({ data, accountRef }) {

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
  const transactions = data.transactions
    .filter(tx => {
      const txDate = new Date(tx.date);

      const matchType =
        filter === "all" ||
        (filter === "entrants" && tx.amount > 0) ||
        (filter === "sortants" && tx.amount < 0);

      const matchStart = startDate ? txDate >= new Date(startDate) : true;
      const matchEnd = endDate ? txDate <= new Date(endDate) : true;

      return matchType && matchStart && matchEnd;
    })
    .sort((a, b) =>
      sortAsc
        ? new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
        : new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time)
    );

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
      <div className="account-card" ref={accountRef}>
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

        {/* LISTE */}
        <div className="transactions-list">

          {transactions.length === 0 ? (
            <div className="empty-transactions">
              Aucune transaction disponible
            </div>
          ) : (
            transactions.map((tx, i) => (
              <div 
                key={i} 
                className="transaction"
                data-type={tx.amount > 0 ? "Crédit" : "Débit"}
              >

                <div className="left">
                  {tx.type === "virement" && <Send size={18}/>}
                  {tx.type === "paiement" && <Receipt size={18}/>}
                  {tx.type === "ajout" && <PlusCircle size={18}/>}

                  <div>
                    <div className="motif">{tx.motif}</div>
                    <div className="date">{tx.date} {tx.time}</div>
                  </div>
                </div>

                <div className={tx.amount > 0 ? "amount plus" : "amount minus"}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} €
                </div>

                <div className="details">
                  IBAN: {tx.iban || "—"} <br/>
                  Ref: {tx.ref || "—"}
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