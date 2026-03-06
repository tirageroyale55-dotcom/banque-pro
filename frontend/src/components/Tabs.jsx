import { Landmark, CreditCard, Wallet } from "lucide-react";

export default function Tabs({ activeTab, setActiveTab }) {

return (

<div className="tabs-wrapper">

<div className="tabs">

<button
className={activeTab === "accounts" ? "tab active" : "tab"}
onClick={() => setActiveTab("accounts")}
>
<Landmark size={16}/>
Conti
</button>

<button
className={activeTab === "cards" ? "tab active" : "tab"}
onClick={() => setActiveTab("cards")}
>
<CreditCard size={16}/>
Carte
</button>

<button
className={activeTab === "financing" ? "tab active" : "tab"}
onClick={() => setActiveTab("financing")}
>
<Wallet size={16}/>
Finanziamenti
</button>

</div>

</div>

);

}