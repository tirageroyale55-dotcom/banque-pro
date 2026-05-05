import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ChevronRight, ShieldCheck, CreditCard as CardIcon, Info } from "lucide-react";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";

// Catalogue des offres BPER Banca
const BPER_CATALOG = [
  {
    id: "debit",
    name: "BPER Card Debit Online",
    type: "DÉBIT",
    price: "0,00 € / mois",
    desc: "Parfaite pour vos achats quotidiens et vos paiements sécurisés en ligne.",
    color: "#005a64", // Vert BPER
    features: ["Apple/Google Pay", "Sans contact"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CRÉDIT",
    price: "3,50 € / mois",
    desc: "Liberté maximale avec débit différé et plafonds personnalisables.",
    color: "#1e293b", // Bleu Ardoise
    features: ["Débit différé", "Assurance voyage"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 € / mois",
    desc: "Le prestige BPER avec des services exclusifs et une couverture étendue.",
    color: "#b59410", // Or
    features: ["Conciergerie", "Accès Lounge"]
  }
];

export default function Cards() {
  const [card, setCard] = useState(null);

  useEffect(() => {
    api("/client/card")
      .then(setCard)
      .catch(() => console.log("Erreur chargement carte"));
  }, []);

  const handleAlert = (name) => {
    alert(`L'opérateur est indisponible pour le moment, veuillez réessayer plus tard pour la carte ${name}.`);
  };

  return (
    <div className="bank-app" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header data={{}} />

      {/* Zone de contenu principale avec scroll indépendant */}
      <main className="cards-scroll-area" style={{ 
        flex: 1, 
        overflowY: "auto", 
        paddingBottom: "100px", 
        backgroundColor: "#fcfcfc" 
      }}>
        
        {/* SECTION 1 : CARTE DE L'UTILISATEUR */}
        <div className="section-container" style={{ padding: "20px 15px" }}>
          <div style={{ marginBottom: "15px" }}>
            <h2 style={{ fontSize: "22px", color: "#005a64", fontWeight: "700", margin: 0 }}>Ma carte</h2>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Gérez votre moyen de paiement principal</p>
          </div>

          <div className="active-card-display" style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            {card ? (
              <BankCard card={card} />
            ) : (
              <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: "16px", border: "1px dashed #cbd5e1", width: "100%" }}>
                <CardIcon size={40} color="#94a3b8" />
                <p style={{ color: "#64748b", marginTop: "10px" }}>Récupération des données sécurisées...</p>
              </div>
            )}
          </div>
        </div>

        {/* DIVISEUR VISUEL */}
        <div style={{ height: "8px", background: "#f1f5f9" }}></div>

        {/* SECTION 2 : CATALOGUE DE CARTES */}
        <div className="section-container" style={{ padding: "25px 15px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", color: "#005a64", fontWeight: "700", margin: 0 }}>Offres BPER Banca</h2>
            <p style={{ fontSize: "14px", color: "#64748b" }}>Découvrez notre gamme exclusive de cartes</p>
          </div>

          <div className="catalog-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {BPER_CATALOG.map((item) => (
              <div key={item.id} className="bper-catalog-card" style={{ 
                background: "white", 
                borderRadius: "20px", 
                border: "1px solid #e2e8f0", 
                overflow: "hidden",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              }}>
                {/* Header Visuel de la carte promo */}
                <div style={{ background: item.color, height: "110px", padding: "20px", color: "white", position: "relative" }}>
                  <div style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "1px" }}>BPER:</div>
                  <div style={{ marginTop: "10px", width: "35px", height: "25px", background: "rgba(255,255,255,0.2)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.3)" }}></div>
                  <div style={{ position: "absolute", bottom: "15px", right: "20px", fontSize: "10px", fontWeight: "bold", opacity: 0.7 }}>{item.type}</div>
                </div>

                {/* Corps de l'offre */}
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "17px", color: "#0f172a", fontWeight: "600" }}>{item.name}</h4>
                    <span style={{ color: "#005a64", fontWeight: "700", fontSize: "15px" }}>{item.price}</span>
                  </div>
                  
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5", marginBottom: "15px" }}>{item.desc}</p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                    {item.features.map((feat, idx) => (
                      <span key={idx} style={{ 
                        fontSize: "11px", 
                        background: "#f8fafc", 
                        color: "#334155", 
                        padding: "4px 10px", 
                        borderRadius: "20px", 
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <ShieldCheck size={12} color="#005a64" /> {feat}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleAlert(item.name)}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "#005a64",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "600",
                      fontSize: "14px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Demander cette carte <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}