import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import BankCard from "../components/BankCard";

import Accounts from "./Accounts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [showBalanceBar, setShowBalanceBar] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [card, setCard] = useState(null);

  const navigate = useNavigate();

  // Charger la carte
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

  // Scroll listener **mobile seulement**
  useEffect(() => {
    if (isDesktop) return; // desktop ignore le BalanceBar

    const handleScroll = () => {
      if (activeTab === "accounts" && window.scrollY > 160) {
        setShowBalanceBar(true);
      } else {
        setShowBalanceBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // check initial

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, isDesktop]);

  if (!data) return null;

  return (
    <div className="bank-app">
      {isDesktop && <Sidebar />}

      <div className={isDesktop ? "desktop-content" : ""}>
        <Header data={data} />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* BalanceBar mobile seulement */}
        {!isDesktop && <BalanceBar balance={data.balance} visible={showBalanceBar} />}

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