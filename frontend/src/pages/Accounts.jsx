import { useState } from "react";
import { Send, PlusCircle, Receipt, ArrowUp, ArrowDown, Search } from "lucide-react";

export default function Accounts({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10); // lazy load initial

  // Totaux du mois
  const totalEntrants = data.transactions
    .filter(tx => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalSortants = data.transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  // Filtrage par recherche
  const filteredTransactions = data.transactions
    .filter(tx => tx.motif.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, visibleCount);

  // Charger plus de transactions
  const loadMore = () => setVisibleCount(prev => prev + 10);

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

      {/* Résumé du mois */}
      <div className="month-summary">
        <div className="summary-card entrants">
          <ArrowDown size={20} className="icon" />
          <div className="summary-info">
            <span className="label">Total Entrées</span>
            <span className="amount">+{totalEntrants} €</span>
          </div>
        </div>
        <div className="summary-card sortants">
          <ArrowUp size={20} className="icon" />
          <div className="summary-info">
            <span className="label">Total Sorties</span>
            <span className="amount">-{totalSortants} €</span>
          </div>
        </div>
      </div>

      {/* Recherche / filtre */}
      <div className="transaction-filter">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher une transaction"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Historique des transactions */}
      <div className="transactions-history">
        <div className="history-title">Historique des transactions</div>

        {filteredTransactions.length === 0 && <div className="no-transactions">Aucune transaction trouvée</div>}

        <div className="transactions-list">
          {filteredTransactions.map((tx, index) => (
            <div key={index} className="transaction-row">
              <div className="tx-icon">
                {tx.type === "virement" && <Send size={18} />}
                {tx.type === "paiement" && <Receipt size={18} />}
                {tx.type === "recu" && <PlusCircle size={18} />}
              </div>
              <div className="tx-info">
                <div className="tx-date">{tx.date} {tx.time}</div>
                <div className="tx-motif">{tx.motif}</div>
              </div>
              <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                {tx.amount > 0 ? `+${tx.amount} €` : `${tx.amount} €`}
              </div>
            </div>
          ))}
        </div>

        {/* Charger plus */}
        {visibleCount < data.transactions.length && (
          <button className="load-more" onClick={loadMore}>Voir plus</button>
        )}
      </div>

    </div>
  );
}