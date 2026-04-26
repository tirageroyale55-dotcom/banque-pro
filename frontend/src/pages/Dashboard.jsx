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
  LineElement,
  PointElement,
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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

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
        api("/transactions").then((txData) => {
          setData(prev => ({ ...prev, transactions: txData.transactions || txData }));
        });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  if (!data) return null;

  // --- LOGIQUE DES GRAPHS ---
  const rawTransactions = data.transactions || [];
  const grouped = {};
  rawTransactions.forEach((tx) => {
    const dateKey = new Date(tx.createdAt).toLocaleDateString("fr-FR");
    if (!grouped[dateKey]) grouped[dateKey] = { in: 0, out: 0 };
    if (tx.type === "CREDIT") grouped[dateKey].in += tx.amount;
    else grouped[dateKey].out += Math.abs(tx.amount);
  });

  const dates = Object.keys(grouped).sort((a, b) => new Date(a.split("/").reverse().join("-")) - new Date(b.split("/").reverse().join("-")));

  const barData = {
    labels: dates,
    datasets: [
      { label: "Entrées", data: dates.map(d => grouped[d].in), backgroundColor: "#16a34a" },
      { label: "Sorties", data: dates.map(d => grouped[d].out), backgroundColor: "#dc2626" }
    ]
  };

  // --- RENDU DESKTOP (Basé sur ton plan) ---
  if (isDesktop) {
    return (
      <div className="bper-desktop-layout">
        {/* SIDEBAR GAUCHE */}
        <aside className="bper-sidebar">
          <div className="bper-logo">BPER</div>
          <nav className="bper-nav">
            <div className="nav-item active">Accueil</div>
            <div className="nav-item">Cartes</div>
            <div className="nav-item">Payer</div>
            <div className="nav-item">Produits</div>
            <div className="nav-item">Lifestyle</div>
            <div className="nav-item">Aide</div>
          </nav>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <main className="bper-main">
          {/* HEADER AVEC BIENVENUE ET ICONES A DROITE */}
          <header className="bper-top-bar">
            <div className="welcome-text">
              Bienvenue, <span>{data.firstName} {data.lastName}</span>
            </div>
            <div className="header-icons">
              <div className="icon-box"><Bell size={20} /></div>
              <div className="icon-box" onClick={() => setActiveTab('profile')}><User size={20} /></div>
            </div>
          </header>

          <div className="bper-content-scroll">
            {/* SECTION SOLDE DISPONIBLE */}
            <section className="bper-card-white balance-section">
              <div className="balance-header">
                <p>Solde disponible <span className="eye-icon">👁️</span></p>
                <h2>{formatBper(data.balance)} €</h2>
              </div>
              <div className="action-buttons">
                <button className="btn-outline" onClick={() => setShowIban(!showIban)}>
                  {showIban ? data.iban : "Voir mon IBAN"}
                </button>
                <button className="btn-filled" onClick={() => navigate("/virement-international")}>
                  <Send size={16} /> Effectuer un virement
                </button>
                <button className="btn-outline">Voir ma carte virtuelle</button>
              </div>
            </section>

            {/* SECTION HISTORIQUE (PLEINE LARGEUR) */}
            <section className="bper-card-white history-section">
              <div className="section-title">
                <span>≡</span> Historique des transactions
              </div>
              <div className="tx-list">
                {rawTransactions.map((tx, i) => (
                  <div key={i} className="tx-item">
                    <div className="tx-info">
                      <div className="tx-icon">{tx.type === "CREDIT" ? <PlusCircle size={18} color="#16a34a"/> : <Send size={18}/>}</div>
                      <div>
                        <div className="tx-label">{tx.label}</div>
                        <div className="tx-date">{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`tx-amount ${tx.type === 'CREDIT' ? 'plus' : 'minus'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount.toLocaleString()} €
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION GRAPHS (DEUX COLONNES EN BAS) */}
            <div className="graphs-grid">
              <div className="bper-card-white graph-box">
                <h4>Flux de trésorerie</h4>
                <div style={{height: '200px'}}><Bar data={barData} options={{maintainAspectRatio: false}} /></div>
              </div>
              <div className="bper-card-white graph-box">
                <h4>Analyse débit/crédit</h4>
                <div style={{height: '200px'}}><Line data={{labels: dates, datasets: barData.datasets}} options={{maintainAspectRatio: false}} /></div>
              </div>
            </div>
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
      <div className="page-content">
        {activeTab === "accounts" && <Accounts data={data} />}
        {activeTab === "cards" && <BankCard card={null} />}
        {activeTab === "profile" && <Profile data={data} />}
      </div>
      <BottomNav />
    </div>
  );
}