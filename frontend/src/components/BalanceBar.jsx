export default function BalanceBar({ balance, visible }) {

return (

<div className={`balance-bar ${visible ? "show" : ""}`}>

<div className="balance-content">

<span>Solde disponible</span>
<strong>{balance}€</strong>

</div>

</div>

);

}