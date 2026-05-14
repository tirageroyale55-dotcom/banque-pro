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

  // Gestion du statut simplifié
  const statusRaw = card.status === "En cours d'investigation" ? "EN COURS" : (card.status || "inactive");
  const statusClass = statusRaw.replace(/\s+/g, '-').toLowerCase();

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${statusClass}`}
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

          {/* PUCE RÉALISTE VERROUILLÉE */}
          <div className="chip-area">
            <div className="emv-chip-realistic">
              <div className="chip-line-h"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          <div className="card-number">{formatNumber(card.number)}</div>

          <div className="card-footer">
            <div className="footer-left-group">
              <div className="holder-section">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              
              {/* STATUS BADGE LUMINEUX SOUS LE NOM */}
              <div className={`card-status-badge ${statusClass}`}>
                <span className="status-dot"></span>
                {statusRaw.toUpperCase()}
              </div>
            </div>

            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* LOGO MASTERCARD CSS - TAILLE EXACTE SVG */}
            <div className="mastercard-css-wrapper">
              <div className="mc-circle mc-red"></div>
              <div className="mc-circle mc-orange"></div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          {/* Le logo et l'EXP ne s'affichent PLUS ici */}
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
          <div className="back-info">
            <p>Cette carte est la propriété de BPER Banca.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* STRUCTURE GLOBALE */
        .card-inner { position: relative; width: 100%; height: 100%; text-align: left; transition: transform 0.6s; transform-style: preserve-3d; }
        .card-front, .card-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 15px; overflow: hidden; }
        .card-back { transform: rotateY(180deg); display: flex; flex-direction: column; }

        /* HEADER & LOGO */
        .card-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .nfc-icon-custom { opacity: 0.8; transform: rotate(90deg); color: white; }

        /* PUCE EMV RÉALISTE */
        .chip-area { padding: 0 20px; margin-top: -10px; }
        .emv-chip-realistic {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; border: 1px solid rgba(0,0,0,0.2);
        }
        .chip-line-h { position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(0,0,0,0.3); }
        .chip-line-v { position: absolute; left: 50%; height: 100%; width: 1px; background: rgba(0,0,0,0.3); }

        /* NUMÉRO */
        .card-number { padding: 20px; font-size: 18px; letter-spacing: 2px; font-family: 'Courier New', monospace; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); }

        /* FOOTER */
        .card-footer { 
          padding: 0 20px 20px; 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end;
          position: absolute;
          bottom: 0;
          width: 100%;
        }
        .footer-left-group { display: flex; flex-direction: column; gap: 6px; }
        .holder-section span, .exp-section span { font-size: 8px; opacity: 0.8; color: white; }
        .holder-section strong, .exp-section strong { font-size: 12px; color: white; display: block; }

        /* BADGE STATUT LUMINEUX */
        .card-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; border-radius: 12px; font-size: 8px; font-weight: 800;
          background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: white;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; }
        .active .status-dot { background: #4ade80; box-shadow: 0 0 8px #4ade80; animation: pulse 2s infinite; }
        .en-cours .status-dot { background: #fbbf24; box-shadow: 0 0 8px #fbbf24; animation: pulse 2s infinite; }

        /* MASTERCARD LOGO EXACT */
        .mastercard-css-wrapper { position: relative; width: 45px; height: 28px; margin-left: 10px; }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        /* BACK SIDE */
        .magnetic { width: 100%; height: 40px; background: #222; margin-top: 20px; }
        .cvv-box { background: white; width: 80%; height: 30px; margin: 20px auto; display: flex; align-items: center; justify-content: flex-end; padding: 0 10px; color: #333; font-style: italic; font-weight: bold; }
        .back-info { font-size: 7px; color: rgba(255,255,255,0.5); text-align: center; padding: 10px; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        @media (max-width: 768px) {
          .card-number { font-size: 15px; }
          .bper-logo-custom { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}