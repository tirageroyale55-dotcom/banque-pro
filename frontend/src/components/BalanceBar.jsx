export default function BalanceBar({ balance, visible }) {

  return (

    <div className={`balance-bar ${visible ? "show" : ""}`}>

      <span>Solde disponible</span>

      <strong>{balance} €</strong>

    </div>

  );

}