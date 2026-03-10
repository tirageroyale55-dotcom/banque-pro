import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";

import Accounts from "./Accounts";

import "../styles/dashboard.css";

export default function Dashboard(){

const [data,setData] = useState(null);

const [activeTab,setActiveTab] = useState("accounts");

const [showBalanceBar,setShowBalanceBar] = useState(false);

const navigate = useNavigate();

useEffect(()=>{

api("/client/dashboard")
.then(setData)
.catch(()=>{
localStorage.removeItem("token");
navigate("/login");
});

},[]);

if(!data) return null;

return(

<div className="bank-app">

<div className="desktop-layout">

{/* SIDEBAR */}

<aside className="sidebar">

<div className="sidebar-profile">

<div className="avatar">
{data.name?.charAt(0)}
</div>

<div className="profile-info">
<strong>{data.name}</strong>
<span>Client</span>
</div>

</div>


<div className="sidebar-tabs">

<button
className={activeTab==="accounts"?"side-btn active":"side-btn"}
onClick={()=>setActiveTab("accounts")}
>
Comptes
</button>

<button
className={activeTab==="cards"?"side-btn active":"side-btn"}
onClick={()=>setActiveTab("cards")}
>
Cartes
</button>

<button
className={activeTab==="financing"?"side-btn active":"side-btn"}
onClick={()=>setActiveTab("financing")}
>
Financements
</button>

</div>

<BottomNav/>

</aside>


{/* MAIN */}

<div className="main-area">

<Header data={data}/>

<BalanceBar
balance={data.balance}
visible={showBalanceBar}
/>

<div className="page-content">

{activeTab==="accounts" && <Accounts data={data}/>}

{activeTab==="cards" && (

<div className="content">
<div className="account-card">
<h3>Mes cartes</h3>
<p>Aucune carte active</p>
</div>
</div>

)}

{activeTab==="financing" && (

<div className="content">
<div className="account-card">
<h3>Financements</h3>
<p>Aucun financement disponible</p>
</div>
</div>

)}

</div>

</div>

</div>

</div>

);

}