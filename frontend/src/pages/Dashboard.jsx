import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, Bell, User } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import Header from "../components/Header";
import Tabs from "../components/Tabs";
import BalanceBar from "../components/BalanceBar";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";
import Accounts from "./Accounts";
import Profile from "./Profile";

import "../styles/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [showIban, setShowIban] = useState(false);

  const navigate = useNavigate();

  const formatBper = (amount) => {
    return new Intl.NumberFormat("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/client/dashboard")
      .then((clientData) => {
        setData(clientData);
        api("/transactions").then((tx) => {
          setData(prev => ({ ...prev, transactions: tx.transactions || tx }));
        });
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [navigate]);

  if (!data) return null;

  // Préparation du Graphique (Analyse des flux)
  const rawTransactions = data.transactions || [];
  const grouped = {};
  rawTransactions.forEach((tx) => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString("fr-FR");
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    tx.type === "CREDIT" ? (grouped[dateKey].in += tx.amount) : (grouped[dateKey].out += Math.abs(tx.amount));
  });

  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split("/").reverse().join("-")) - new Date(b.split("/").reverse().join("-")));

  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a", borderRadius: 4 },
      { label: "Sorties", data: dates.map(d => grouped[d].out), backgroundColor: "#dc2626", borderRadius: 4 }
    ],
  };

  if (isDesktop) {
    return (
      <div className="bper-desktop-layout">
        {/* SIDEBAR GAUCHE (Selon ton plan) */}
        <aside className="bper-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-nav">
            <div className={`nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>Accueil</div>
            <div className="nav-item">Cartes</div>
            <div className="nav-item">Payer</div>
            <div className="nav-item">Produits</div>
            <div className="nav-item">Lifestyle</div>
            <div className="nav-item">Aide</div>
          </nav>
        </aside>

        {/* CONTENU DROITE */}
        <main className="bper-content">
          {/* HEADER AVEC NOTIF ET PROFIL (En haut à droite sur ton plan) */}
          <header className="content-header">
            <div className="welcome-text">
              Bienvenue, <span>{data.firstName} {data.lastName}</span>
            </div>
            <div className="header-icons">
              <div className="icon-box"><Bell size={20} /></div>
              <div className="icon-box profile" onClick={() => setActiveTab('profile')}><User size={20} /></div>
            </div>
          </header>

          <div className="scroll-container">
            {/* SECTION SOLDE (Le grand rectangle du haut) */}
            <section className="widget-card solde-card">
              <div className="solde-info">
                <p>Solde disponible 👁️</p>
                <h2>{formatBper(data.balance)} €</h2>
              </div>
              <div className="actions-row">
                <button className="btn-pill" onClick={() => setShowIban(!showIban)}>
                  {showIban ? data.iban : "Voir mon IBAN"}
                </button>
                <button className="btn-pill accent" onClick={() => navigate("/virement-international")}>
                  🚀 Effectuer un virement
                </button>
                <button className="btn-pill">Voir ma carte virtuelle</button>
              </div>
            </section>

            {/* SECTION HISTORIQUE (Le rectangle du milieu) */}
            <section className="widget-card">
              <div className="section-title">
                <span>≡</span> Historique des transactions
              </div>
              <div className="tx-list">
                {rawTransactions.slice(0, 5).map((tx, i) => (
                  <div key={i} className="tx-item">
                    <div className="tx-left">
                      <div className={`tx-icon ${tx.type.toLowerCase()}`}>
                        {tx.type === "CREDIT" ? <PlusCircle size={16}/> : <Send size={16}/>}
                      </div>
                      <div>
                        <p className="tx-label">{tx.label}</p>
                        <p className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`tx-amount ${tx.type.toLowerCase()}`}>
                      {tx.type === "CREDIT" ? "+" : "-"}{tx.amount} €
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION GRAPHIQUE (Le rectangle "les graf ici" en bas) */}
            <section className="widget-card">
              <div className="section-title">Analyse des flux</div>
              <div style={{ height: "250px" }}>
                <Bar data={barData} options={{ maintainAspectRatio: false }} />
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  // --- RENDU MOBILE ---
  return (
    <div className="bank-app">
      <Header data={data} />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <BalanceBar balance={data.balance} />
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data} />}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav />
    </div>
  );
}