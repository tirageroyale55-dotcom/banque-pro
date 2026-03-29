import { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminClient(){

const [clients,setClients] = useState([]);
const [selected,setSelected] = useState(null);

/* charger liste */

useEffect(()=>{

api("/admin/clients")
.then(setClients)

},[]);

/* charger détail */

const loadClient = (id) => {

api("/admin/client/"+id)
.then(setSelected)

};

/* ACTIONS */

const toggleAccount = async () => {

try{

const isBlocked = selected.account.status === "BLOCKED";

await api(
"/admin/account/" + (isBlocked ? "activate" : "block") + "/" + selected.account._id,
"POST"
);

loadClient(selected.user._id);

}catch(err){
console.error(err);
alert("Erreur compte ❌");
}

};

const toggleCard = async () => {

try{

const status = selected.card.status;

let action = "activate";

if(status === "active") action = "block";

await api(
"/admin/card/"+action+"/"+selected.card._id,
"POST"
);

loadClient(selected.user._id);

}catch(err){
console.error(err);
alert("Erreur carte ❌");
}

};

return(

<div className="admin-page">

<h1>Gestion des clients</h1>

{/* LISTE CLIENTS */}

<div className="admin-list">

{clients.map(c=>(
<div key={c._id} className="admin-user">

<div>
<b>{c.nom} {c.prenom}</b>
</div>

<button onClick={()=>loadClient(c._id)}>
Voir infos client
</button>

</div>
))}

</div>

{/* DETAILS */}

{selected && (

<div className="admin-details">

<h2>Détails client</h2>

<p><b>Nom :</b> {selected.user.nom} {selected.user.prenom}</p>
<p><b>Email :</b> {selected.user.email}</p>
<p><b>Status :</b> {selected.user.status}</p>

<h3>Compte</h3>

<p><b>IBAN :</b> {selected.account?.iban}</p>
<p><b>Solde :</b> {selected.account?.balance} €</p>
<p><b>Status :</b> {selected.account?.status}</p>

<button onClick={toggleAccount}>
{selected.account.status === "BLOCKED" ? "Activer compte" : "Bloquer compte"}
</button>

<h3>Carte</h3>

<p><b>Numéro :</b> **** **** **** {selected.card?.last4}</p>
<p><b>Status :</b> {selected.card?.status}</p>

<button onClick={toggleCard}>
{selected.card.status === "active" ? "Bloquer carte" : "Activer carte"}
</button>

</div>

)}

</div>

)

}