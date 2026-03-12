import { useState } from "react";

export default function BankCard({ card }) {

const [flipped,setFlipped] = useState(false);

const brandLogo = () => {
if(card.brand === "visa") return "/visa.svg";
if(card.brand === "mastercard") return "/mastercard.svg";
return "";
};

return (

<div
className={`card-3d ${flipped ? "flipped" : ""}`}
onClick={()=>setFlipped(!flipped)}
>

<div className="card-inner">

{/* FRONT */}

<div className="card-front">

<div className="card-header">

<div className="chip"></div>

<img
src={brandLogo()}
className="card-brand-logo"
/>

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


{/* BACK */}

<div className="card-back">

<div className="magnetic"></div>

<div className="cvv-box">
<span>CVV</span>
<strong>{card.cvv || "***"}</strong>
</div>

</div>

</div>

</div>

);

}