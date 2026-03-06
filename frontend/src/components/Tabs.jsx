import { Landmark, CreditCard, Wallet } from "lucide-react";

export default function Tabs({
  activeTab,
  setActiveTab,
  balance,
  showBalance
}) {

  return (

    <div className="tabs">

      <button
        className={`tab ${activeTab === "accounts" ? "active" : ""}`}
        onClick={() => setActiveTab("accounts")}
      >
        <Landmark size={18}/>
        Comptes
      </button>

      <button
        className={`tab ${activeTab === "cards" ? "active" : ""}`}
        onClick={() => setActiveTab("cards")}
      >
        <CreditCard size={18}/>
        Cartes
      </button>

      <button
        className={`tab ${activeTab === "financing" ? "active" : ""}`}
        onClick={() => setActiveTab("financing")}
      >
        <Wallet size={18}/>
        Financement
      </button>

      {/* SOLDE BPER */}

      {activeTab === "accounts" && (

        <div className={`tabs-balance ${showBalance ? "visible" : ""}`}>

          <span>Solde disponible</span>
          <strong>{balance} €</strong>

        </div>

      )}

    </div>

  );

}