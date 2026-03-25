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

  // 1. Chargement des données
  useEffect(() => {
    api("/client/card")
      .then(setCard)
      .catch(() => console.log("Erreur carte"));

    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  // 2. Gestion du Redimensionnement
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. Reset quand on change d'onglet
  useEffect(() => {
    setShowBalanceBar(false);
    // On remonte le scroll au changement d'onglet
    if (isDesktop && contentRef.current) {
      contentRef.current.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab, isDesktop]);

  // 4. LOGIQUE DU SCROLL (La correction est ici)
  useEffect(() => {
    const handleScroll = () => {
      // On ne montre la barre que sur l'onglet "accounts"
      if (activeTab !== "accounts") {
        setShowBalanceBar(false);
        return;
      }

      // Déterminer quelle source de scroll utiliser
      const currentScroll = (isDesktop && contentRef.current)
        ? contentRef.current.scrollTop
        : window.scrollY;

      // Seuil de déclenchement (pour ne pas l'afficher tout en haut)
      const threshold = 120; 

      // Condition : On remonte (current < last) ET on n'est pas tout en haut
      if (currentScroll < lastScrollRef.current && currentScroll > threshold) {
        setShowBalanceBar(true);
      } else {
        setShowBalanceBar(false);
      }

      lastScrollRef.current = currentScroll;
    };

    // L'élément à écouter dépend du mode Desktop/Mobile
    const scrollTarget = (isDesktop && contentRef.current) ? contentRef.current : window;

    scrollTarget.addEventListener("scroll", handleScroll);
    return () => scrollTarget.removeEventListener("scroll", handleScroll);
    
  }, [activeTab, isDesktop, data]); // On ajoute data pour recalculer si le contenu change

  if (!data) return null;

  return (
    <div className="bank-app">
      {isDesktop && <Sidebar />}

      <div className={isDesktop ? "desktop-content" : ""}>
        <Header data={data} />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <BalanceBar balance={data.balance} visible={showBalanceBar} />

        {/* Note: Sur desktop, cette div scrolle. Sur mobile, c'est le body */}
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