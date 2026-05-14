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

  // Logique de statut simplifiée comme demandé
  const rawStatus = card.status || "inactive";
  const isPending = rawStatus === "En cours d'investigation" || rawStatus === "EN COURS";
  const displayStatus = isPending ? "EN COURS" : rawStatus;

  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "EN COURS": "EN COURS"
  };

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg } : {}}
        >
          {isCustomCard && <div className="card-gloss-overlay"></div>}

          <div className="card-header">
            {isCustomCard ? (
              <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank">BPER</div>
            )}
            {/* Wifi présent pour TOUTES les cartes */}
            <Wifi size={22} className="nfc-icon-shared" />
          </div>

          <div className="chip-area">
            {/* Puce EMV exacte pour TOUTES les cartes */}
            <div className="emv-chip-shared">
              <div className="chip-line-h"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          <div className="card-number">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer">
            {/* BLOC GAUCHE : NOM + STATUT LUMINEUX */}
            <div className="footer-left-info">
              <div className="holder-box">
                <span className="label">TITULAIRE</span>
                <strong className="value">{card.holder || "NOM CLIENT"}</strong>
              </div>

              <div className={`status-badge-bper ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot-light"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            {/* EXPEDITION */}
            <div className="exp-box">
              <span className="label">EXP</span>
              <strong className="value">{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD : TAILLE ET FORME EXACTES */}
            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
          {/* Le logo Mastercard est volontairement absent ici (caché sur la face CVV) */}
        </div>
      </div>

      <style jsx>{`
        /* PUCE EMV EXACTE */
        .emv-chip-shared {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative; border: 1px solid rgba(0,0,0,0.1);
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.2); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.2); }

        /* LOGO MASTERCARD TAILLE SVG 1:1 */
        .mastercard-css-wrapper {
          position: relative; width: 45px; height: 28px; display: flex; align-items: center;
        }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; z-index: 1; }
        .mc-orange { background: #ff5f00; right: 0; z-index: 2; opacity: 0.92; }

        /* WIFI ET DIVERS */
        .nfc-icon-shared { opacity: 0.8; transform: rotate(90deg); color: white; }
        .footer-left-info { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        .label { display: block; font-size: 8px; opacity: 0.8; margin-bottom: 2px; }
        .value { font-size: 13px; }

        /* STATUT LUMINEUX */
        .status-badge-bper {
          display: inline-flex; align-items: center; gap: 5px; padding: 2px 8px;
          background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; font-size: 8px; font-weight: 800; color: white; width: fit-content;
        }
        .dot-light { width: 5px; height: 5px; border-radius: 50%; background: #94a3b8; }
        
        .en-cours .dot-light, .active .dot-light { 
          box-shadow: 0 0 5px currentColor; animation: blink 2s infinite; 
        }
        .en-cours .dot-light { background: #fbbf24; color: #fbbf24; }
        .active .dot-light { background: #4ade80; color: #4ade80; }
        .blocked .dot-light { background: #f87171; color: #f87171; }

        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; opacity: 0.8; color: white; }
        
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none; z-index: 1;
        }
      `}</style>
    </div>
  );
}