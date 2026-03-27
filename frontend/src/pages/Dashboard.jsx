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

// Ajoute cette Ref en haut avec les autres
const observerRef = useRef(null);
const [isCardVisible, setIsCardVisible] = useState(true);

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
  // On crée un observateur qui surveille si la carte est à l'écran
  const observer = new IntersectionObserver(
    ([entry]) => {
      setIsCardVisible(entry.isIntersecting);
    },
    { threshold: 0 } // Se déclenche dès que le premier pixel sort
  );

  // On cible la carte de solde (qui est dans Accounts.jsx, ou on met une div invisible pour tester)
  const target = document.querySelector('.account-card');
  if (target) observer.observe(target);

  return () => observer.disconnect();
}, [activeTab]);

useEffect(() => {
  const handleScroll = (e) => {
    if (activeTab !== "accounts") return;

    const scrollTop = e.target.scrollTop || window.scrollY || document.documentElement.scrollTop;
    
    // CONDITION : La carte n'est plus visible ET on remonte
    const isScrollingUp = scrollTop < lastScrollRef.current;

    if (!isCardVisible && isScrollingUp && scrollTop > 100) {
      setShowBalanceBar(true);
    } else {
      setShowBalanceBar(false);
    }

    lastScrollRef.current = scrollTop;
  };

  // On écoute en mode "Capture" (le fameux true) pour capter le scroll des DIV internes
  window.addEventListener("scroll", handleScroll, true);
  return () => window.removeEventListener("scroll", handleScroll, true);
}, [isCardVisible, activeTab]);

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