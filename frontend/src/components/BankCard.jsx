export default function BankCard({ card }) {

return (

<div className="bank-card">

<div className="card-header">

<div className="chip"></div>

<div className="card-brand">
{card.brand?.toUpperCase()}
</div>

</div>

<div className="card-number">
•••• •••• •••• {card.last4}
</div>

<div className="card-footer">

<div className="card-holder">
<span>TITULAIRE</span>
<strong>{card.holder}</strong>
</div>

<div className="card-exp">
<span>EXP</span>
<strong>{card.exp_month}/{card.exp_year}</strong>
</div>

</div>

</div>

);

}