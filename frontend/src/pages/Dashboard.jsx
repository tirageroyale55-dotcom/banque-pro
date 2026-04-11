import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import Accounts from "./Accounts";
import BankCard from "../components/BankCard";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    api("/client/dashboard")
      .then(setData)
      .catch(() => navigate("/login"));
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  if (!data) return <div className="loader">Chargement...</div>;

  return (
    <div className={isDesktop ? "bper-desktop-layout" : "bper-mobile-layout"}>
      
      {/* SIDEBAR : Fixe à gauche sur PC */}
      {isDesktop && <Sidebar data={data} />}

      <div className="bper-main-content">
        <Header data={data} />
        
        <div className="bper-scroll-area">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <BalanceBar balance={data.balance} />

          <main className="bper-page-body">
            {activeTab === "accounts" && <Accounts data={data} />}
            {activeTab === "cards" && (
              <div className="cards-section">
                 <h3 style={{color: 'white', padding: '20px'}}>Mes cartes</h3>
                 {/* Ton slider de cartes ici */}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* NAV BASSE : Uniquement sur Mobile */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}