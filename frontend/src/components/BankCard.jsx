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
      className={`card-container-fixed ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (RECTO) --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg } : {}}
        >
          {isCustomCard && <div className="card-gloss-overlay"></div>}

          {/* Header : Logo + Wifi */}
          <div className="card-header-row">
            {isCustomCard ? (
              <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank-default">BPER</div>
            )}
            <Wifi size={22} className="wifi-icon" />
          </div>

          {/* Puce EMV réelle */}
          <div className="chip-container">
            <div className="emv-chip-pro">
              <div className="chip-line-h"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          {/* Numéro de carte */}
          <div className="card-number-display">
            {formatNumber(card.number)}
          </div>

          {/* Footer : Titulaire, Statut, Exp, Mastercard */}
          <div className="card-footer-row">
            <div className="footer-left">
              <div className="holder-info">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>

              {/* Statut Lumineux */}
              <div className={`status-pill ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="light-dot"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            <div className="footer-mid">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* Mastercard (Recto Seul) */}
            <div className="mastercard-logo-fixed">
              <div className="mc-circle-red"></div>
              <div className="mc-circle-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (VERSO) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="mag-stripe"></div>
          <div className="cvv-area">
            <span>CVV</span>
            <div className="cvv-box">{card.cvv || "•••"}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* RESET ET DIMENSIONS FIXES (Identique Mobile/Desktop) */
        .card-container-fixed {
          width: 340px;
          height: 210px;
          perspective: 1000px;
          cursor: pointer;
          margin: 10px auto;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .card-container-fixed.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 15px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .card-back {
          transform: rotateY(180deg);
          background: #222;
          padding: 0;
          justify-content: flex-start;
        }

        /* HEADER */
        .card-header-row { display: flex; justify-content: space-between; align-items: center; }
        .card-bank-default { font-weight: bold; font-size: 20px; color: white; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; color: white; }
        .bper-logo-custom span { color: #a3e635; }
        .wifi-icon { color: white; transform: rotate(90deg); opacity: 0.8; }

        /* PUCE EMV */
        .emv-chip-pro {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative;
          border: 0.5px solid rgba(0,0,0,0.3);
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.2); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.2); }

        /* NUMÉRO */
        .card-number-display {
          font-family: 'Courier New', monospace;
          font-size: 20px;
          letter-spacing: 2px;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        /* FOOTER */
        .card-footer-row { display: flex; justify-content: space-between; align-items: flex-end; }
        .footer-left { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .holder-info span, .footer-mid span { font-size: 8px; opacity: 0.8; color: white; }
        .holder-info strong, .footer-mid strong { font-size: 13px; color: white; display: block; }

        /* STATUT PILL */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(0,0,0,0.5);
          border-radius: 20px;
          font-size: 9px;
          font-weight: bold;
          color: white;
          width: fit-content;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .light-dot { width: 6px; height: 6px; border-radius: 50%; }
        .active .light-dot { background: #4ade80; box-shadow: 0 0 6px #4ade80; animation: pulse 2s infinite; }
        .en-cours .light-dot { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: pulse 2s infinite; }
        .blocked .light-dot { background: #f87171; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        /* MASTERCARD LOGO (TAILLE EXACTE) */
        .mastercard-logo-fixed { position: relative; width: 45px; height: 28px; display: flex; align-items: center; }
        .mc-circle-red, .mc-circle-orange { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-circle-red { background: #eb001b; left: 0; z-index: 1; }
        .mc-circle-orange { background: #ff5f00; right: 0; z-index: 2; opacity: 0.9; }

        /* VERSO STYLES */
        .mag-stripe { width: 100%; height: 40px; background: #000; margin-top: 20px; }
        .cvv-area { padding: 20px; display: flex; align-items: center; gap: 10px; }
        .cvv-area span { color: white; font-size: 10px; }
        .cvv-box { background: white; color: black; padding: 5px 10px; font-style: italic; font-weight: bold; border-radius: 3px; }

        /* FORCE LE RATIO SUR MOBILE */
        @media (max-width: 480px) {
          .card-container-fixed {
            transform: scale(0.9); /* On réduit légèrement la taille globale pour les petits écrans sans casser le layout */
            margin-top: -10px;
          }
        }
      `}</style>
    </div>
  );
}