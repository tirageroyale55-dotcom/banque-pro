export default function BankCard({card}){

const formatNumber=(num)=>{
if(!num) return "**** **** **** ****"
return num.replace(/(.{4})/g,"$1 ").trim()
}

return(

<div className="bank-card">

<div className="card-top">

<div className="chip"></div>

<div className="bank-logo">
BPER
</div>

</div>

<div className="card-number">
{formatNumber(card.number)}
</div>

<div className="card-bottom">

<div>
<span>TITULAIRE</span>
<strong>{card.holder}</strong>
</div>

<div>
<span>EXP</span>
<strong>{card.exp}</strong>
</div>

</div>

</div>

)

}