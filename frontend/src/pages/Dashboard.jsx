import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

// Imports des composants
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
// Assurez-vous que Profile est bien importé pour éviter l'écran vide
import Profile from "./Profile"; 

import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(-60);
  const [opacity, setOpacity] = useState(0);

  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Gestion de la taille de l'écran
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Chargement des données initiales
  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transactions")
          .then((transactionsData) => {
            setData(prev => ({
              ...prev,
              transactions: transactionsData.transactions || transactionsData
            }));
          })
          .catch(err => console.error("Erreur transactions:", err));
      })
      .catch((err) => {
        console.error("Session expirée");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // Chargement des cartes si l'onglet est actif
  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card")
        .then(setCard)
        .catch(() => console.log("Erreur carte"));
    }
  }, [activeTab]);

  // Reset scroll quand on change d'onglet
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Gestion de la BalanceBar (Uniquement Mobile)
  useEffect(() => {
    if (!data || activeTab !== "accounts" || isDesktop) return;

    const handleScroll = () => {
      const bar = document.querySelector('.balance-bar');
      const accountCard = document.querySelector('.account-card');
      if (!bar || !accountCard) return;

      const cardRect = accountCard.getBoundingClientRect();
      if (cardRect.top < 135) {
        bar.classList.add('show');
      } else {
        bar.classList.remove('show');
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [activeTab, data, isDesktop]);

  if (!data) return <div style={{color: 'white', padding: '20px'}}>Chargement...</div>;

  return (
    <div className="bank-app">
      {/* 1. SIDEBAR : Uniquement sur Desktop */}
      {isDesktop && <Sidebar />}

      {/* 2. ZONE DE CONTENU PRINCIPALE */}
      <div className={isDesktop ? "desktop-content" : "mobile-layout"}>
        
        {/* IMPORTANT : On affiche le Header et les Tabs ici. 
          Sur Desktop, ils se rangeront à droite de la Sidebar grâce au CSS.
          Sur Mobile, ils resteront en haut.
        */}
        <Header data={data} />
        
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* BalanceBar : Uniquement sur Mobile (supprimée du Desktop pour le propre) */}
        {!isDesktop && (
          <BalanceBar 
            balance={data.balance} 
            offset={scrollOffset} 
            opacity={opacity} 
          />
        )}

        <div className="page-content" ref={contentRef}>
          {activeTab === "accounts" && <Accounts data={data} />}
          
          {activeTab === "profile" && <Profile data={data} />}

          {activeTab === "cards" && (
            <div className="cards-section">
              <h3 className="cards-title">Mes cartes</h3>
              <div className="cards-slider">
                {card && (
                  <div className="cards-slide">
                    <BankCard card={card} />
                  </div>
                )}
                <div className="cards-slide card-request" onClick={() => navigate("/request-card")}>
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

      {/* 3. NAVIGATION BASSE : Uniquement sur Mobile */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}