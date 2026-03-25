import { useState, useEffect, useRef } from "react";
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
  const [showBalanceBar, setShowBalanceBar] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);

  const navigate = useNavigate();
  const lastScrollRef = useRef(0);
  const contentRef = useRef(null);

  // Charger les données de la carte
  useEffect(() => {
    api("/client/card")
      .then(setCard)
      .catch(() => console.log("Erreur carte"));
  }, []);

  // Charger les données du dashboard
  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // Gestion du Redimensionnement
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset de la barre au changement d'onglet
  useEffect(() => {
    setShowBalanceBar(false);
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Logique du Scroll pour la BalanceBar
  useEffect(() => {
    const handleScroll = () => {
      // On n'affiche la barre que sur l'onglet "comptes"
      if (activeTab !== "accounts") {
        setShowBalanceBar(false);
        return;
      }

      const currentScroll = window.scrollY;

      // 🔥 APPARAÎT QUAND ON REMONTE (et qu'on a dépassé 100px)
      if (currentScroll < lastScrollRef.current && currentScroll > 100) {
        setShowBalanceBar(true);
      } else {
        setShowBalanceBar(false);
      }

      lastScrollRef.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  if (!data) return null;

  return (
    <div className="bank-app">
      {isDesktop && <Sidebar />}

      <div className={isDesktop ? "desktop-content" : ""}>
        <Header data={data} />

        {/* --- CONTENEUR FIXE (Tabs + BalanceBar) --- */}
        <div className="sticky-header-container">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <BalanceBar balance={data.balance} visible={showBalanceBar} />
        </div>

        <div className="page-content" ref={contentRef}>
          {activeTab === "accounts" && <Accounts data={data} />}

          {activeTab === "cards" && (
            <div className="cards-section">
              <h3 className="cards-title">Mes cartes</h3>
              <div className="cards-slider">
                {card && (
                  <div className="cards-slide">
                    <BankCard card={card} />
                  </div>
                )}
                <div
                  className="cards-slide card-request"
                  onClick={() => navigate("/request-card")}
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

      {!isDesktop && <BottomNav />}
    </div>
  );
}