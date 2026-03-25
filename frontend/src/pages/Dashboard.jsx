import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import BankCard from "../components/BankCard";

import { useRef } from "react"; // en haut

import Accounts from "./Accounts";

import "../styles/dashboard.css";

export default function Dashboard() {

const [data, setData] = useState(null);
const [activeTab, setActiveTab] = useState("accounts");
const [showBalanceBar, setShowBalanceBar] = useState(false);
const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
const [card,setCard] = useState(null);

const navigate = useNavigate();

const lastScrollRef = useRef(0);
const contentRef = useRef(null);

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

useEffect(()=>{
setShowBalanceBar(false)
window.scrollTo(0,0)
},[activeTab])


// Dans Dashboard.jsx, modifie le useEffect du scroll :

useEffect(() => {
  const handleScroll = () => {
    if (activeTab !== "accounts") {
      setShowBalanceBar(false);
      return;
    }

    // On récupère la position actuelle du scroll
    // Si contentRef est le scroll interne (desktop), on l'utilise, sinon window
    const currentScroll = isDesktop && contentRef.current 
      ? contentRef.current.scrollTop 
      : window.scrollY;

    // LOGIQUE DE DÉTECTION
    // 1. On scrolle vers le haut (current < last)
    // 2. On n'est pas tout en haut de la page (current > 50)
    const isScrollingUp = currentScroll < lastScrollRef.current;
    const isNotAtTop = currentScroll > 50;

    if (isScrollingUp && isNotAtTop) {
      setShowBalanceBar(true);
    } else {
      setShowBalanceBar(false);
    }

    lastScrollRef.current = currentScroll;
  };

  // On attache l'évenement au bon endroit
  const scrollEl = (isDesktop && contentRef.current) ? contentRef.current : window;
  
  scrollEl.addEventListener("scroll", handleScroll);
  return () => scrollEl.removeEventListener("scroll", handleScroll);
}, [activeTab, isDesktop]); // Ajoute isDesktop ici

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

<div className="page-content" ref={contentRef}>

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