import { ChevronRight, ShieldCheck } from "lucide-react";

const BPER_CARDS = [
  {
    id: "debit",
    name: "BPER Card Debit Online",
    type: "DEBIT",
    price: "0,00 €/mois",
    bg: "linear-gradient(135deg, #005a64 0%, #002d32 100%)",
    accent: "#00d1e0",
    features: ["Apple/Google Pay", "Sans contact", "Gestion via App"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CREDIT",
    bg: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    accent: "#94a3b8",
    price: "3,50 €/mois",
    features: ["Débit différé", "Assurance achats", "Plafond élevé"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    bg: "linear-gradient(135deg, #b59410 0%, #725e0a 100%)",
    accent: "#ffd700",
    price: "8,00 €/mois",
    features: ["Conciergerie 24/7", "Lounge VIP", "Assurance Voyage"]
  }
];

export default function CardCatalog() {
  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2 className="catalog-title">Catalogue BPER Banca</h2>
        <p className="catalog-subtitle">Choisissez l'excellence pour vos paiements</p>
      </div>

      <div className="catalog-grid">
        {BPER_CARDS.map((card) => (
          <div key={card.id} className="catalog-card-item">
            
            {/* RENDU RÉALISTE DE LA CARTE */}
            <div className="real-card-visual" style={{ background: card.bg }}>
              <div className="card-top-row">
                <span className="bper-logo-brand">BPER:</span>
                <div className="card-wireless">
                  <div className="wave"></div>
                  <div className="wave"></div>
                  <div className="wave"></div>
                </div>
              </div>

              {/* PUCE EMV RÉALISTE */}
              <div className="emv-chip">
                <div className="chip-line-v"></div>
                <div className="chip-line-h"></div>
              </div>

              <div className="card-number-placeholder">•••• •••• •••• 0000</div>

              <div className="card-bottom-row">
                <div className="card-holder-name">NOM PRÉNOM</div>
                <div className="card-brand-logo">
                  <div className="circle red"></div>
                  <div className="circle orange"></div>
                </div>
              </div>
              
              <div className="card-type-badge" style={{ color: card.accent }}>
                {card.type}
              </div>
            </div>

            {/* INFORMATIONS BANCAIRES */}
            <div className="catalog-details-content">
              <div className="details-header">
                <h3>{card.name}</h3>
                <span className="card-price">{card.price}</span>
              </div>
              
              <ul className="details-list">
                {card.features.map((f, i) => (
                  <li key={i}><ShieldCheck size={14} className="check-icon" /> {f}</li>
                ))}
              </ul>

              <button className="bper-cta-button">
                Commander cette carte <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .catalog-container { padding: 25px 15px; background: #fcfcfc; }
        .catalog-header { margin-bottom: 30px; }
        .catalog-title { color: #005a64; font-size: 22px; font-weight: 800; }
        .catalog-subtitle { color: #64748b; font-size: 14px; }

        .catalog-grid { display: flex; flex-direction: column; gap: 25px; }

        .catalog-card-item {
          background: white;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        /* STYLE DE LA CARTE BANCAIRE */
        .real-card-visual {
          aspect-ratio: 1.58 / 1;
          margin: 15px;
          border-radius: 14px;
          padding: 20px;
          position: relative;
          color: white;
          box-shadow: 0 8px 15px rgba(0,0,0,0.2);
        }

        .bper-logo-brand { font-weight: 900; font-size: 20px; letter-spacing: -1px; }

        .emv-chip {
          width: 42px;
          height: 32px;
          background: linear-gradient(135deg, #d4af37, #f9e29c);
          border-radius: 6px;
          margin-top: 15px;
          position: relative;
          overflow: hidden;
          border: 0.5px solid rgba(0,0,0,0.1);
        }

        .chip-line-v { position: absolute; left: 50%; width: 1px; height: 100%; background: rgba(0,0,0,0.15); }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.15); }

        .card-number-placeholder { 
          margin-top: 20px; 
          font-family: 'Courier New', monospace; 
          font-size: 18px; 
          letter-spacing: 2px;
          opacity: 0.9;
        }

        .card-bottom-row { 
          position: absolute; 
          bottom: 20px; 
          left: 20px; 
          right: 20px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
        }

        .card-holder-name { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }

        .card-brand-logo { display: flex; }
        .circle { width: 24px; height: 24px; border-radius: 50%; }
        .red { background: #eb001b; z-index: 1; }
        .orange { background: #ff5f00; margin-left: -12px; opacity: 0.9; }

        .card-type-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        /* DETAILS */
        .catalog-details-content { padding: 0 20px 20px; }
        .details-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .details-header h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }
        .card-price { color: #005a64; font-weight: 800; font-size: 15px; }

        .details-list { list-style: none; padding: 0; margin-bottom: 20px; }
        .details-list li { font-size: 13px; color: #64748b; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .check-icon { color: #10b981; }

        .bper-cta-button {
          width: 100%;
          padding: 14px;
          background: #005a64;
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        /* DESKTOP LAYOUT */
        @media (min-width: 1000px) {
          .catalog-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 30px; 
          }
        }
      `}</style>
    </div>
  );
}