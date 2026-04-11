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
  
  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Gestion du Responsive
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Chargement des données
  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transaction") 
          .then((transactionsData) => {
            setData(prev => ({
              ...prev,
              transactions: transactionsData.transactions || transactionsData
            }));
          })
          .catch(() => console.log("Historique non chargé"));
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "cards") {
      api("/client/card").then(setCard).catch(() => {});
    }
  }, [activeTab]);

  if (!data) return <div className="loader">Chargement...</div>;

  return (
    <div className={isDesktop ? "app-layout-desktop" : "app-layout-mobile"}>
      
      {/* 1. SIDEBAR : Elle est ici et nulle part ailleurs */}
      {isDesktop && <Sidebar data={data} />}

      {/* 2. CONTENU PRINCIPAL */}
      <div className="main-viewport">
        
        <Header data={data} />

        <div className="scrollable-content">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <BalanceBar balance={data.balance} />

          <main className="page-body" ref={contentRef}>
            {activeTab === "accounts" && <Accounts data={data} />}

            {activeTab === "cards" && (
              <div className="cards-section">
                <h3 className="cards-title">Mes cartes</h3>
                <div className="cards-slider">
                  {card && <BankCard card={card}/>}
                  <div className="card-request" onClick={() => navigate("/request-card")}>
                    <div className="card-request-inner">
                      <span>+</span>
                      <p>Demander une carte</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "financing" && (
              <div className="account-card">
                <h3>Financements</h3>
                <p>Aucun prêt en cours.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 3. MOBILE NAV : N'apparaît JAMAIS sur ordinateur */}
      {!isDesktop && <BottomNav />}
      
    </div>
  );
}