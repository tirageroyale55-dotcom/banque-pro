import {
Send,
Smartphone,
Receipt
} from "lucide-react";

export default function Accounts({ data }) {

return (

<div className="content">

<div className="account-label">
Conto {data.iban.slice(-6)}
</div>

<div className="account-card">

<div className="balance">
{data.balance} €
</div>

<div className="balance-date">
Saldo disponibile al 06/03/2026
</div>

<div className="bank-name">
Di Genaro Gervasio
</div>

<div className="iban">
{data.iban}
</div>

</div>

<div className="quick-actions">

<div className="action">
<Send size={22}/>
<span>Bonifico ordinario</span>
</div>

<div className="action">
<Smartphone size={22}/>
<span>Ricarica telefonica</span>
</div>

<div className="action">
<Receipt size={22}/>
<span>CBill e pagoPA</span>
</div>

</div>

<div className="transactions">

<h3>ULTIMI MOVIMENTI</h3>

<div className="tx">
<div>
<strong>02</strong>
<span>mar</span>
</div>

<div className="tx-info">
COMPETENZE DARE AUTORIZZATE
</div>

<div className="tx-amount">
-26,69 €
</div>
</div>

<div className="tx">
<div>
<strong>07</strong>
<span>gen</span>
</div>

<div className="tx-info">
COMPETENZE SPESE ED ONERI
</div>

<div className="tx-amount">
-19,20 €
</div>
</div>

</div>

</div>

);

}