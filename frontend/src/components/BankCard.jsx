export default function BankCard({card}){

const formatNumber=(num)=>{
if(!num) return "•••• •••• •••• ••••";
return num.replace(/(.{4})/g,"$1 ").trim();
}

return(

<div className="bank-card">

<div className="card-header">
<span className="bank-name">BPER</span>
</div>

<div className="card-number">
{formatNumber(card.number)}
</div>

<div className="card-footer">

<div className="card-holder">
<span>Titulaire</span>
<strong>{card.holder}</strong>
</div>

<div className="card-exp">
<span>Expiration</span>
<strong>{card.exp}</strong>
</div>

</div>

</div>

)

}