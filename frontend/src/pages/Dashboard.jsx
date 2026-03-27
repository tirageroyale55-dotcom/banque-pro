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
// Crée une ref pour la barre en haut de ton composant
const balanceBarRef = useRef(null);

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
  const handleScroll = (e) => {
    if (activeTab !== "accounts") return;

    // Récupération du scroll (compatible tout support)
    const st = e.target.scrollTop || window.scrollY || document.documentElement.scrollTop;
    const bar = document.querySelector('.balance-bar');
    if (!bar) return;

    // 1. On calcule la direction (Ancien scroll - Nouveau scroll)
    const isScrollingUp = st < lastScrollRef.current;
    
    // 2. SEUIL DE SÉCURITÉ : On ne montre pas la barre si on est tout en haut 
    // pour ne pas cacher la grosse carte de solde.
    const isTooHigh = st < 120;

    // 3. ACTION : Si on remonte ET qu'on n'est pas tout en haut -> Affiche
    if (isScrollingUp && !isTooHigh) {
      bar.classList.add('show');
    } 
    // Si on descend OU qu'on revient tout en haut -> Cache
    else {
      bar.classList.remove('show');
    }

    // On met à jour la position pour le prochain calcul
    lastScrollRef.current = st;
  };

  // On utilise 'true' pour capturer le scroll sans délai
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