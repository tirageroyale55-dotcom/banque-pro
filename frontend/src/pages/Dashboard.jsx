import { useState, useEffect, useRef } from "react"; // Ajout de useRef ici
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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);

  const navigate = useNavigate();
  const contentRef = useRef(null);

  // Gestion du redimensionnement (Unique et propre)
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Chargement des données API
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

  // Chargement des cartes
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

  // Si les données ne sont pas chargées, on affiche un petit message ou rien (mais pas d'erreur)
  if (!data) return <div style={{color: 'white', padding: '20px'}}>Chargement...</div>;

  return (
    <div className="bank-app">
      {/* SIDEBAR : Uniquement sur Desktop */}
      {isDesktop && <Sidebar />}

      <div className={isDesktop ? "desktop-content" : ""}>
        <Header data={data} />
        
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <BalanceBar balance={data.balance} />

        <div className="page-content" ref={contentRef}>
          {activeTab === "accounts" && <Accounts data={data} />}
          
          {/* Correction ici : Assurez-vous que le composant Profile est importé s'il existe */}
          {activeTab === "profile" && <div className="content">Mon Profil</div>}

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

      {/* BOTTOM NAV : Uniquement sur Mobile */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}