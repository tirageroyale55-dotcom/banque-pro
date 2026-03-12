import { useState } from "react";

export default function BankCard({ card }) {

const [flip,setFlip] = useState(false);

return (

<div
className={`bper-card ${flip ? "flip" : ""}`}
onClick={()=>setFlip(!flip)}
>

<div className="bper-card-inner">

{/* FRONT */}

<div className="bper-card-front">

<div className="bper-top">

<div className="bper-chip"></div>

<div className="bper-brand">
{card.brand?.toUpperCase()}
</div>

</div>

<div className="bper-number">
•••• •••• •••• {card.last4}
</div>

<div className="bper-bottom">

<div>
<span>TITULAIRE</span>
<strong>{card.holder}</strong>
</div>

<div>
<span>EXP</span>
<strong>{card.exp_month}/{card.exp_year}</strong>
</div>

</div>

</div>

{/* BACK */}

<div className="bper-card-back">

<div className="bper-stripe"></div>

<div className="bper-cvv">

<span>CVV</span>
<strong>{card.cvv || "***"}</strong>

</div>

</div>

</div>

</div>

);
}