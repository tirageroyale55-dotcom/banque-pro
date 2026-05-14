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

  // Logique de statut simplifiée
  const rawStatus = card.status || "inactive";
  const displayStatus = rawStatus === "En cours d'investigation" ? "EN COURS" : rawStatus;

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT --- */}
        <div className="card-front" style={isCustomCard ? { background: card.bg } : {}}>
          {isCustomCard && <div className="card-gloss-overlay"></div>}

          {/* HEADER */}
          <div className="card-header">
            {isCustomCard ? (
              <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank">BPER</div>
            )}
            <Wifi size={22} className="nfc-icon-custom" />
          </div>

          {/* PUCE EMV (Rétablie avec le style exact) */}
          <div className="chip-area">
            <div className="emv-chip-custom">
              <div className="chip-line-h1"></div>
              <div className="chip-line-h2"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          <div className="card-number">{formatNumber(card.number)}</div>

          {/* FOOTER - ALIGNEMENT FIXE */}
          <div className="card-footer">
            {/* BLOC TITULAIRE + STATUT */}
            <div className="footer-main-info">
              <div className="holder-block">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              
              {/* BADGE STATUT LUMINEUX */}
              <div className={`status-badge-pro ${displayStatus.replace(/\s+/g, '-').toLowerCase()}`}>
                <span className="dot-light"></span>
                {displayStatus.toUpperCase()}
              </div>
            </div>

            {/* BLOC EXPIRATION */}
            <div className="expiration-block">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD CSS (Taille et forme exactes) */}
            <div className="mastercard-symbol-final">
              <div className="mc-circle-red"></div>
              <div className="mc-circle-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* PUCE EMV PREMIUM */
        .emv-chip-custom {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative; border: 1px solid rgba(0,0,0,0.15);
        }
        .chip-line-h1, .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.25); width: 100%; height: 1px; }
        .chip-line-h1 { top: 33%; } .chip-line-h2 { top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.25); height: 100%; width: 1px; left: 50%; }

        /* FOOTER STRUCTURE */
        .card-footer { 
          display: flex; 
          align-items: flex-end; 
          justify-content: space-between;
          padding-top: 10px;
        }
        .footer-main-info { display: flex; flex-direction: column; gap: 5px; }
        .holder-block span, .expiration-block span { font-size: 7px; opacity: 0.8; margin-bottom: 2px; }
        .holder-block strong, .expiration-block strong { font-size: 11px; white-space: nowrap; }

        /* STATUS BADGE */
        .status-badge-pro {
          display: flex; align-items: center; gap: 5px;
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
          padding: 2px 8px; border-radius: 12px; font-size: 8px; font-weight: 800; color: #fff;
        }
        .dot-light { width: 5px; height: 5px; border-radius: 50%; background: #94a3b8; }
        
        .active .dot-light { background: #4ade80; box-shadow: 0 0 6px #4ade80; animation: blink 2s infinite; }
        .en-cours .dot-light { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: blink 2s infinite; }
        
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* MASTERCARD LOGO (Taille du SVG original) */
        .mastercard-symbol-final { position: relative; width: 40px; height: 24px; }
        .mc-circle-red, .mc-circle-orange { width: 24px; height: 24px; border-radius: 50%; position: absolute; }
        .mc-circle-red { background: #eb001b; left: 0; }
        .mc-circle-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        /* LOGO BPER CUSTOM */
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; color: white; opacity: 0.8; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}