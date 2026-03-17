import { Send, PlusCircle, Receipt, ArrowUp, ArrowDown } from "lucide-react";

export default function Accounts({ data }) {

  // Calcul des totaux du mois
  const totalEntrants = data.transactions
    .filter(tx => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalSortants = data.transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

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

      {/* Historique des transactions */}
      <div className="transactions-history">
        <div className="history-title">Historique des transactions</div>
        {data.transactions.length === 0 && <div className="no-transactions">Aucune transaction ce mois-ci</div>}
        
        <div className="transactions-list">
          {data.transactions.map((tx, index) => (
            <div key={index} className="transaction-row">
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
      </div>

    </div>
  );
}