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

  const status = card.status === "En cours d'investigation" ? "EN COURS" : (card.status || "inactive");
  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div className="card-front" style={isCustomCard ? { background: card.bg } : {}}>
          {isCustomCard && <div className="card-gloss-overlay"></div>}

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

          <div className="chip-area">
            <div className={isCustomCard ? "emv-chip-realistic" : "chip"}>
              {isCustomCard && (
                <>
                  <div className="chip-line-h"></div>
                  <div className="chip-line-v"></div>
                </>
              )}
            </div>
          </div>

          <div className="card-number">{formatNumber(card.number)}</div>

          <div className="card-footer">
            <div className="footer-left-group">
              <div className="holder-section">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              <div className={`card-status-badge ${status.replace(/\s+/g, '-').toLowerCase()}`}>
                <span className="status-dot"></span>
                {status === "EN COURS" ? "EN COURS" : status.toUpperCase()}
              </div>
            </div>

            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD CSS - TAILLE ET FORME EXACTE */}
            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic-strip"></div>
          <div className="cvv-area">
            <div className="signature-panel"></div>
            <div className="cvv-box">
              <span>CVV</span>
              <strong>{card.cvv || "•••"}</strong>
            </div>
          </div>
          {/* Aucun logo ou texte EXP ici pour rester fidèle au style par défaut */}
        </div>
      </div>

      <style jsx>{`
        /* PUCE RÉALISTE */
        .emv-chip-realistic {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; border: 0.5px solid rgba(0,0,0,0.2);
          box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.3); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.3); }

        /* FOOTER ALIGNEMENT */
        .card-footer { display: flex; align-items: flex-end; justify-content: space-between; padding-top: 10px; }
        .footer-left-group { display: flex; flex-direction: column; gap: 8px; }
        .holder-section strong, .exp-section strong { font-family: 'Courier New', monospace; letter-spacing: 1px; }

        /* BADGE STATUT LUMINEUX */
        .card-status-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px;
          border-radius: 20px; font-size: 9px; font-weight: 800;
          background: rgba(0, 0, 0, 0.35); color: white; border: 1px solid rgba(255,255,255,0.1);
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
        .en-cours .status-dot { background: #fbbf24; animation: pulse 2s infinite; }

        /* LOGO MASTERCARD CSS EXACT */
        .mastercard-css-wrapper { position: relative; width: 44px; height: 26px; }
        .mc-circle { width: 26px; height: 26px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        /* DOS DE LA CARTE (BACK) */
        .magnetic-strip { background: #1a1a1a; width: 100%; height: 40px; margin-top: 20px; }
        .cvv-area { display: flex; align-items: center; padding: 20px; gap: 10px; }
        .signature-panel { background: rgba(255,255,255,0.8); height: 30px; flex: 1; border-radius: 4px; }
        .cvv-box { background: white; padding: 5px 10px; border-radius: 4px; color: #333; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* LOGO BPER */
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}