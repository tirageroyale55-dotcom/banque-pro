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

useEffect(() => {
  const bar = document.querySelector('.balance-bar');
  
  // SÉCURITÉ : Si on n'est pas sur accounts, on cache DIRECTEMENT la barre
  if (activeTab !== "accounts") {
    if (bar) bar.classList.remove('show');
    return; // On arrête tout ici
  }

  const handleScroll = () => {
    // On revérifie à l'intérieur du scroll par sécurité
    if (activeTab !== "accounts") return;

    const accountCard = document.querySelector('.account-card');
    if (!bar || !accountCard) return;

    // Détection de la position de la carte solde
    const cardRect = accountCard.getBoundingClientRect();
    const triggerPoint = 135; // Hauteur des Tabs

    // Si le haut de la carte dépasse les onglets, on montre la barre
    if (cardRect.top < triggerPoint) {
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
  };

  // On écoute le scroll
  window.addEventListener("scroll", handleScroll, true);
  
  // NETTOYAGE : Quand on change d'onglet ou qu'on quitte la page
  return () => {
    window.removeEventListener("scroll", handleScroll, true);
    if (bar) bar.classList.remove('show');
  };
}, [activeTab]); // TRÈS IMPORTANT : Le useEffect redémarre quand l'onglet change


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