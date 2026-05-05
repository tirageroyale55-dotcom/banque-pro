import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ChevronRight, ShieldCheck, CreditCard as CardIcon } from "lucide-react";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";

// Catalogue des offres BPER
const BPER_CATALOG = [
  {
    id: "debit",
    name: "BPER Card Debit Online",
    type: "DÉBIT",
    price: "0,00 € / mois",
    desc: "Parfaite pour vos achats quotidiens et vos paiements sécurisés en ligne.",
    color: "#005a64",
    features: ["Apple/Google Pay", "Sans contact"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CRÉDIT",
    price: "3,50 € / mois",
    desc: "Liberté maximale avec débit différé et plafonds personnalisables.",
    color: "#1e293b",
    features: ["Débit différé", "Assurance voyage"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 € / mois",
    desc: "Le prestige BPER avec des services exclusifs et une couverture étendue.",
    color: "#b59410",
    features: ["Conciergerie", "Accès Lounge"]
  }
];

export default function Cards() {
  const [card, setCard] = useState(null);

  useEffect(() => {
    api("/client/card")
      .then(setCard)
      .catch(() => console.log("Erreur carte"));
  }, []);

  const handleAlert = (name) => {
    alert(`L'opérateur est indisponible pour le moment, veuillez réessayer plus tard pour la carte ${name}.`);
  };

  return (
    <div className="bank-app">
      <Header data={{}} />

      {/* Conteneur avec défilement forcé pour voir le contenu sous la carte */}
      <div className="page-content" style={{ paddingBottom: "100px", overflowY: "auto", height: "calc(100vh - 70px)" }}>
        
        {/* SECTION 1 : MA CARTE ACTUELLE */}
        <div className="section-header-bper" style={{ padding: "20px 15px" }}>
          <h2 style={{ fontSize: "20px", color: "#005a64", fontWeight: "bold" }}>Ma carte bancaire</h2>
          <p style={{ fontSize: "13px", color: "#666" }}>Gérez votre carte actuelle et ses options.</p>
        </div>

        <div className="active-card-wrapper" style={{ padding: "0 15px 20px" }}>
          {card ? (
            <BankCard card={card} />
          ) : (
            <div className="no-card-info" style={{ textAlign: "center", padding: "30px", background: "#f8fafc", borderRadius: "12px" }}>
              <CardIcon size={40} color="#cbd5e1" />
              <p style={{ color: "#64748b", marginTop: "10px" }}>Chargement de vos données...</p>
            </div>
          )}
        </div>

        {/* SECTION 2 : CATALOGUE BPER */}
        <div className="section-header-bper" style={{ padding: "10px 15px", borderTop: "8px solid #f1f5f9" }}>
          <h2 style={{ fontSize: "18px", color: "#005a64", fontWeight: "bold", marginTop: "15px" }}>Découvrir nos cartes</h2>
          <p style={{ fontSize: "13px", color: "#666" }}>Trouvez la carte qui correspond à vos besoins.</p>
        </div>

        <div className="bper-catalog-list" style={{ padding: "15px" }}>
          {BPER_CATALOG.map((item) => (
            <div key={item.id} className="catalog-item" style={{ 
              background: "white", 
              borderRadius: "16px", 
              marginBottom: "20px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #eee",
              overflow: "hidden"
            }}>
              {/* Visuel miniature de la carte */}
              <div style={{ background: item.color, height: "100px", padding: "15px", color: "white", position: "relative" }}>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>BPER:</div>
                <div style={{ position: "absolute", bottom: "15px", left: "15px", fontSize: "10px", opacity: 0.8, letterSpacing: "1px" }}>
                  {item.type}
                </div>
                <div style={{ width: "30px", height: "20px", background: "#ffd700", borderRadius: "3px", marginTop: "10px" }}></div>
              </div>

              {/* Infos et Bouton */}
              <div style={{ padding: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>{item.name}</h4>
                  <span style={{ color: "#005a64", fontWeight: "bold" }}>{item.price}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "10px 0" }}>{item.desc}</p>
                
                <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                  {item.features.map((f, i) => (
                    <span key={i} style={{ fontSize: "11px", background: "#f1f5f9", padding: "3px 8px", borderRadius: "5px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={12} color="#005a64" /> {f}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => handleAlert(item.name)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1.5px solid #005a64",
                    background: "white",
                    color: "#005a64",
                    borderRadius: "8px",
                    fontWeight: "600",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  En savoir plus <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}