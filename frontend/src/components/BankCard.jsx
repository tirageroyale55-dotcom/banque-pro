import { useState } from "react";

export default function BankCard({ card }) {

const [flipped,setFlipped] = useState(false);

if(!card) return null;

const formatNumber = (num) => {
if(!num) return "•••• •••• •••• ••••";
return "•••• •••• •••• " + num.slice(-4);
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

<div className="card-bank">BPER:</div>

<img src="/bancomat.svg" height="28"/>

</div>

<div className="chip-area">

  <div className="nfc">
  <svg viewBox="0 0 24 24" width="28" height="28">
    <path d="M3 12a9 9 0 0 1 9-9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M6 12a6 6 0 0 1 6-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M9 12a3 3 0 0 1 3-3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
</div>

</div>

<div className="card-number">
{formatNumber(card.number)}
</div>

<div className="card-footer">

<div>
<span>TITULAIRE</span>
<strong>{card.holder}</strong>
</div>

<div>
<span>EXP</span>
<strong>{card.exp_month}/{card.exp_year}</strong>
</div>

<img
src="/mastercard.svg"
className="mastercard"
/>

</div>

</div>


{/* BACK */}

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