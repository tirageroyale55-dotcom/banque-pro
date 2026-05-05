import { ChevronRight, ShieldCheck, Globe } from "lucide-react";

const BPER_OFFERS = [
  {
    id: "debit",
    name: "BPER Card Debit Online",
    type: "DEBIT",
    price: "0,00 €",
    theme: "#005a64", // Vert Sarcelle BPER
    features: ["Paiements mondiaux", "Apple & Google Pay", "Sans frais de gestion"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CREDIT",
    price: "3,50 €",
    theme: "#1e293b", // Bleu Ardoise Profond
    features: ["Débit différé", "Assurance achats", "Plafond évolutif"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 €",
    theme: "linear-gradient(135deg, #b59410 0%, #8a6d0d 100%)", // Or Brossé
    features: ["Conciergerie 24/7", "Lounge VIP", "Assurance Voyage"]
  }
];

export default function CardCatalog() {
  return (
    <div className="bper-catalog-container">
      <div className="catalog-header">
        <h2>Catalogue Cartes BPER</h2>
        <p>Une gamme complète pour chaque exigence.</p>
      </div>

      <div className="catalog-grid">
        {BPER_OFFERS.map((card) => (
          <div key={card.id} className="catalog-card-item">
            
            {/* RÉPLICATION EXACTE D'UNE CARTE BPER */}
            <div className="bper-card-visual" style={{ background: card.theme }}>
              <div className="card-texture-overlay"></div>
              
              <div className="card-top">
                <span className="bper-logo">BPER:</span>
                <Globe size={18} className="contactless-icon" />
              </div>

              <div className="emv-chip">
                <div className="chip-line"></div>
                <div className="chip-line"></div>
              </div>

              <div className="card-number-dots">•••• •••• •••• 0000</div>

              <div className="card-bottom">
                <div className="card-holder">VALUED CUSTOMER</div>
                <div className="card-brand">
                  <div className="brand-circles">
                    <span className="circle-red"></span>
                    <span className="circle-yellow"></span>
                  </div>
                  <span className="brand-type">{card.type}</span>
                </div>
              </div>
            </div>

            {/* DÉTAILS DE L'OFFRE */}
            <div className="card-offer-details">
              <div className="offer-title-row">
                <h4>{card.name}</h4>
                <div className="price-tag">{card.price}<span>/mois</span></div>
              </div>
              
              <ul className="offer-list">
                {card.features.map((f, i) => (
                  <li key={i}><ShieldCheck size={14} /> {f}</li>
                ))}
              </ul>

              <button className="offer-cta">
                Détails <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .bper-catalog-container { padding: 25px; }
        .catalog-header h2 { color: #005a64; font-weight: 800; margin-bottom: 5px; }
        .catalog-header p { color: #64748b; font-size: 14px; margin-bottom: 30px; }

        .catalog-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 25px; 
        }

        .catalog-card-item {
          background: white;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* STYLE PHYSIQUE DE LA CARTE */
        .bper-card-visual {
          aspect-ratio: 1.58 / 1;
          margin: 15px;
          border-radius: 14px;
          position: relative;
          color: white;
          padding: 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        .card-texture-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 100%);
          pointer-events: none;
        }

        .bper-logo { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
        .contactless-icon { float: right; opacity: 0.7; }

        /* PUCE EMV */
        .emv-chip {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
          border-radius: 5px;
          margin-top: 15px;
          position: relative;
          border: 0.5px solid rgba(0,0,0,0.1);
        }

        .card-number-dots {
          margin-top: 20px;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          letter-spacing: 2px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .card-bottom {
          position: absolute; bottom: 20px; left: 20px; right: 20px;
          display: flex; justify-content: space-between; align-items: flex-end;
        }

        .card-holder { font-size: 11px; font-weight: 600; opacity: 0.9; text-transform: uppercase; }

        .brand-circles { display: flex; margin-bottom: 2px; }
        .circle-red { width: 18px; height: 18px; background: #eb001b; border-radius: 50%; }
        .circle-yellow { width: 18px; height: 18px; background: #f79e1b; border-radius: 50%; margin-left: -8px; opacity: 0.8; }
        .brand-type { display: block; font-size: 8px; text-align: right; font-weight: 800; }

        /* DETAILS */
        .card-offer-details { padding: 0 20px 20px; }
        .offer-title-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .offer-title-row h4 { font-weight: 700; color: #1e293b; margin: 0; }
        .price-tag { color: #005a64; font-weight: 800; font-size: 18px; }
        .price-tag span { font-size: 11px; color: #94a3b8; font-weight: 400; }

        .offer-list { list-style: none; padding: 0; margin-bottom: 20px; }
        .offer-list li { font-size: 13px; color: #475569; display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

        .offer-cta {
          width: 100%; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 12px; color: #005a64; font-weight: 700; cursor: pointer;
          transition: all 0.2s; display: flex; justify-content: center; align-items: center; gap: 8px;
        }
        .offer-cta:hover { background: #005a64; color: white; }

        @media (min-width: 1000px) {
          .bper-catalog-container { max-width: 1100px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}