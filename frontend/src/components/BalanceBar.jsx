export default function BalanceBar({ balance, visible }) {

return (

<div className={`balance-bar ${visible ? "show" : ""}`}>

<div className="balance-content">

<div className="balance-left">

<span className="balance-page">Compte</span>

<span className="balance-label">Solde disponible</span>

</div>

<strong className="balance-amount">
{balance} €
</strong>

</div>

</div>

);

}