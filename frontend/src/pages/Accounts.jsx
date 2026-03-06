import { Send, PlusCircle, Receipt } from "lucide-react";

export default function Accounts({ data }) {

return (

<div className="content">

<div className="account-card">

<div className="account-title">
Compte principal
</div>

<div className="balance">
{data.balance} €
</div>

<div className="balance-date">
Solde disponible
</div>

<div className="owner">
{data.firstname} {data.lastname}
</div>

<div className="iban">
{data.iban}
</div>

</div>

<div className="quick-actions">

<div className="action">
<Send size={22}/>
<span>Virement</span>
</div>

<div className="action">
<PlusCircle size={22}/>
<span>Ajouter</span>
</div>

<div className="action">
<Receipt size={22}/>
<span>Paiement</span>
</div>

</div>

</div>

);

}