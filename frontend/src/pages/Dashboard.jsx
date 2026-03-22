import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import BankCard from "../components/BankCard";

import Accounts from "./Accounts";

import "../styles/dashboard.css";

export default function Dashboard() {

const [data, setData] = useState(null);
const [activeTab, setActiveTab] = useState("accounts");
const [showBalanceBar, setShowBalanceBar] = useState(false);
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
const [card,setCard] = useState(null);

const navigate = useNavigate();

useEffect(()=>{

api("/client/card")
.then(setCard)
.catch(()=>console.log("Erreur carte"));

},[]);

useEffect(() => {

api("/client/dashboard")
.then(setData)
.catch(() => {
localStorage.removeItem("token");
navigate("/login");
});

}, []);

useEffect(()=>{

const handleResize = () => {
setIsDesktop(window.innerWidth >= 1000);
};

window.addEventListener("resize", handleResize);

return () => window.removeEventListener("resize", handleResize);

},[]);

useEffect(() => {

  let lastScroll = 0;

  const handleScroll = () => {

    const container = document.querySelector(".page-content");

    // 🔥 détecte la vraie position scroll
    const currentScroll = container
      ? container.scrollTop
      : window.scrollY;

    if (activeTab !== "accounts") {
      setShowBalanceBar(false);
      return;
    }

    // 🔼 scroll vers le haut
    if (currentScroll < lastScroll && currentScroll > 50) {
      setShowBalanceBar(true);
    }
    // 🔽 scroll vers le bas
    else if (currentScroll > lastScroll) {
      setShowBalanceBar(false);
    }

    lastScroll = currentScroll;
  };

  // 🔥 écoute LES DEUX
  window.addEventListener("scroll", handleScroll);

  const container = document.querySelector(".page-content");
  if (container) {
    container.addEventListener("scroll", handleScroll);
  }

  return () => {
    window.removeEventListener("scroll", handleScroll);
    if (container) {
      container.removeEventListener("scroll", handleScroll);
    }
  };

}, [activeTab]);

if (!data) return null;

return (

<div className="bank-app">

{isDesktop && <Sidebar/>}

<div className={isDesktop ? "desktop-content" : ""}>

<Header data={data} />

<Tabs
activeTab={activeTab}
setActiveTab={setActiveTab}
/>

<BalanceBar
balance={data.balance}
visible={showBalanceBar}
/>

<div className="page-content">

{activeTab === "accounts" && <Accounts data={data}/>}

{activeTab === "cards" && (

<div className="cards-section">

<h3 className="cards-title">Mes cartes</h3>

<div className="cards-slider">

{card && (
<div className="cards-slide">
<BankCard card={card}/>
</div>
)}

<div
className="cards-slide card-request"
onClick={()=>navigate("/request-card")}
>

<div className="card-request-inner">
<div className="card-plus">+</div>
<p>Demander une carte</p>
</div>

</div>

</div>

</div>

)}

{activeTab === "financing" && (
<div className="content">
<div className="account-card">
<h3>Financements</h3>
<p>Aucun financement disponible</p>
</div>
</div>
)}

</div>

</div>

{!isDesktop && <BottomNav/>}

</div>

);

}