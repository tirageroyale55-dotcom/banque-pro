import { Landmark, CreditCard, Wallet } from "lucide-react";

export default function Tabs({
  activeTab,
  setActiveTab,
  balance,
  showBalance
}) {

  return (

    <div className="tabs-wrapper">

      <div className="tabs">

        <button
          className={activeTab === "accounts" ? "tab active" : "tab"}
          onClick={() => setActiveTab("accounts")}
        >
          <Landmark size={18}/> Comptes
        </button>

        <button
          className={activeTab === "cards" ? "tab active" : "tab"}
          onClick={() => setActiveTab("cards")}
        >
          <CreditCard size={18}/> Cartes
        </button>

        <button
          className={activeTab === "financing" ? "tab active" : "tab"}
          onClick={() => setActiveTab("financing")}
        >
          <Wallet size={18}/> Financement
        </button>

      </div>

      {activeTab === "accounts" && (

        <div className={`tab-balance ${showBalance ? "show" : ""}`}>

          <span>Solde disponible</span>
          <strong>{balance} €</strong>

        </div>

      )}

    </div>

  );

}