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

if(activeTab === "cards"){

api("/client/card")
.then(setCard)
.catch(()=>console.log("Erreur carte"));

}

},[activeTab]);

useEffect(() => {
  // 1. On récupère d'abord les infos de base (obligatoire)
  api("/client/dashboard")
    .then((clientData) => {
      setData(clientData); // On affiche déjà le dashboard

      // 2. On tente de charger les transactions APRES (optionnel)
      api("/transactions")
        .then((transactionsData) => {
          setData(prev => ({
            ...prev,
            transactions: transactionsData.transactions || transactionsData // Gère les deux formats
          }));
        })
        .catch(err => console.error("L'historique n'a pas pu être chargé :", err));
    })
    .catch((err) => {
      // Uniquement si le profil échoue, on redirige
      console.error("Session expirée ou erreur profil");
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
  // On ne fait rien si les données ne sont pas encore chargées
  if (!data || activeTab !== "accounts") {
    const bar = document.querySelector('.balance-bar');
    if (bar) bar.classList.remove('show');
    return;
  }

  const handleScroll = () => {
    const bar = document.querySelector('.balance-bar');
    const accountCard = document.querySelector('.account-card');
    
    // Si la carte n'est pas encore là (chargement API), on sort
    if (!bar || !accountCard) return;

    const cardRect = accountCard.getBoundingClientRect();
    const triggerPoint = 135; 

    if (cardRect.top < triggerPoint) {
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
  };

  // On attache l'évenement
  window.addEventListener("scroll", handleScroll, true);
  
  // On l'exécute une fois au montage pour vérifier la position actuelle
  handleScroll();

  return () => {
    window.removeEventListener("scroll", handleScroll, true);
  };
}, [activeTab, data]); // <--- AJOUTE 'data' ICI


if (!data) return null;

return (

<div className="bank-app">
  {isDesktop && <Sidebar data={data} />}
  <div className="desktop-content">
    <Header data={data} />
    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

<BalanceBar 
  balance={data.balance} 
  offset={scrollOffset} 
  opacity={opacity} 
/>

<div className="page-content">

{activeTab === "accounts" && <Accounts data={data}/>}

{activeTab === "profile" && <Profile data={data} />}

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