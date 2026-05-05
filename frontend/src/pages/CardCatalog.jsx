import { ChevronRight, ShieldCheck, Wifi, CheckCircle2 } from "lucide-react";

const BPER_MODELS = [
  {
    id: "debit",
    name: "BPER Card Debit Online",
    type: "DEBIT",
    price: "0,00 €",
    bg: "linear-gradient(135deg, #005a64 0%, #003d44 100%)",
    logoColor: "#ffffff",
    features: ["Paiements sans contact", "Apple & Google Pay", "Zéro frais de gestion"]
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CREDIT",
    price: "3,50 €",
    bg: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    logoColor: "#ffffff",
    features: ["Débit différé", "Assurance achats", "Protection fraude incluse"]
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 €",
    bg: "linear-gradient(135deg, #d4af37 0%, #8a6d0d 100%)",
    logoColor: "#4a3b08",
    features: ["Conciergerie 24/7", "Accès Lounge VIP", "Plafonds personnalisables"]
  }
];

export default function CardCatalog() {
  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2>Catalogue Cartes BPER</h2>
        <p>Gérez vos paiements avec la technologie NFC sécurisée</p>
      </div>

      <div className="catalog-grid">
        {BPER_MODELS.map((item) => (
          <div key={item.id} className="catalog-card-item">
            {/* Rendu de la carte physique réaliste */}
            <div className="card-physical-container">
              <div className="card-body" style={{ background: item.bg }}>
                <div className="card-gloss"></div>
                
                <div className="card-top-row">
                  <div className="bper-logo" style={{ color: item.logoColor }}>
                    BPER<span>:</span> <small>Banca</small>
                  </div>
                  <Wifi size={20} className="nfc-icon" strokeWidth={1.5} />
                </div>

                <div className="emv-chip">
                  <div className="chip-line horizontal-1"></div>
                  <div className="chip-line horizontal-2"></div>
                  <div className="chip-line vertical"></div>
                </div>

                <div className="card-bottom-row">
                  <div className="card-label">{item.type}</div>
                  <div className="mc-symbol">
                    <div className="circle red"></div>
                    <div className="circle yellow"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos produit & Features */}
            <div className="product-details">
              <div className="product-header">
                <h4>{item.name}</h4>
                <span className="price-tag">{item.price}<small>/mois</small></span>
              </div>

              {/* SECTION DES FEATURES AVEC ICONES VERTES */}
              <ul className="features-list">
                {item.features.map((feature, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="icon-green" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="order-btn">
                Sélectionner cette carte <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        
        .catalog-header { 
  padding: 20px; 
  font-family: 'Inter', sans-serif; 
  background: #ffffff; /* Fond blanc pur pour un aspect clean */
  border-radius: 24px; /* Optionnel : pour adoucir les angles si intégré dans une section */
  margin-top: 20px;
}

.catalog-header { 
  margin-bottom: 25px; 
  border-left: 4px solid #005a64; 
  padding-left: 15px; 
}

.catalog-header h2 { 
  color: #005a64; 
  font-weight: 800; 
  font-size: 22px; 
  margin: 0; 
}

.catalog-header p { 
  color: #64748b; 
  font-size: 14px; 
  margin-top: 4px; 
}

        .catalog-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
          gap: 25px; 
        }

        .catalog-card-item {
          background: #fff;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0,0,0,0.04);
          transition: transform 0.3s ease;
        }

        .card-physical-container {
          padding: 30px;
          background: #f8fafc;
          display: flex;
          justify-content: center;
        }

        .card-body {
          width: 100%;
          max-width: 280px;
          aspect-ratio: 1.58 / 1;
          border-radius: 14px;
          position: relative;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-gloss {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }

        .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; }
        .bper-logo span { color: #a3e635; }
        .bper-logo small { font-size: 11px; font-weight: 400; opacity: 0.8; }
        .nfc-icon { opacity: 0.8; transform: rotate(90deg); color: white; }

        /* Puce EMV Haute Définition */
        .emv-chip {
          width: 42px;
          height: 32px;
          background: #eab308;
          border-radius: 6px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(0,0,0,0.15);
          overflow: hidden;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
        }
        .chip-line { position: absolute; background: rgba(0,0,0,0.2); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }

        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-label { font-size: 11px; font-weight: 800; opacity: 0.9; color: white; letter-spacing: 1px; }

        .mc-symbol { display: flex; position: relative; width: 36px; height: 22px; }
        .circle { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        /* Détails & Features */
        .product-details { padding: 20px 24px 24px; }
        .product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .product-header h4 { margin: 0; font-size: 16px; color: #1e293b; font-weight: 700; }
        .price-tag { color: #005a64; font-weight: 800; font-size: 18px; }
        .price-tag small { font-size: 12px; color: #94a3b8; font-weight: 400; margin-left: 2px; }

        .features-list { list-style: none; padding: 0; margin: 0 0 24px 0; }
        .features-list li { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 10px; 
          font-size: 13px; 
          color: #475569; 
          font-weight: 500;
        }
        .icon-green { color: #10b981; flex-shrink: 0; }

        .order-btn {
          width: 100%;
          padding: 14px;
          background: #005a64;
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          font-size: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .order-btn:hover { background: #003d44; box-shadow: 0 4px 12px rgba(0, 90, 100, 0.2); }

        @media (min-width: 1000px) {
          .catalog-card-item:hover { transform: translateY(-8px); }
          .catalog-grid { gap: 30px; }
        }
      `}</style>
    </div>
  );
}