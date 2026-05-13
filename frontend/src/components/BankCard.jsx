import { useState } from "react";
import { Wifi } from 'lucide-react';

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);
  if (!card) return null;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    const last4 = num.toString().slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${card.status || 'inactive'}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* FACE AVANT */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg, padding: '20px', overflow: 'hidden' } : {}}
        >
          {isCustomCard ? (
            <div className="custom-layout">
              <div className="card-gloss-overlay"></div>
              
              <div className="top-section">
                <div className="bper-logo-auth" style={{ color: card.logoColor }}>
                  BPER<span>:</span> <small>Banca</small>
                </div>
                <Wifi size={20} className="nfc-icon-auth" />
              </div>

              <div className="emv-chip-auth">
                <div className="chip-line-h"></div>
                <div className="chip-line-v"></div>
              </div>

              <div className="card-number-auth">
                {formatNumber(card.number)}
              </div>

              <div className="bottom-section">
                <div className="user-details">
                  <div className="detail-block">
                    <span className="label">TITULAIRE</span>
                    <span className="value">{card.holder || "NOM CLIENT"}</span>
                  </div>
                  <div className="detail-block">
                    <span className="label">EXP</span>
                    <span className="value">{card.expiry || "MM/AA"}</span>
                  </div>
                </div>

                {/* LOGO MASTERCARD CSS - TAILLE ET FORME IDENTIQUE À L'SVG */}
                <div className="mastercard-logo-css">
                  <div className="mc-circle mc-red"></div>
                  <div className="mc-circle mc-orange"></div>
                </div>
              </div>
            </div>
          ) : (
            /* VERSION PAR DÉFAUT */
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

        {/* FACE ARRIÈRE */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-layout {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .card-gloss-overlay {
          position: absolute; top: -20px; left: -20px; width: 150%; height: 150%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }

        .bper-logo-auth { font-weight: 900; font-size: 19px; }
        .bper-logo-auth span { color: #a3e635; }
        .bper-logo-auth small { font-size: 10px; opacity: 0.8; font-weight: 400; color: white; }

        .top-section { display: flex; justify-content: space-between; align-items: center; }
        .nfc-icon-auth { transform: rotate(90deg); color: white; opacity: 0.7; }

        .emv-chip-auth {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; border: 0.5px solid rgba(0,0,0,0.2);
          position: relative;
        }

        .card-number-auth {
          font-family: 'Courier New', monospace;
          font-size: 18px; color: white; letter-spacing: 1.5px;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
        }

        .bottom-section { display: flex; justify-content: space-between; align-items: flex-end; }
        .label { display: block; font-size: 7px; color: rgba(255,255,255,0.6); margin-bottom: 2px; }
        .value { display: block; font-size: 11px; color: white; font-weight: 700; }

        /* --- LOGO MASTERCARD CSS RÉGLÉ SUR TAILLE SVG --- */
        .mastercard-logo-css {
          position: relative;
          width: 38px;  /* Taille exacte du logo par défaut */
          height: 24px;
          display: flex;
        }
        .mc-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          position: absolute;
        }
        .mc-red {
          background: #eb001b;
          left: 0;
          z-index: 1;
        }
        .mc-orange {
          background: #ff5f00;
          right: 0;
          z-index: 2;
          opacity: 0.92; /* Pour l'effet de superposition */
        }

        @media (max-width: 768px) {
          .card-number-auth { font-size: 15px; }
          .mastercard-logo-css { width: 34px; height: 21px; }
          .mc-circle { width: 21px; height: 21px; }
        }
      `}</style>
    </div>
  );
}