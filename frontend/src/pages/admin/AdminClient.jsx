import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";

export default function AdminClient(){

const { id } = useParams();

const [data,setData] = useState(null);

const loadClient = () => {

api("/admin/client/"+id)
.then(setData)
.catch(()=>alert("Erreur chargement"));

};

useEffect(()=>{

loadClient();

},[]);


const activateCard = async () => {

await api("/admin/card/activate/"+data.card._id,{method:"POST"});

loadClient();

};

const blockCard = async () => {

await api("/admin/card/block/"+data.card._id,{method:"POST"});

loadClient();

};

const blockAccount = async () => {

await api("/admin/account/block/"+data.account._id,{method:"POST"});

loadClient();

};

const activateAccount = async () => {

await api("/admin/account/activate/"+data.account._id,{method:"POST"});

loadClient();

};


if(!data) return <p>Chargement...</p>;

return(

<div className="admin-page">

<h1>Gestion Client</h1>

{/* CLIENT */}

<div className="admin-card">

<h2>Informations client</h2>

<p><b>Nom :</b> {data.user.nom}</p>
<p><b>Email :</b> {data.user.email}</p>
<p><b>ID Personnel :</b> {data.user.personalId}</p>

</div>


{/* COMPTE */}

<div className="admin-card">

<h2>Compte bancaire</h2>

<p><b>IBAN :</b> {data.account?.iban}</p>

<p><b>Solde :</b> {data.account?.balance} €</p>

<p><b>Status :</b> {data.account?.status}</p>

<div className="admin-actions">

<button onClick={activateAccount}>
Activer compte
</button>

<button onClick={blockAccount}>
Bloquer compte
</button>

</div>

</div>


{/* CARTE */}

<div className="admin-card">

<h2>Carte bancaire</h2>

<p><b>Numéro :</b> **** **** **** {data.card?.last4}</p>

<p><b>Status :</b> {data.card?.status}</p>

<div className="admin-actions">

<button onClick={activateCard}>
Activer carte
</button>

<button onClick={blockCard}>
Bloquer carte
</button>

</div>

</div>

</div>

)

}