import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

// Composants
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";

// Styles
import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);
  
  // États pour l'animation du Header/BalanceBar
  const [scrollOffset, setScrollOffset] = useState(-60);
  const [opacity, setOpacity] = useState(0);

  const navigate = useNavigate();
  const contentRef = useRef(null);

  // 1. Gestion du Responsive
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Chargement des données (Dashboard + Transactions)
  useEffect(() => {
    // On récupère les infos client
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);

        // On tente de charger les transactions (on gère l'erreur 404 ici discrètement)
        // On essaie /transaction (sans s) car c'est ce qui marche dans ton server.js
        api("/transaction") 
          .then((transactionsData) => {
            setData(prev => ({
              ...prev,
              transactions: transactionsData.transactions || transactionsData
            }));
          })
          .catch(err => console.log("Note: Historique non chargé via /transaction"));
      })
      .catch((err) => {
        console.error("Session expirée");
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // 3. Chargement des cartes si l'onglet change
  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card")
        .then(setCard)
        .catch(() => console.log("Erreur carte"));
    }
  }, [activeTab]);

  // 4. Reset du scroll quand on change d'onglet
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // 5. Logique de la BalanceBar (Sticky scroll)
  useEffect(() => {
    if (!data || activeTab !== "accounts") return;

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
  }, [activeTab, data]);

  if (!data) return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>BPER Banca : Connexion sécurisée...</p>
    </div>
  );

  return (
    <div className={isDesktop ? "bank-app-desktop" : "bank-app-mobile"}>
      
      {/* SIDEBAR : Fixe à gauche sur PC */}
      {isDesktop && <Sidebar data={data} />}

      {/* ZONE DE CONTENU PRINCIPALE */}
      <div className="main-wrapper">
        
        <Header data={data} />

        <div className="content-container">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <BalanceBar 
            balance={data.balance} 
            offset={scrollOffset} 
            opacity={opacity} 
          />

          <main className="page-content" ref={contentRef}>
            
            {/* ONGLET COMPTES */}
            {activeTab === "accounts" && <Accounts data={data} />}

            {/* ONGLET CARTES */}
            {activeTab === "cards" && (
              <div className="cards-section">
                <h3 className="cards-title">Mes cartes</h3>
                <div className="cards-slider">
                  {card && (
                    <div className="cards-slide">
                      <BankCard card={card}/>
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

            {/* ONGLET FINANCEMENT */}
            {activeTab === "financing" && (
              <div className="content">
                <div className="account-card">
                  <h3>Financements</h3>
                  <p>Aucun financement ou prêt en cours.</p>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      
      
    </div>
  );
}