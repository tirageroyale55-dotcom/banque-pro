import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ChevronRight, ShieldCheck, CreditCard as CardIcon } from "lucide-react";
import BankCard from "../components/BankCard";

const BPER_CARD_CATALOG = [
  {
    id: "debit-online",
    name: "BPER Card Debit Online",
    type: "DÉBIT",
    price: "0,00 € / mois",
    description: "La carte idéale pour vos achats quotidiens et vos paiements en ligne en toute sécurité.",
    color: "#005a64",
    features: ["Apple Pay / Google Pay", "Sans contact", "Gestion via App"]
  },
  {
    id: "classic-visa",
    name: "BPER Card Classic",
    type: "CRÉDIT",
    price: "3,50 € / mois",
    description: "Liberté de paiement maximale avec débit différé et plafonds personnalisables.",
    color: "#1e293b",
    features: ["Paiement différé", "Assurance voyage", "Circuit Visa/Mastercard"]
  },
  {
    id: "gold-mastercard",
    name: "BPER Card Gold",
    type: "CRÉDIT EXCLUSIF",
    price: "8,00 € / mois",
    description: "Le prestige BPER avec des services premium et une couverture d'assurance étendue.",
    color: "#b59410",
    features: ["Conciergerie 24/7", "Plafond élevé", "Accès Lounge aéroports"]
  }
];

export default function Cards() {
  const [card, setCard] = useState(null);

  useEffect(() => {
    api("/client/card")
      .then(setCard)
      .catch(() => console.log("Erreur carte"));
  }, []);

  const handleMoreInfo = (cardName) => {
    alert(`Le service de consultation détaillée pour la ${cardName} est temporairement indisponible. Veuillez réessayer plus tard.`);
  };

  return (
    <div className="cards-page-content fade-in">
        <div className="section-header-bper">
          <h2 className="cards-title">Mes cartes actives</h2>
          <p className="subtitle-bper">Gérez vos moyens de paiement et plafonds.</p>
        </div>

        <div className="active-card-container">
          {card ? (
            <div className="cards-slide">
              <BankCard card={card} />
            </div>
          ) : (
            <div className="no-card-placeholder" style={{textAlign:'center', padding:'20px'}}>
              <p>Chargement de votre carte...</p>
            </div>
          )}
        </div>

        <div className="catalog-section">
          <div className="section-header-bper" style={{ marginTop: '30px' }}>
            <h2 className="cards-title">Catalogue de cartes BPER</h2>
          </div>

          <div className="bper-cards-grid">
            {BPER_CARD_CATALOG.map((item) => (
              <div key={item.id} className="bper-card-promo">
                <div className="card-promo-visual" style={{ background: item.color }}>
                  <div className="chip"></div>
                  <div className="card-brand">BPER:</div>
                  <div className="card-type-label">{item.type}</div>
                </div>
                
                <div className="card-promo-content">
                  <div className="card-promo-header">
                    <h4>{item.name}</h4>
                    <span className="card-price">{item.price}</span>
                  </div>
                  <p className="card-description">{item.description}</p>
                  <button className="btn-bper-outline" onClick={() => handleMoreInfo(item.name)}>
                    Voir plus <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}