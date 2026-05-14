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

  // --- LOGIQUE DE STATUT SIMPLIFIÉE ---
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
        {/* --- FRONT --- */}
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
            {isCustomCard ? (
              <Wifi size={22} className="nfc-icon-custom" />
            ) : (
              <img src="/bancomat.svg" height="28" alt="bancomat" />
            )}
          </div>

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
            {/* BLOC GAUCHE : NOM + STATUT (BOUTON LUMINEUX) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <div>
                <span style={{ display: 'block', fontSize: '8px', opacity: 0.8 }}>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>

              {/* LE NOUVEAU STATUT LUMINEUX SOUS LE NOM */}
              <div className={`status-badge-bper ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot-light"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '8px', opacity: 0.8 }}>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

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
        /* STYLE DU STATUT BOUTON LUMINEUX */
        .status-badge-bper {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 8px;
          font-weight: 800;
          color: white;
          width: fit-content;
        }

        .dot-light {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #94a3b8;
        }

        /* COULEURS DES POINTS */
        .en-cours .dot-light, .active .dot-light { 
          box-shadow: 0 0 5px currentColor;
          animation: blink 2s infinite;
        }
        .en-cours .dot-light { background: #fbbf24; color: #fbbf24; }
        .active .dot-light { background: #4ade80; color: #4ade80; }
        .blocked .dot-light { background: #f87171; color: #f87171; }

        @keyframes blink {
          0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; }
        }

        /* TAILLE MASTERCARD CSS EXACTE */
        .mastercard-css-wrapper { position: relative; width: 45px; height: 28px; display: flex; align-items: center; }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.92; }

        /* LOGO BPER CUSTOM */
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; color: white; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none; z-index: 1;
        }
      `}</style>
    </div>
  );
}