import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Send, PlusCircle, Filter, Bell, User } from "lucide-react";

// Imports pour les graphiques
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("accounts");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [showIban, setShowIban] = useState(false);
  const navigate = useNavigate();

  const formatBper = (amount) => {
    return new Intl.NumberFormat("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api("/client/dashboard").then((clientData) => {
      setData(clientData);
      api("/transactions").then((txData) => {
        setData(prev => ({ ...prev, transactions: txData.transactions || txData }));
      });
    }).catch(() => { navigate("/login"); });
  }, [navigate]);

  if (!data) return null;

  // --- LOGIQUE DES GRAPHIQUES ---
  const rawTransactions = data.transactions || [];
  const grouped = {};
  rawTransactions.forEach((tx) => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString("fr-FR");
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0, balance: 0 };
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });

  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split("/").reverse().join("-")) - new Date(b.split("/").reverse().join("-")));

  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a", borderRadius: 4 },
      { label: "Sorties", data: dates.map(d => grouped[d].out), backgroundColor: "#dc2626", borderRadius: 4 }
    ]
  };

  const lineData = {
    labels: dates,
    datasets: [{ label: "Évolution Solde", data: dates.map((_, i) => data.balance - (i * 10)), borderColor: "#0b5c5b", tension: 0.3, fill: false }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  // --- RENDU DESKTOP (Basé sur ton dessin) ---
  if (isDesktop) {
    return (
      <div className="bper-desktop-layout">
        {/* SIDEBAR GAUCHE */}
        <aside className="bper-sidebar">
          <div className="sidebar-logo">BPER</div>
          <nav className="sidebar-menu">
            <div className="menu-item active" onClick={() => setActiveTab("accounts")}>Accueil</div>
            <div className="menu-item">Cartes</div>
            <div className="menu-item">Payer</div>
            <div className="menu-item">Produits</div>
            <div className="menu-item">Lifestyle</div>
            <div className="menu-item">Aide</div>
          </nav>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="bper-main">
          <header className="bper-top-nav">
            <div className="welcome-text">
              Bienvenue, <span className="user-name">{data.firstName} {data.lastName}</span>
            </div>
            <div className="top-icons">
              <div className="icon-box"><Bell size={20} /></div>
              <div className="icon-box profile-circle" onClick={() => setActiveTab("profile")}><User size={20} /></div>
            </div>
          </header>

          <div className="dashboard-scrollable">
            {/* CARTE SOLDE (Centre) */}
            <section className="bper-hero-card">
              <div className="solde-header">
                <p>Solde disponible 👁️</p>
                <h2>{formatBper(data.balance)} €</h2>
              </div>
              <div className="solde-actions">
                <button onClick={() => setShowIban(!showIban)}>{showIban ? data.iban : "Voir mon IBAN"}</button>
                <button className="btn-active" onClick={() => navigate("/virement-international")}>Effectuer un virement</button>
                <button>Voir ma carte virtuelle</button>
              </div>
            </section>

            {/* HISTORIQUE */}
            <section className="bper-history-section">
              <div className="section-title">
                <span>≡</span> Historique des transactions
              </div>
              <div className="transactions-mini-list">
                {rawTransactions.slice(0, 5).map((tr, i) => (
                  <div key={i} className="tr-row">
                    <span>{tr.label}</span>
                    <span className={tr.type === "CREDIT" ? "plus" : "minus"}>
                      {tr.type === "CREDIT" ? "+" : "-"}{tr.amount} €
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ZONE DES GRAPHES (Côte à côte comme sur le dessin) */}
            <div className="charts-grid">
              <div className="chart-container">
                <p>Flux monétaires</p>
                <div className="canvas-wrapper"><Bar data={barData} options={chartOptions} /></div>
              </div>
              <div className="chart-container">
                <p>Évolution du solde</p>
                <div className="canvas-wrapper"><Line data={lineData} options={chartOptions} /></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- RENDU MOBILE (INCHANGÉ) ---
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