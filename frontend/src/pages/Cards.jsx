import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ChevronRight, CreditCard, ShieldCheck, Zap } from "lucide-react";

import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import BankCard from "../components/BankCard";


export default function Cards() {
  const [card, setCard] = useState(null);

  useEffect(() => {
    api("/client/card")
      .then(setCard)
      .catch(() => console.log("Erreur carte"));
  }, []);

  // Données des offres de cartes BPER
  const cardOffers = [
    {
      id: "v-pay",
      name: "BPER Card V-Pay",
      type: "CARTE DE DÉBIT",
      price: "0,00 € / an",
      description: "La carte idéale pour vos achats quotidiens et retraits en Europe.",
      color: "#005a64"
    },
    {
      id: "mastercard-gold",
      name: "BPER Classic Gold",
      type: "CARTE DE CRÉDIT",
      price: "30,50 € / an",
      description: "Plafonds élevés et assurances voyage incluses pour une liberté totale.",
      color: "#b08d57"
    },
    {
      id: "payup",
      name: "BPER PayUp",
      type: "CARTE PRÉPAYÉE",
      price: "5,00 € (Activation)",
      description: "Parfaite pour vos achats en ligne en toute sécurité sans compte bancaire.",
      color: "#4a4a4a"
    }
  ];

  const handleLearnMore = (cardName) => {
    alert(`L'opérateur est indisponible pour le moment pour les détails sur la ${cardName}. Veuillez réessayer plus tard.`);
  };

  return (
    <div className="bank-app">
      <Header data={{}} />

      <div className="cards-page">
        <section className="my-cards-section">
          <h2 className="section-title">Ma carte active</h2>
          {card ? (
            <BankCard card={card} />
          ) : (
            <div className="no-card-msg">Chargement de vos informations de carte...</div>
          )}
        </section>

        <section className="catalog-section">
          <h2 className="section-title">Nos solutions de paiement</h2>
          <p className="section-subtitle">Découvrez la gamme BPER Banca adaptée à vos besoins.</p>

          <div className="offers-grid">
            {cardOffers.map((offer) => (
              <div key={offer.id} className="offer-card">
                <div className="offer-header" style={{ borderLeft: `4px solid ${offer.color}` }}>
                  <span className="offer-type">{offer.type}</span>
                  <h3 className="offer-name">{offer.name}</h3>
                </div>
                
                <div className="offer-body">
                  <p className="offer-desc">{offer.description}</p>
                  <div className="offer-price-tag">
                    <span className="price-label">Frais de gestion</span>
                    <span className="price-value">{offer.price}</span>
                  </div>
                </div>

                <div className="offer-footer">
                  <div className="offer-perks">
                    <span><ShieldCheck size={14} /> Sécurité</span>
                    <span><Zap size={14} /> Sans contact</span>
                  </div>
                  <button 
                    className="learn-more-btn"
                    onClick={() => handleLearnMore(offer.name)}
                  >
                    Voir plus <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}