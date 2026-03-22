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
  const pageContentRef = useRef(null); // ← pour scroll desktop

  // Charger les cartes
  useEffect(() => {
    api("/client/card").then(setCard).catch(() => console.log("Erreur carte"));
  }, []);

  // Charger dashboard
  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, []);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset BalanceBar à chaque changement d'onglet
  useEffect(() => {
    setShowBalanceBar(false);
    if (!isDesktop) window.scrollTo(0, 0);
  }, [activeTab, isDesktop]);

  // Scroll listener
  useEffect(() => {
    if (!data) return;

    const scrollContainer = isDesktop ? pageContentRef.current : window;

    const handleScroll = () => {
      const scrollTop = isDesktop
        ? scrollContainer.scrollTop
        : window.scrollY;

      // Affiche BalanceBar si on scroll de plus de 160px sur l'onglet Comptes
      if (activeTab === "accounts" && scrollTop > 160) {
        setShowBalanceBar(true);
      } else {
        setShowBalanceBar(false);
      }
    };

    // Ajouter listener
    scrollContainer.addEventListener("scroll", handleScroll);

    // Trigger initial check
    handleScroll();

    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [activeTab, isDesktop, data]);

  if (!data) return null;

  return (
    <div className="bank-app">
      {isDesktop && <Sidebar />}

      <div className={isDesktop ? "desktop-content" : ""} ref={pageContentRef}>
        <Header data={data} />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* BalanceBar toujours sous Tabs */}
        <BalanceBar balance={data.balance} visible={showBalanceBar} />

        <div className="page-content">
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