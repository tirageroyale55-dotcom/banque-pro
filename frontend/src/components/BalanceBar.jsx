export default function BalanceBar({ balance }) {
  return (
    <div className="balance-bar">
      <div className="balance-content">
        <span>Solde disponible</span>
        <strong>{balance} €</strong>
      </div>
    </div>
  );
}