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

const [scrollOffset, setScrollOffset] = useState(-60); // Cachée par défaut
const [opacity, setOpacity] = useState(0);

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


// Remplace ton useEffect de scroll par celui-ci
useEffect(() => {
  const handleScroll = (e) => {
    if (activeTab !== "accounts") return;

    // Récupération ultra-rapide du scroll
    const st = e.target.scrollTop || window.scrollY || document.documentElement.scrollTop;

    // RÉGLAGE DE LA SENSIBILITÉ :
    // La barre commence à sortir à 150px et est à fond à 220px.
    const start = 150; 
    const end = 220;

    if (st > start) {
      // On calcule un ratio entre 0 et 1
      const travel = Math.min((st - start) / (end - start), 1);
      
      // On déplace la barre de -50px (cachée) à 0px (visible) en temps réel
      const translateY = -50 + (50 * travel);
      const opacity = travel;

      // On applique directement au DOM pour éviter le lag du cycle de rendu React
      const bar = document.querySelector('.balance-bar');
      if (bar) {
        bar.style.transform = `translateY(${translateY}px)`;
        bar.style.opacity = opacity;
        bar.style.pointerEvents = travel > 0.5 ? 'auto' : 'none';
      }
    } else {
      const bar = document.querySelector('.balance-bar');
      if (bar) {
        bar.style.transform = `translateY(-50px)`;
        bar.style.opacity = 0;
      }
    }
  };

  window.addEventListener("scroll", handleScroll, true);
  return () => window.removeEventListener("scroll", handleScroll, true);
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
  offset={scrollOffset} 
  opacity={opacity} 
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