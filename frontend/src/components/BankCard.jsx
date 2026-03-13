import { useState } from "react";

export default function BankCard({ card }) {

const [flipped,setFlipped] = useState(false);

// sécurité si aucune carte
if(!card) return null;

// format numéro carte
const formatNumber = (num) => {
if(!num) return "•••• •••• •••• ••••";
return num.match(/.{1,4}/g).join(" ");
};

// logo VISA / Mastercard
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

{/* ================= FRONT ================= */}

<div className="card-front">

<div className="card-header">

<div className="chip"></div>

<div className="card-bank">BPER</div>

</div>

<div className="card-number">
{formatNumber(card.number)}
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

<img
src={brandLogo()}
className="card-brand-logo"
/>

</div>

</div>

{/* ================= BACK ================= */}

<div className="card-back">

<div className="magnetic"></div>

<div className="cvv-box">
<span>CVV</span>
<strong>{card.cvv}</strong>
</div>

</div>

</div>

</div>

);

}