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
Compte
</button>

<button
className={activeTab === "cards" ? "tab active" : "tab"}
onClick={() => setActiveTab("cards")}
>
<CreditCard size={16}/>
Cartes
</button>

<button
className={activeTab === "financing" ? "tab active" : "tab"}
onClick={() => setActiveTab("financing")}
>
<Wallet size={16}/>
Financement
</button>

</div>

</div>

);

}