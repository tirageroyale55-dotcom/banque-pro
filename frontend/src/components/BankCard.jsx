import { useState } from "react";
import { Wifi } from 'lucide-react';

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    // Si c'est un numéro complet (généré), on l'affiche avec des espaces
    return num.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  // On utilise les propriétés dynamiques ou les valeurs par défaut
  const cardStyle = {
    background: card.bg || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    color: 'white'
  };

  const logoStyle = {
    color: card.logoColor || '#ffffff'
  };

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${card.status || 'inactive'}`}
      onClick={() => setFlipped(!flipped)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-inner">
        
        {/* --- FRONT (Style exact de CardOrderConfirmation) --- */}
        <div className="card-front" style={cardStyle}>
          {/* Effet brillant (gloss) */}
          <div className="card-gloss"></div>
          
          <div className="card-top-row-custom">
            <div className="bper-logo-custom" style={logoStyle}>
              BPER<span>:</span> <small>Banca</small>
            </div>
            <Wifi size={20} className="nfc-icon-custom" strokeWidth={1.5} />
          </div>

          <div className="emv-chip-custom">
            <div className="chip-line-custom horizontal-1"></div>
            <div className="chip-line-custom horizontal-2"></div>
            <div className="chip-line-custom vertical"></div>
          </div>

          <div className="card-mid-row-custom">
            <div className="card-number-display">
              {formatNumber(card.number)}
            </div>
          </div>

          <div className="card-bottom-row-custom">
            <div className="card-holder-info">
              <span className="label-xs">TITULAIRE</span>
              <div className="val-sm">{card.holder || "NOM DU TITULAIRE"}</div>
            </div>
            
            <div className="card-meta-info">
               <div className="card-expiry-box">
                  <span className="label-xs">EXP</span>
                  <div className="val-sm">{card.expiry || "MM/YY"}</div>
               </div>
               <div className="mc-symbol-custom">
                  <div className="circle-mc red-mc"></div>
                  <div className="circle-mc yellow-mc"></div>
               </div>
            </div>
          </div>
        </div>

        {/* --- BACK (Style exact de ton BankCard original / dashboard.css) --- */}
        <div className="card-back">
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
          {/* Logo Mastercard aussi au dos si besoin, selon ton dashboard.css */}
          <img src="/mastercard.svg" className="mastercard" alt="" />
        </div>
      </div>

      <style jsx>{`
        .card-front {
          position: relative;
          overflow: hidden;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 14px;
        }

        .card-gloss {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }

        .card-top-row-custom { display: flex; justify-content: space-between; align-items: center; }
        
        .bper-logo-custom { font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; opacity: 0.8; }
        
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        .emv-chip-custom {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative; border: 0.5px solid rgba(0,0,0,0.1);
        }
        .chip-line-custom { position: absolute; background: rgba(0,0,0,0.2); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }

        .card-number-display {
          font-family: 'Roboto Mono', monospace;
          font-size: 17px;
          letter-spacing: 2px;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          margin: 10px 0;
        }

        .card-bottom-row-custom { display: flex; justify-content: space-between; align-items: flex-end; }
        
        .label-xs { font-size: 8px; opacity: 0.7; display: block; margin-bottom: 2px; }
        .val-sm { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }

        .card-meta-info { display: flex; align-items: flex-end; gap: 15px; }

        .mc-symbol-custom { display: flex; position: relative; width: 30px; height: 18px; }
        .circle-mc { width: 18px; height: 18px; border-radius: 50%; position: absolute; }
        .red-mc { background: #eb001b; left: 0; }
        .yellow-mc { background: #ff5f00; right: 0; opacity: 0.85; }
      `}</style>
    </div>
  );
}