import { ChevronRight, ShieldCheck, Wifi } from "lucide-react";

const BPER_OFFERS = [
  {
    id: "debit",
    name: "BPER Card Debit Online",
    type: "DEBIT",
    price: "0,00 €",
    color: "linear-gradient(135deg, #005a64 0%, #003d44 100%)",
    chip: "#e2c275",
    features: ["Paiements sans contact", "Apple & Google Pay", "Gestion via App"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CREDIT",
    price: "3,50 €",
    color: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
    chip: "#d1d5db",
    features: ["Débit différé", "Assurance achats", "Plafond évolutif"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 €",
    color: "linear-gradient(135deg, #b59410 0%, #8a6d0d 100%)",
    chip: "#f3e5ab",
    features: ["Conciergerie 24/7", "Lounge VIP", "Assurance Voyage"]
  }
];

export default function CardCatalog() {
  return (
    <div className="bper-catalog-container">
      <div className="catalog-header">
        <h2>Catalogue BPER Banca</h2>
        <p>Des solutions de paiement exclusives à portée de main.</p>
      </div>

      <div className="catalog-list">
        {BPER_OFFERS.map((card) => (
          <div key={card.id} className="catalog-card-item">
            
            {/* --- CARTE RÉALISTE --- */}
            <div className="card-physical-mockup" style={{ background: card.color }}>
              <div className="card-texture"></div>
              
              <div className="card-top">
                <span className="bper-logo-card">BPER:</span>
                <Wifi size={20} className="nfc-icon" />
              </div>

              <div className="card-middle">
                <div className="emv-chip" style={{ background: card.chip }}>
                  <div className="chip-line"></div>
                  <div className="chip-line"></div>
                  <div className="chip-line"></div>
                </div>
              </div>

              <div className="card-bottom">
                <div className="card-holder-name">NOM PRÉNOM</div>
                <div className="card-brand-logo">
                  <div className="mastercard-circles">
                    <div className="circle red"></div>
                    <div className="circle orange"></div>
                  </div>
                  <span className="card-type-text">{card.type}</span>
                </div>
              </div>
            </div>

            {/* --- INFOS ET PRIX --- */}
            <div className="catalog-details">
              <div className="details-header">
                <h3>{card.name}</h3>
                <div className="price-box">
                  <span className="amount">{card.price}</span>
                  <span className="unit">/mois</span>
                </div>
              </div>

              <ul className="feature-list">
                {card.features.map((f, i) => (
                  <li key={i}><ShieldCheck size={14} /> {f}</li>
                ))}
              </ul>

              <button className="btn-request-bper">
                Sélectionner <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .bper-catalog-container { padding: 20px; max-width: 1100px; margin: 0 auto; }
        .catalog-header { margin-bottom: 30px; }
        .catalog-header h2 { color: #005a64; font-size: 24px; font-weight: 800; }
        .catalog-header p { color: #64748b; font-size: 14px; }

        .catalog-list { display: flex; flex-direction: column; gap: 20px; }

        .catalog-card-item {
          background: white;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        /* RENDU RÉALISTE DE LA CARTE */
        .card-physical-mockup {
          width: 100%;
          max-width: 320px;
          aspect-ratio: 1.58 / 1;
          border-radius: 14px;
          position: relative;
          padding: 20px;
          color: white;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          overflow: hidden;
          margin: 0 auto;
        }

        .card-texture {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
          opacity: 0.1;
          pointer-events: none;
        }

        .card-top { display: flex; justify-content: space-between; align-items: center; }
        .bper-logo-card { font-weight: 900; font-size: 20px; letter-spacing: -1px; }
        .nfc-icon { opacity: 0.8; transform: rotate(90deg); }

        .card-middle { margin-top: 20px; }
        .emv-chip {
          width: 45px;
          height: 35px;
          border-radius: 6px;
          position: relative;
          border: 1px solid rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          padding: 4px;
        }
        .chip-line { height: 1px; background: rgba(0,0,0,0.2); width: 100%; }

        .card-bottom {
          position: absolute;
          bottom: 20px; left: 20px; right: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .card-holder-name { font-size: 12px; font-family: 'Courier New', monospace; letter-spacing: 1px; opacity: 0.9; }

        .mastercard-circles { display: flex; position: relative; height: 25px; width: 40px; }
        .circle { width: 25px; height: 25px; border-radius: 50%; }
        .circle.red { background: #eb001b; position: absolute; left: 0; }
        .circle.orange { background: #ff5f00; position: absolute; right: 0; opacity: 0.8; }
        .card-type-text { display: block; font-size: 8px; font-weight: bold; text-align: right; margin-top: 4px; }

        /* DETAILS */
        .catalog-details { flex: 1; }
        .details-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .details-header h3 { font-size: 18px; color: #1e293b; margin: 0; }
        .price-box { text-align: right; }
        .amount { display: block; font-weight: 800; color: #005a64; font-size: 18px; }
        .unit { font-size: 11px; color: #94a3b8; }

        .feature-list { list-style: none; padding: 0; margin-bottom: 20px; }
        .feature-list li { font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

        .btn-request-bper {
          width: 100%;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #005a64;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        /* TABLET & DESKTOP */
        @media (min-width: 1000px) {
          .catalog-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 30px; }
          .catalog-card-item { flex-direction: row; padding: 25px; align-items: center; }
          .card-physical-mockup { min-width: 300px; margin: 0; }
        }
      `}</style>
    </div>
  );
}