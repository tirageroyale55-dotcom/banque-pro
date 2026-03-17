import { Send, PlusCircle, Receipt } from "lucide-react";

export default function Accounts({ data }) {

  // Calcul du total des entrées et sorties pour le mois
  const totalEntrants = data.transactions
    .filter(tx => tx.amount > 0)
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalSortants = data.transactions
    .filter(tx => tx.amount < 0)
    .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  return (
    <div className="content">

      {/* Carte compte */}
      <div className="account-card">
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
        <div className="summary-item">
          <span>Total Entrées</span>
          <span className="positive">+{totalEntrants} €</span>
        </div>
        <div className="summary-item">
          <span>Total Sorties</span>
          <span className="negative">-{totalSortants} €</span>
        </div>
      </div>

      {/* Historique des transactions */}
      <div className="transactions-history">
        <div className="history-title">Historique des transactions</div>

        {data.transactions.length === 0 ? (
          <div className="no-transactions">Aucune transaction ce mois-ci</div>
        ) : (
          data.transactions.map((tx, index) => (
            <div key={index} className="transaction-row">
              <div className="tx-date">{tx.date} {tx.time}</div>
              <div className="tx-motif">{tx.motif}</div>
              <div className={`tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}`}>
                {tx.amount > 0 ? `+${tx.amount} €` : `${tx.amount} €`}
              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
}