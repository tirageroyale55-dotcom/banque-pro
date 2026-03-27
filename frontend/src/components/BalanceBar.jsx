export default function BalanceBar({ balance, offset, opacity }) {
  return (
    <div 
      className="balance-bar" 
      style={{ 
        transform: `translateY(${offset}px)`, 
        opacity: opacity,
        display: opacity > 0 ? 'flex' : 'none' // Performance : cache si inutile
      }}
    >
      <div className="balance-content">
        <span>Solde disponible</span>
        <strong>{balance} €</strong>
      </div>
    </div>
  );
}