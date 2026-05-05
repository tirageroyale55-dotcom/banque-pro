import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ChevronRight, ShieldCheck, CreditCard as CardIcon } from "lucide-react";
import BankCard from "../components/BankCard";

const BPER_CATALOG = [
  { id: "deb", name: "BPER Card Debit Online", type: "DÉBIT", price: "0,00 €/mois", color: "#005a64", feat: ["Apple/Google Pay", "Sans contact"] },
  { id: "cla", name: "BPER Card Classic", type: "CRÉDIT", price: "3,50 €/mois", color: "#1e293b", feat: ["Débit différé", "Assurance"] },
  { id: "gol", name: "BPER Card Gold", type: "PREMIUM", price: "8,00 €/mois", color: "#b59410", feat: ["Conciergerie", "Lounge VIP"] }
];

export default function Cards({ isDesktop = false }) {
  const [card, setCard] = useState(null);

  useEffect(() => {
    api("/client/card").then(setCard).catch(() => console.log("Erreur carte"));
  }, []);

  return (
    <div className={`cards-page-container ${isDesktop ? 'desktop-view' : 'mobile-view'}`}>
      <div className="section-header-bper">
        <h2 className="cards-main-title">Mes cartes actives</h2>
        <p className="cards-subtitle">Gérez vos plafonds et la sécurité de vos cartes.</p>
      </div>

      {/* CARTE ACTUELLE */}
      <div className="active-card-section">
        {card ? <BankCard card={card} /> : <div className="card-loader">Chargement...</div>}
      </div>

      <div className="section-header-bper catalog-margin">
        <h2 className="cards-main-title">Catalogue BPER Banca</h2>
        <p className="cards-subtitle">Découvrez l'offre adaptée à vos besoins.</p>
      </div>

      {/* CATALOGUE */}
      <div className="bper-catalog-grid">
        {BPER_CATALOG.map((item) => (
          <div key={item.id} className="catalog-card-item">
            <div className="catalog-visual" style={{ background: item.color }}>
              <div className="catalog-chip"></div>
              <div className="catalog-brand">BPER:</div>
            </div>
            <div className="catalog-details">
              <div className="catalog-row">
                <h4>{item.name}</h4>
                <span className="catalog-price">{item.price}</span>
              </div>
              <div className="catalog-tags">
                {item.feat.map((f, i) => (
                  <span key={i} className="tag"><ShieldCheck size={10} /> {f}</span>
                ))}
              </div>
              <button className="btn-bper-cta" onClick={() => alert("Service indisponible")}>
                Détails <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}