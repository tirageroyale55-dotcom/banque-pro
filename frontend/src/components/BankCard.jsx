import { useState } from "react";

export default function BankCard({ card }) {

const [flipped,setFlipped] = useState(false);

if(!card) return null;

const formatNumber = (num) => {
if(!num) return "•••• •••• •••• ••••";
return "•••• •••• •••• " + num.slice(-4);
};

/* statut par défaut */

const status = card.status || "inactive";

/* texte affiché */

const statusText = {
inactive: "Carte inactive",
active: "Carte active",
blocked: "Carte bloquée"
};

return (

<div
className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
onClick={()=>setFlipped(!flipped)}
>

<div className="card-inner">

{/* FRONT */}

<div className="card-front">

{/* HEADER */}

<div className="card-header">

<div className="card-bank">BPER</div>

<img src="/bancomat.svg" height="28"/>

</div>

{/* STATUT */}

<div className={`card-status ${status}`}>
{statusText[status]}
</div>

<div className="chip-area">
<div className="chip"></div>
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