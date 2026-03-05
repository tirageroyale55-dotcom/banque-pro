import { useEffect, useState } from "react";
import { api } from "../services/api";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [data, setData] = useState(null);

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

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="tabs">
          <span className="active">Comptes</span>
          <span>Carte</span>
          <span>Investissements</span>
        </div>

        <div className="account-info">
          <h3>Carte **** {data.iban?.slice(-4)}</h3>
          <p>Carte de Crédit</p>
        </div>
      </div>

      {/* CARTE BANCAIRE */}
      <div className="card-bank">
        <div className="card-content">
          <h2>BPER:</h2>
          <p>Banque</p>

          <div className="card-number">•••• •••• •••• {data.iban?.slice(-4)}</div>

          <div className="card-footer">
            <span>Débit</span>
            <div className="circle"></div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <button>PIN</button>
        <button>KEY6</button>
        <button>Suspendre</button>
        <button>Autres</button>
      </div>

      {/* DEPENSES */}
      <div className="spending">
        <h4>PRÉLÈVEMENTS MENSUELS</h4>
        <div className="spending-card">
          <div>
            <p>Déjà dépensé</p>
            <strong>2000,00 €</strong>
          </div>
          <div>
            <p>Restant</p>
            <strong>{data.balance} €</strong>
          </div>
        </div>
      </div>

      {/* NAVIGATION BAS */}
      <div className="bottom-nav">
        <span>🏠</span>
        <span>💳</span>
        <span>📦</span>
        <span>💡</span>
      </div>
    </div>
  );
}
