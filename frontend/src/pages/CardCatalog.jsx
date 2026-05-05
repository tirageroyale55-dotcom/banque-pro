import { ChevronRight, ShieldCheck, Globe, Zap } from "lucide-react";

const BPER_OFFERS = [
  {
    id: "debit-online",
    name: "BPER Card Debit Online",
    type: "DEBIT",
    price: "0,00 €",
    period: "/mois",
    theme: "#005a64", // Vert BPER
    image: "https://www.bper.it/content/dam/bper/immagini/prodotti/carte/bper-card-debit-online.png",
    features: ["Paiements sans contact", "Apple & Google Pay", "Zéro frais de gestion"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CREDIT",
    price: "3,50 €",
    period: "/mois",
    theme: "#1e293b", // Slate
    image: "https://www.bper.it/content/dam/bper/immagini/prodotti/carte/bper-card-classic.png",
    features: ["Débit différé", "Assurance achats", "Plafond adaptable"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 €",
    period: "/mois",
    theme: "#b59410", // Gold
    image: "https://www.bper.it/content/dam/bper/immagini/prodotti/carte/bper-card-gold.png",
    features: ["Conciergerie 24/7", "Lounge VIP", "Assurance Voyage complète"]
  }
];

export default function CardCatalog() {
  return (
    <section className="bper-catalog-wrapper">
      <div className="catalog-header">
        <h2>Catalogue BPER Banca</h2>
        <p>Choisissez la solution de paiement qui vous ressemble.</p>
      </div>

      <div className="catalog-grid">
        {BPER_OFFERS.map((card) => (
          <div key={card.id} className="catalog-item">
            {/* Conteneur de la carte avec ratio bancaire exact */}
            <div className="card-visual-container">
              <div className="real-card-shape" style={{ background: card.theme }}>
                <div className="card-overlay-chip"></div>
                <div className="card-logo-text">BPER:</div>
                <div className="card-type-label">{card.type}</div>
                {/* Image de la carte réelle par-dessus le fond si l'URL est valide */}
                <img src={card.image} alt={card.name} className="card-image-overlay" 
                     onError={(e) => e.target.style.display = 'none'} />
              </div>
            </div>

            <div className="card-info-content">
              <div className="card-title-row">
                <h4>{card.name}</h4>
                <div className="card-price-tag">
                  <span className="price">{card.price}</span>
                  <span className="period">{card.period}</span>
                </div>
              </div>

              <ul className="card-features-list">
                {card.features.map((f, i) => (
                  <li key={i}><ShieldCheck size={14} className="icon-green" /> {f}</li>
                ))}
              </ul>

              <button className="bper-btn-primary">
                Détails et Souscription <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .bper-catalog-wrapper { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .catalog-header h2 { color: #005a64; font-size: 24px; font-weight: 800; margin-bottom: 5px; }
        .catalog-header p { color: #64748b; margin-bottom: 30px; font-size: 15px; }

        /* Grid adaptatif : 1 colonne mobile, 3 colonnes desktop */
        .catalog-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 25px; 
        }

        .catalog-item {
          background: white;
          border-radius: 20px;
          border: 1px solid #eef2f6;
          overflow: hidden;
          transition: transform 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .catalog-item:hover { transform: translateY(-5px); }

        .card-visual-container {
          padding: 20px;
          background: #f8fafc;
          display: flex;
          justify-content: center;
        }

        /* Forme exacte d'une carte bancaire (ID-1 ISO/IEC 7810) */
        .real-card-shape {
          width: 100%;
          max-width: 280px;
          aspect-ratio: 1.58 / 1;
          border-radius: 12px;
          position: relative;
          color: white;
          padding: 15px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .card-image-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }

        .card-logo-text { font-weight: 900; font-size: 18px; position: relative; z-index: 2; }
        .card-type-label { 
          position: absolute; bottom: 15px; right: 15px; 
          font-size: 10px; font-weight: bold; opacity: 0.8; z-index: 2;
        }

        .card-info-content { padding: 20px; }
        .card-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .card-title-row h4 { font-size: 17px; font-weight: 700; color: #1e293b; margin: 0; flex: 1; }
        
        .card-price-tag { display: flex; flex-direction: column; align-items: flex-end; }
        .price { color: #005a64; font-weight: 800; font-size: 18px; }
        .period { font-size: 11px; color: #94a3b8; }

        .card-features-list { list-style: none; padding: 0; margin-bottom: 20px; }
        .card-features-list li { 
          font-size: 13px; color: #475569; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; 
        }
        .icon-green { color: #10b981; }

        .bper-btn-primary {
          width: 100%;
          padding: 14px;
          background: #005a64;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        /* Ajustements spécifiques Desktop */
        @media (min-width: 1000px) {
          .catalog-grid { gap: 30px; }
          .bper-catalog-wrapper { padding: 40px 0; }
        }
      `}</style>
    </section>
  );
}