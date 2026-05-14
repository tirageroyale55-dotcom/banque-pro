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
      className={`card-3d-container ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner-3d">
        {/* --- FACE AVANT --- */}
        <div 
          className="card-front-side" 
          style={isCustomCard ? { background: card.bg } : {}}
        >
          {isCustomCard && <div className="gloss-effect"></div>}

          <div className="card-header-row">
            {isCustomCard ? (
              <div className="bper-logo-custom">
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank-default">BPER</div>
            )}
            <Wifi size={24} className="wifi-icon" />
          </div>

          <div className="chip-container">
            <div className="emv-chip-real">
              <div className="chip-line-h"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          <div className="card-number-display">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer-row">
            <div className="info-group">
              <div className="holder-box">
                <span className="label">TITULAIRE</span>
                <strong className="value">{card.holder || "NOM CLIENT"}</strong>
              </div>

              <div className={`status-pill ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="status-dot"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            <div className="exp-box">
              <span className="label">EXP</span>
              <strong className="value">{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            <div className="mastercard-logo-css">
              <div className="circle-red"></div>
              <div className="circle-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE --- */}
        <div className="card-back-side" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="mag-stripe"></div>
          <div className="cvv-area">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* FIX IPHONE : Dimensions forcées pour éviter le désordre */
        .card-3d-container {
          width: 100%;
          max-width: 340px;
          aspect-ratio: 1.58 / 1; /* Format carte bancaire standard */
          perspective: 1000px;
          margin: 0 auto;
        }

        .card-inner-3d {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .card-3d-container.flipped .card-inner-3d { transform: rotateY(180deg); }

        .card-front-side, .card-back-side {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box; /* Crucial pour iPhone */
          overflow: hidden;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .card-back-side { transform: rotateY(180deg); background: #222; }

        /* HEADER */
        .card-header-row { display: flex; justify-content: space-between; align-items: center; }
        .bper-logo-custom { font-weight: 900; font-size: 18px; color: white; }
        .bper-logo-custom span { color: #a3e635; }
        .card-bank-default { font-weight: bold; font-size: 20px; color: white; }
        .wifi-icon { color: white; transform: rotate(90deg); opacity: 0.9; }

        /* PUCE */
        .emv-chip-real {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 4px; position: relative;
        }

        /* NUMÉRO */
        .card-number-display {
          font-family: 'Courier New', monospace;
          font-size: clamp(16px, 5vw, 20px);
          color: white;
          letter-spacing: 2px;
          margin-top: 10px;
        }

        /* FOOTER & STATUT */
        .card-footer-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .info-group { display: flex; flex-direction: column; gap: 8px; }
        .label { font-size: 8px; opacity: 0.7; color: white; display: block; }
        .value { font-size: 11px; color: white; display: block; }

        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 2px 8px; background: rgba(0,0,0,0.5);
          border-radius: 10px; border: 0.5px solid rgba(255,255,255,0.2);
          font-size: 8px; font-weight: bold; color: white; width: fit-content;
        }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; }
        .en-cours .status-dot { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; animation: blink 2s infinite; }
        .active .status-dot { background: #4ade80; box-shadow: 0 0 5px #4ade80; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        /* MASTERCARD LOGO CSS EXACT */
        .mastercard-logo-css { position: relative; width: 42px; height: 26px; margin-left: auto; }
        .circle-red, .circle-orange { width: 26px; height: 26px; border-radius: 50%; position: absolute; }
        .circle-red { background: #eb001b; left: 0; }
        .circle-orange { background: #ff5f00; right: 0; opacity: 0.92; }

        /* VERSO */
        .mag-stripe { background: #000; height: 40px; width: 100%; margin: 10px -18px; }
        .cvv-area { background: white; padding: 5px 10px; border-radius: 4px; color: black; text-align: right; width: 60px; margin-left: auto; }

        .gloss-effect {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}