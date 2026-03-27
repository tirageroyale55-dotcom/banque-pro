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
  const [isCardVisible, setIsCardVisible] = useState(true);

  const navigate = useNavigate();
  const lastScrollRef = useRef(0);
  const contentRef = useRef(null);

  // 1. Chargement des données Initiales
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

  // 2. Gestion du Resize
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. Reset quand on change d'onglet
  useEffect(() => {
    setShowBalanceBar(false);
    // Reset le scroll selon le mode (Desktop ou Mobile)
    if (isDesktop && contentRef.current) {
      contentRef.current.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, [activeTab, isDesktop]);

  // 4. LOGIQUE DE DÉTECTION (OBSERVER + SCROLL)
  useEffect(() => {
    if (activeTab !== "accounts") return;

    // Observer pour savoir si la grosse carte solde est à l'écran
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCardVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    const target = document.querySelector(".account-card");
    if (target) observer.observe(target);

    // Fonction de Scroll unique
    const handleScroll = (e) => {
      // Récupère le scroll peu importe l'élément qui bouge (Window ou Div)
      const currentScroll = e.target.scrollTop || window.scrollY || document.documentElement.scrollTop;
      
      const isScrollingUp = currentScroll < lastScrollRef.current;

      // CONDITION PRO : La carte est sortie ET on remonte ET on n'est pas tout en haut
      if (!isCardVisible && isScrollingUp && currentScroll > 100) {
        setShowBalanceBar(true);
      } else {
        setShowBalanceBar(false);
      }

      lastScrollRef.current = currentScroll;
    };

    // On écoute avec 'true' pour capturer le scroll de n'importe quelle DIV (très important pour ton layout)
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeTab, isCardVisible]); // Se relance quand la visibilité de la carte change


  if (!data) return null;

  return (
    <div className="bank-app">
      {isDesktop && <Sidebar />}

      <div className={isDesktop ? "desktop-content" : ""}>
        <Header data={data} />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Barre de solde persistante au scroll */}
        <BalanceBar balance={data.balance} visible={showBalanceBar} />

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