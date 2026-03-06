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

<div className="action">Bonifico</div>
<div className="action">Ricarica</div>
<div className="action">CBill</div>

</div>

</div>

);

}