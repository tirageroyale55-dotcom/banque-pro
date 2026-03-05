import { useState, useEffect } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [activeTopTab, setActiveTopTab] = useState("carte");

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
    <div className="bank-app">

      {/* TOP HEADER */}
      <div className="top-header">
        <div className="menu-icon">☰</div>
        <div className="icons-right">🔔 ❔</div>
      </div>

      {/* TOP NAVIGATION */}
      <div className="top-tabs">
        <span
          className={activeTopTab === "conti" ? "active" : ""}
          onClick={() => setActiveTopTab("conti")}
        >
          Conti
        </span>
        <span
          className={activeTopTab === "carte" ? "active" : ""}
          onClick={() => setActiveTopTab("carte")}
        >
          Carte
        </span>
        <span
          className={activeTopTab === "invest" ? "active" : ""}
          onClick={() => setActiveTopTab("invest")}
        >
          Investimenti
        </span>
      </div>

      {/* CARD SECTION */}
      {activeTopTab === "carte" && (
        <div className="card-section">
          <div className="card-bank">
            <div className="card-title">BPER</div>
            <div className="card-number">**** {data.iban.slice(-4)}</div>
            <div className="card-brand">Mastercard</div>
          </div>

          <div className="card-actions">
            <div>PIN</div>
            <div>KEY6</div>
            <div>SOSPENDI</div>
            <div>ALTRO</div>
          </div>
        </div>
      )}

      {/* ACCOUNT SECTION */}
      {activeTopTab === "conti" && (
        <div className="account-section">
          <h3>Saldo disponibile</h3>
          <h1>{data.balance} €</h1>
          <p>IBAN: {data.iban}</p>
        </div>
      )}

      {/* INVEST SECTION */}
      {activeTopTab === "invest" && (
        <div className="account-section">
          <h3>Investimenti</h3>
          <p>Nessun investimento attivo</p>
        </div>
      )}

      {/* MONTHLY BLOCK */}
      <div className="monthly-box">
        <h4>PRELIEVI E PAGAMENTI MENSILI</h4>
        <div className="monthly-row">
          <div>
            <p>Speso</p>
            <strong>200,00 €</strong>
          </div>
          <div>
            <p>Residuo</p>
            <strong>{data.balance} €</strong>
          </div>
        </div>
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="bottom-nav">
        <div className="active">Home</div>
        <div>Paga</div>
        <div>Prodotti</div>
        <div>Aiuto</div>
      </div>

    </div>
  );
}