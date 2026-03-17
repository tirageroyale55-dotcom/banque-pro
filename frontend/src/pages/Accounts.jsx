import { useState } from "react";
import { Send, PlusCircle, Receipt, ArrowUp, ArrowDown } from "lucide-react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function Accounts({ data }) {

  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("all");
  const [visibleTx, setVisibleTx] = useState(20);

  // 🔹 FILTRE + TRI
  const filteredTransactions = data.transactions
    .filter(tx =>
      filter === "all" ||
      (filter === "entrants" && tx.amount > 0) ||
      (filter === "sortants" && tx.amount < 0)
    )
    .sort((a, b) =>
      sortAsc
        ? new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time)
        : new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time)
    );

  // 🔹 TOTALS
  const totalEntrants = data.transactions
    .filter(tx => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalSortants = data.transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  // 🔹 GRAPH BARRES (historique par date)
  const groupedByDate = {};

  data.transactions.forEach(tx => {
    if (!groupedByDate[tx.date]) {
      groupedByDate[tx.date] = { entrants: 0, sortants: 0 };
    }

    if (tx.amount > 0) {
      groupedByDate[tx.date].entrants += tx.amount;
    } else {
      groupedByDate[tx.date].sortants += Math.abs(tx.amount);
    }
  });

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const barData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Entrées",
        data: sortedDates.map(d => groupedByDate[d].entrants),
        backgroundColor: "#34D399"
      },
      {
        label: "Sorties",
        data: sortedDates.map(d => groupedByDate[d].sortants),
        backgroundColor: "#F87171"
      }
    ]
  };

  // 🔹 GRAPH COURBE (évolution solde)
  let runningBalance = 0;
  const balanceHistory = sortedDates.map(date => {
    const day = groupedByDate[date];
    runningBalance += day.entrants - day.sortants;
    return runningBalance;
  });

  const lineData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Solde",
        data: balanceHistory,
        borderColor: "#2563EB",
        backgroundColor: "#93C5FD",
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" }
    },
    animation: { duration: 800 }
  };

  // 🔹 LAZY LOAD
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && visibleTx < filteredTransactions.length) {
      setVisibleTx(prev => prev + 20);
    }
  };

  return (
    <div className="content">

      {/* Carte compte */}
      <div className="account-card shadow">
        <div className="account-title">Compte principal</div>
        <div className="balance">{data.balance} €</div>
        <div className="balance-date">Solde disponible</div>
        <div className="owner">{data.firstname} {data.lastname}</div>
        <div className="iban">{data.iban}</div>
      </div>

      {/* Actions */}
      <div className="quick-actions">
        <div className="action"><Send size={22}/> <span>Virement</span></div>
        <div className="action"><PlusCircle size={22}/> <span>Ajouter</span></div>
        <div className="action"><Receipt size={22}/> <span>Paiement</span></div>
      </div>

      {/* Résumé */}
      <div className="month-summary grid md:grid-cols-3 gap-4 mb-6">
        <div className="summary-card entrants">
          <ArrowDown size={22}/>
          <div>+{totalEntrants} €</div>
        </div>
        <div className="summary-card sortants">
          <ArrowUp size={22}/>
          <div>-{totalSortants} €</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="chart-card">
          <Bar data={barData} options={chartOptions}/>
        </div>
        <div className="chart-card">
          <Line data={lineData} options={chartOptions}/>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters">
        <div>
          <button onClick={()=>setFilter("all")}>Toutes</button>
          <button onClick={()=>setFilter("entrants")}>Entrées</button>
          <button onClick={()=>setFilter("sortants")}>Sorties</button>
        </div>
        <button onClick={()=>setSortAsc(!sortAsc)}>
          {sortAsc ? "↓" : "↑"}
        </button>
      </div>

      {/* Transactions */}
      <div className="transactions-history" onScroll={handleScroll}>
        {filteredTransactions.slice(0, visibleTx).map((tx, i) => (
          <div key={i} className="transaction-row group">

            <div className="flex items-center gap-2">
              {tx.type === "virement" && <Send size={18}/>}
              {tx.type === "paiement" && <Receipt size={18}/>}
              {tx.type === "ajout" && <PlusCircle size={18}/>}

              <div>
                <div>{tx.motif}</div>
                <div className="tx-date">{tx.date} {tx.time}</div>
              </div>
            </div>

            <div className={tx.amount > 0 ? "positive" : "negative"}>
              {tx.amount > 0 ? `+${tx.amount}` : tx.amount} €
            </div>

            <div className="tx-badge">
              {tx.amount > 0 ? "Crédit" : "Débit"}
            </div>

            <div className="tx-details">
              <div>IBAN: {tx.iban || "—"}</div>
              <div>Type: {tx.type}</div>
              <div>Ref: {tx.ref || "—"}</div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}