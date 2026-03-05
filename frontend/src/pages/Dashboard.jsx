import { useState, useEffect } from "react";
import axios from "axios";

export default function Dashboard() {

  const [activeTab, setActiveTab] = useState("comptes");
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://ton-backend.com/api/account/balance",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBalance(res.data.balance);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard">

      {/* HEADER FIXE */}
      <div className="header">
        <div className="header-icons">
          <button>👤</button>
          <button>🔔</button>
          <button>❓</button>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button
            className={activeTab === "comptes" ? "active" : ""}
            onClick={() => setActiveTab("comptes")}
          >
            Comptes
          </button>

          <button
            className={activeTab === "cartes" ? "active" : ""}
            onClick={() => setActiveTab("cartes")}
          >
            Cartes
          </button>

          <button
            className={activeTab === "financement" ? "active" : ""}
            onClick={() => setActiveTab("financement")}
          >
            Financement
          </button>
        </div>
      </div>


      {/* CONTENU */}
      <div className="content">

        {activeTab === "comptes" && (

          <div className="account-section">

            {/* SOLDE DISPONIBLE */}
            <div className="balance-card">

              <h3>Solde disponible</h3>

              <h1>
                {balance !== null
                  ? balance.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    })
                  : "..."}
              </h1>

            </div>

          </div>

        )}

      </div>


      {/* BOTTOM NAVIGATION */}
      <div className="bottom-nav">

        <button>Accueil</button>
        <button>Payer</button>
        <button>Produits</button>
        <button>Lifestyle</button>
        <button>Aide</button>

      </div>

    </div>
  );
}