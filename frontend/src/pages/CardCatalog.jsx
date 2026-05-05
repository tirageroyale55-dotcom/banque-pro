import { ChevronRight, ShieldCheck, Wifi } from "lucide-react";

const BPER_MODELS = [
  {
    id: "debit",
    name: "BPER Card Debit Online",
    type: "DEBIT",
    price: "0,00 €",
    bg: "linear-gradient(135deg, #005a64 0%, #003d44 100%)",
    logoColor: "#ffffff",
    chipColor: "#e2e8f0"
  },
  {
    id: "classic",
    name: "BPER Card Classic",
    type: "CREDIT",
    price: "3,50 €",
    bg: "linear-gradient(135deg, #334155 0%, #0f172a 100%)",
    logoColor: "#ffffff",
    chipColor: "#f1f5f9"
  },
  {
    id: "gold",
    name: "BPER Card Gold",
    type: "PREMIUM",
    price: "8,00 €",
    bg: "linear-gradient(135deg, #d4af37 0%, #8a6d0d 100%)",
    logoColor: "#4a3b08",
    chipColor: "#fff7ed"
  }
];

export default function CardCatalog() {
  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2>Catalogue Cartes BPER</h2>
        <p>Solutions de paiement sécurisées avec technologie NFC</p>
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
                  <div className="chip-line"></div>
                  <div className="chip-line"></div>
                  <div className="chip-line"></div>
                  <div className="chip-inner"></div>
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

            {/* Infos produit */}
            <div className="product-details">
              <div className="product-header">
                <h4>{item.name}</h4>
                <span className="price-tag">{item.price}<small>/mois</small></span>
              </div>
              <button className="order-btn">
                Sélectionner <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .catalog-container { padding: 20px; font-family: 'Inter', sans-serif; }
        .catalog-header { margin-bottom: 25px; }
        .catalog-header h2 { color: #005a64; font-weight: 800; font-size: 22px; margin: 0; }
        .catalog-header p { color: #64748b; font-size: 14px; }

        .catalog-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 20px; 
        }

        .catalog-card-item {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .card-physical-container {
          padding: 25px;
          background: #f8fafc;
          display: flex;
          justify-content: center;
          perspective: 1000px;
        }

        .card-body {
          width: 100%;
          max-width: 260px;
          aspect-ratio: 1.58 / 1;
          border-radius: 12px;
          position: relative;
          padding: 18px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-gloss {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
        }

        .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }
        .bper-logo span { color: #84cc16; }
        .bper-logo small { font-size: 10px; font-weight: 400; margin-left: 4px; opacity: 0.8; }
        .nfc-icon { opacity: 0.7; transform: rotate(90deg); color: white; }

        /* Puce EMV Réaliste */
        .emv-chip {
          width: 38px;
          height: 28px;
          background: #facc15;
          border-radius: 5px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .chip-line { position: absolute; background: rgba(0,0,0,0.15); }
        .chip-line:nth-child(1) { width: 100%; height: 1px; top: 33%; }
        .chip-line:nth-child(2) { width: 100%; height: 1px; top: 66%; }
        .chip-line:nth-child(3) { height: 100%; width: 1px; left: 50%; }

        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-label { font-size: 10px; font-weight: 700; opacity: 0.8; letter-spacing: 1px; color: white; }

        /* Mastercard Symbol */
        .mc-symbol { display: flex; position: relative; width: 32px; height: 20px; }
        .circle { width: 20px; height: 20px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.85; }

        .product-details { padding: 15px 20px 20px; }
        .product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .product-header h4 { margin: 0; font-size: 15px; color: #1e293b; font-weight: 700; }
        .price-tag { color: #005a64; font-weight: 800; font-size: 16px; }
        .price-tag small { font-size: 10px; color: #94a3b8; margin-left: 2px; }

        .order-btn {
          width: 100%;
          padding: 12px;
          background: #005a64;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .order-btn:active { background: #003d44; }

        @media (min-width: 1000px) {
          .catalog-grid { gap: 30px; }
          .catalog-card-item:hover { transform: translateY(-5px); transition: 0.3s; }
        }
      `}</style>
    </div>
  );
}