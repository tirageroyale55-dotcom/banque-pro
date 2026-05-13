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

  // Logique de statut originale
  const status = card.status || "inactive";
  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "En cours d'investigation": "DEMANDE EN COURS"
  };

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FRONT --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg } : {}}
        >
          {isCustomCard && <div className="card-gloss-overlay"></div>}

          {/* HEADER (Commun aux deux designs pour garder l'alignement) */}
          <div className="card-header">
            {isCustomCard ? (
              <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank">BPER</div>
            )}
            {isCustomCard ? (
              <Wifi size={22} className="nfc-icon-custom" />
            ) : (
              <img src="/bancomat.svg" height="28" alt="bancomat" />
            )}
          </div>

          {/* STATUT (REMIS EXACTEMENT COMME AVANT) */}
          <div className={`card-status ${status}`}>
            {statusText[status] || status}
          </div>

          {/* CHIP AREA */}
          <div className="chip-area">
            {isCustomCard ? (
              <div className="emv-chip-custom">
                <div className="chip-line-h"></div>
                <div className="chip-line-v"></div>
              </div>
            ) : (
              <div className="chip"></div>
            )}
          </div>

          <div className="card-number">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer">
            <div>
              <span>TITULAIRE</span>
              <strong>{card.holder || "NOM CLIENT"}</strong>
            </div>

            <div>
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD : TAILLE ET FORME EXACTE SVG */}
            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- BACK --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* OVERLAY BRILLANCE */
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none; z-index: 1;
        }

        /* LOGO BPER CUSTOM */
        .bper-logo-custom { font-weight: 900; font-size: 19px; letter-spacing: -0.5px; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; opacity: 0.8; color: white; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        /* PUCE EMV CUSTOM */
        .emv-chip-custom {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative; border: 1px solid rgba(0,0,0,0.1);
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.2); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.2); }

        /* LOGO MASTERCARD CSS - TAILLE SVG 1:1 */
        .mastercard-css-wrapper {
          position: relative;
          width: 45px; /* Largeur totale identique au SVG */
          height: 28px;
          display: flex;
          align-items: center;
        }
        .mc-circle {
          width: 28px; /* Forme ronde parfaite */
          height: 28px;
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
          opacity: 0.92;
        }
      `}</style>
    </div>
  );
}