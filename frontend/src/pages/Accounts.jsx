import { useState } from "react";
import { Send, PlusCircle, Receipt, ArrowUp, ArrowDown } from "lucide-react";
import { Bar } from "react-chartjs-2"; // Pour le graphique
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Accounts({ data }) {
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState("all"); // all / entrants / sortants

  // Filtrage et tri
  const filteredTransactions = data.transactions
    .filter(tx => filter === "all" || (filter === "entrants" && tx.amount > 0) || (filter === "sortants" && tx.amount < 0))
    .sort((a, b) => sortAsc ? new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time) : new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

  const totalEntrants = data.transactions.filter(tx => tx.amount > 0).reduce((acc, tx) => acc + tx.amount, 0);
  const totalSortants = data.transactions.filter(tx => tx.amount < 0).reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  // Données pour graphique
  const chartData = {
    labels: ["Entrées", "Sorties"],
    datasets: [
      {
        label: "Montants €",
        data: [totalEntrants, totalSortants],
        backgroundColor: ["#34D399", "#F87171"]
      }
    ]
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

      {/* Actions rapides */}
      <div className="quick-actions">
        <div className="action"><Send size={22}/> <span>Virement</span></div>
        <div className="action"><PlusCircle size={22}/> <span>Ajouter</span></div>
        <div className="action"><Receipt size={22}/> <span>Paiement</span></div>
      </div>

      {/* Résumé du mois + graphique */}
      <div className="month-summary grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="summary-card entrants flex items-center p-4 rounded-lg bg-green-100">
          <ArrowDown size={24} className="mr-2 text-green-700" />
          <div>
            <div className="label font-semibold text-gray-700">Total Entrées</div>
            <div className="amount font-bold text-green-800">+{totalEntrants} €</div>
          </div>
        </div>
        <div className="summary-card sortants flex items-center p-4 rounded-lg bg-red-100">
          <ArrowUp size={24} className="mr-2 text-red-700" />
          <div>
            <div className="label font-semibold text-gray-700">Total Sorties</div>
            <div className="amount font-bold text-red-800">-{totalSortants} €</div>
          </div>
        </div>
        <div className="chart-card p-4 rounded-lg bg-gray-50">
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="filters flex justify-between items-center mb-4">
        <div className="filter-buttons flex gap-2">
          <button className={`px-3 py-1 rounded ${filter==='all'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={()=>setFilter("all")}>Toutes</button>
          <button className={`px-3 py-1 rounded ${filter==='entrants'?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>setFilter("entrants")}>Entrées</button>
          <button className={`px-3 py-1 rounded ${filter==='sortants'?'bg-red-600 text-white':'bg-gray-200'}`} onClick={()=>setFilter("sortants")}>Sorties</button>
        </div>
        <button className="px-3 py-1 rounded bg-gray-300" onClick={()=>setSortAsc(!sortAsc)}>
          {sortAsc ? "Tri ↓" : "Tri ↑"}
        </button>
      </div>

      {/* Historique des transactions */}
      <div className="transactions-history bg-white rounded-lg shadow p-4">
        {filteredTransactions.length===0 ? <div className="text-gray-500">Aucune transaction</div> : null}
        <div className="transactions-list max-h-96 overflow-y-auto">
          {filteredTransactions.map((tx, index) => (
            <div key={index} className="transaction-row flex justify-between items-center p-2 border-b hover:bg-gray-50 group">
              
              {/* Type d’icône selon transaction */}
              <div className="flex items-center gap-2">
                {tx.type === "virement" && <Send size={20} className="text-blue-500" />}
                {tx.type === "paiement" && <Receipt size={20} className="text-purple-500" />}
                {tx.type === "ajout" && <PlusCircle size={20} className="text-green-500" />}
                
                <div className="tx-info">
                  <div className="tx-motif font-medium">{tx.motif}</div>
                  <div className="tx-date text-gray-500 text-sm">{tx.date} {tx.time}</div>
                </div>
              </div>

              <div className={`tx-amount font-semibold ${tx.amount>0?'text-green-600':'text-red-600'}`}>
                {tx.amount>0?`+${tx.amount} €`:`${tx.amount} €`}
              </div>

              {/* Survol avec détails */}
              <div className="tx-details hidden group-hover:block absolute bg-white shadow-lg p-2 rounded text-sm right-4 top-full z-10 w-64">
                <div>IBAN: {tx.iban || "—"}</div>
                <div>Catégorie: {tx.type}</div>
                <div>Référence: {tx.ref || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}