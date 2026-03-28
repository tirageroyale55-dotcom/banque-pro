export default function BalanceBar({ balance }) {
  // Formatage : 1.250,00 €
  const formatted = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);

  return (
    <div className="balance-bar">
      <div className="balance-content">
        <span>Solde disponible</span>
        <strong>{formatted} €</strong>
      </div>
    </div>
  );
}