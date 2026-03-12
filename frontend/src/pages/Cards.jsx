import { useEffect, useState } from "react";
import { api } from "../services/api";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";

export default function Cards(){

const [card,setCard] = useState(null);

useEffect(()=>{

api("/client/card")
.then(setCard)
.catch(()=>console.log("Erreur carte"));

},[]);

return(

<div className="bank-app">

<Header data={{firstname:"",lastname:""}} />

<div className="cards-container">

<h2 className="cards-title">Ma carte bancaire</h2>

{card && <BankCard card={card}/>}

</div>

<BottomNav/>

</div>

)

}