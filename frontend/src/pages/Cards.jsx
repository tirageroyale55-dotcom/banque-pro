import { useEffect, useState } from "react";
import { api } from "../services/api";

import BankCard from "../components/BankCard";

export default function Cards(){

const [card,setCard] = useState(null);

useEffect(()=>{

api("/client/card")
.then(setCard)
.catch(()=>console.log("Erreur carte"));

},[]);

if(!card){
return(
<div className="cards-page">
<h2>Carte bancaire</h2>
<p>Chargement...</p>
</div>
)
}

return(

<div className="cards-page">

<h2>Carte bancaire</h2>

<BankCard
card={{
number:card.number,
holder:card.holder,
exp:card.exp
}}
/>

</div>

)

}