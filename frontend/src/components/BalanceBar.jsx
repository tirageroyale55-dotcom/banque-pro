export default function BalanceBar({ balance }) {
  // Optionnel : formater le nombre pour qu'il soit propre (ex: 1 250,00)
  const formattedBalance = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2
  }).format(balance);

  return (
    <div className="balance-bar">
      <div className="balance-content">
        <span>Solde disponible</span>
        <strong>{formattedBalance} €</strong>
      </div>
    </div>
  );
}