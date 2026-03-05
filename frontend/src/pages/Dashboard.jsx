import { useEffect, useState } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    api("/client/dashboard")
      .then(setData)
      .catch(() => {
        localStorage.removeItem("token");
        window.location = "/login";
      });
  }, []);

  if (!data) return null;

  return (
    <div className="dashboard">
      <Navbar />

      {/* HEADER TABS */}
      <div className="tabs">
        <span
          className={activeTab === 0 ? "active" : ""}
          onClick={() => setActiveTab(0)}
        >
          Comptes
        </span>
        <span
          className={activeTab === 1 ? "active" : ""}
          onClick={() => setActiveTab(1)}
        >
          Carte
        </span>
        <span
          className={activeTab === 2 ? "active" : ""}
          onClick={() => setActiveTab(2)}
        >
          Investissements
        </span>
      </div>

      {/* CONTENU SLIDE */}
      <div
        className="tab-container"
        style={{ transform: `translateX(-${activeTab * 100}%)` }}
      >
        {/* PAGE 1 : COMPTE */}
        <div className="tab-page">
          <h2>Solde</h2>
          <h1>{data.balance} €</h1>
          <p>IBAN : {data.iban}</p>
        </div>

        {/* PAGE 2 : CARTE */}
        <div className="tab-page">
          <div className="card-bank">
            <h3>BPER Banque</h3>
            <p>Carte **** {data.iban.slice(-4)}</p>
          </div>

          <div className="actions">
            <button>PIN</button>
            <button>KEY6</button>
            <button>Suspendre</button>
            <button>Autres</button>
          </div>
        </div>

        {/* PAGE 3 : INVESTISSEMENTS */}
        <div className="tab-page">
          <h2>Investissements</h2>
          <p>Aucun investissement actif</p>
        </div>
      </div>
    </div>
  );
}