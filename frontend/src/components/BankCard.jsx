import { useState } from "react";
import { Wifi } from 'lucide-react';

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  // Formatage du numéro (ex: •••• •••• •••• 4444)
  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    const last4 = num.toString().slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  // Détection du type de design
  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${card.status || 'inactive'}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { 
            background: card.bg, 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            overflow: 'hidden'
          } : {}}
        >
          {isCustomCard ? (
            /* DESIGN EXACT : CARDORDERCONFIRMATION */
            <>
              <div className="card-gloss-effect"></div>
              
              <div className="card-top-row-custom">
                <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                  BPER<span>:</span> <small>Banca</small>
                </div>
                <Wifi size={20} className="nfc-icon-custom" strokeWidth={1.5} />
              </div>

              <div className="emv-chip-custom">
                <div className="chip-line-h1"></div>
                <div className="chip-line-h2"></div>
                <div className="chip-line-v"></div>
              </div>

              <div className="card-mid-row-custom">
                {formatNumber(card.number)}
              </div>

              <div className="card-bottom-row-custom">
                <div className="holder-info-custom">
                  <span className="label-custom">TITULAIRE</span>
                  <span className="value-custom">{card.holder || "NOM CLIENT"}</span>
                </div>
                <div className="exp-info-custom">
                  <span className="label-custom">EXP</span>
                  <span className="value-custom">{card.expiry || `${card.exp_month}/${card.exp_year}`}</span>
                </div>
                {/* LOGO MASTERCARD EXACT */}
                <div className="mc-symbol-custom">
                  <div className="circle-red"></div>
                  <div className="circle-yellow"></div>
                </div>
              </div>
            </>
          ) : (
            /* DESIGN PAR DÉFAUT (INCHANGÉ) */
            <>
              <div className="card-header">
                <div className="card-bank">BPER</div>
                <img src="/bancomat.svg" height="28" alt="bancomat" />
              </div>
              <div className="chip-area"><div className="chip"></div></div>
              <div className="card-number">{formatNumber(card.number)}</div>
              <div className="card-footer">
                <div><span>TITULAIRE</span><strong>{card.holder}</strong></div>
                <div><span>EXP</span><strong>{card.exp_month}/{card.exp_year}</strong></div>
                <img src="/mastercard.svg" className="mastercard" alt="mc" />
              </div>
            </>
          )}
        </div>

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* EFFETS ET LOGOS DU DESIGN "CUSTOM" */
        .card-gloss-effect {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }
        .card-top-row-custom { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo-custom { font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; opacity: 0.8; color: white; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        .emv-chip-custom {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 4px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.1);
        }
        .chip-line-h1, .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; }
        .chip-line-h1 { top: 33%; } .chip-line-h2 { top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.2); height: 100%; width: 1px; left: 50%; }

        .card-mid-row-custom { 
          z-index: 2; color: white; font-family: 'Courier New', monospace; 
          font-size: 17px; letter-spacing: 1px; margin: 10px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .card-bottom-row-custom { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .label-custom { display: block; font-size: 7px; color: rgba(255,255,255,0.7); margin-bottom: 2px; }
        .value-custom { display: block; font-size: 11px; color: white; font-weight: 600; text-transform: uppercase; }

        /* SYMBOLE MASTERCARD CSS */
        .mc-symbol-custom { display: flex; position: relative; width: 32px; height: 20px; }
        .circle-red, .circle-yellow { width: 20px; height: 20px; border-radius: 50%; position: absolute; }
        .circle-red { background: #eb001b; left: 0; }
        .circle-yellow { background: #ff5f00; right: 0; opacity: 0.85; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .card-mid-row-custom { font-size: 14px; }
          .value-custom { font-size: 9px; }
          .emv-chip-custom { width: 32px; height: 24px; }
        }
      `}</style>
    </div>
  );
}