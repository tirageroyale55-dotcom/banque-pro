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

  // Gestion du statut simplifié pour l'affichage
  const rawStatus = card.status || "inactive";
  const displayStatus = (rawStatus === "En cours d'investigation" || rawStatus === "EN COURS") 
    ? "EN COURS" 
    : rawStatus;

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${rawStatus.replace(/\s+/g, '-').toLowerCase()}`}
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

          {/* PUCE EMV RÉALISTE */}
          <div className="chip-area">
            {isCustomCard ? (
              <div className="emv-chip-pro">
                <div className="chip-line h-1"></div>
                <div className="chip-line h-2"></div>
                <div className="chip-line v-1"></div>
              </div>
            ) : (
              <div className="chip"></div>
            )}
          </div>

          <div className="card-number">{formatNumber(card.number)}</div>

          <div className="card-footer">
            <div className="footer-left">
              <div className="holder-info">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              
              {/* BADGE STATUT LUMINEUX SOUS LE NOM */}
              <div className={`status-badge-pro ${displayStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                <span className="dot"></span>
                {displayStatus.toUpperCase()}
              </div>
            </div>

            <div className="footer-right">
              <div className="exp-info">
                <span>EXP</span>
                <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
              </div>

              {/* LOGO MASTERCARD CSS EXACT */}
              <div className="mc-logo-css">
                <div className="circle red"></div>
                <div className="circle orange"></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic-stripe"></div>
          <div className="signature-area">
            <div className="cvv-display">
              <span>CVV</span>
              <strong>{card.cvv || "•••"}</strong>
            </div>
          </div>
          {/* Le logo BPER discret au dos pour le réalisme */}
          <div className="back-logo">BPER:</div>
        </div>

      </div>

      <style jsx>{`
        /* STRUCTURE 3D & FIXES */
        .card-front, .card-back {
          position: absolute; width: 100%; height: 100%;
          backface-visibility: hidden; border-radius: 15px;
          padding: 22px; display: flex; flex-direction: column;
          justify-content: space-between; overflow: hidden;
        }

        /* DESIGN FRONT */
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%);
          pointer-events: none; z-index: 1;
        }

        .bper-logo-custom { font-weight: 900; font-size: 20px; z-index: 2; }
        .bper-logo-custom span { color: #a3e635; }
        .bper-logo-custom small { font-size: 10px; font-weight: 400; color: white; opacity: 0.9; }
        .nfc-icon-custom { transform: rotate(90deg); color: white; opacity: 0.8; z-index: 2; }

        /* PUCE EMV PRO */
        .emv-chip-pro {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #eab308 100%);
          border-radius: 6px; position: relative; border: 0.5px solid rgba(0,0,0,0.2);
          box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
        }
        .chip-line { position: absolute; background: rgba(0,0,0,0.25); }
        .h-1 { top: 33%; width: 100%; height: 1px; }
        .h-2 { top: 66%; width: 100%; height: 1px; }
        .v-1 { left: 50%; height: 100%; width: 1px; }

        .card-number {
          font-family: 'Courier New', monospace; font-size: 18px;
          letter-spacing: 2px; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
          z-index: 2; margin: 15px 0;
        }

        /* FOOTER ALIGNEMENT */
        .card-footer { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .footer-left { display: flex; flex-direction: column; gap: 10px; }
        .footer-right { display: flex; align-items: flex-end; gap: 15px; }

        .holder-info span, .exp-info span { font-size: 8px; color: rgba(255,255,255,0.8); display: block; margin-bottom: 2px; }
        .holder-info strong, .exp-info strong { font-size: 12px; color: white; font-weight: 600; text-transform: uppercase; }

        /* BADGE STATUT LUMINEUX */
        .status-badge-pro {
          display: flex; align-items: center; gap: 6px; padding: 4px 10px;
          background: rgba(0,0,0,0.4); border-radius: 20px; font-size: 9px;
          font-weight: 800; border: 1px solid rgba(255,255,255,0.1); color: white;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; }
        .en-cours .dot, .active .dot { background: #4ade80; box-shadow: 0 0 8px #4ade80; animation: pulse 2s infinite; }
        
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        /* MASTERCARD CSS EXACT */
        .mc-logo-css { position: relative; width: 40px; height: 25px; }
        .circle { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .orange { background: #ff5f00; right: 0; opacity: 0.9; }

        /* DESIGN BACK (PROPRE) */
        .card-back { background: #1e293b; padding: 0 !important; }
        .magnetic-stripe { width: 100%; height: 45px; background: #0f172a; margin-top: 25px; }
        .signature-area { 
          width: 80%; height: 35px; background: #f8fafc; margin: 20px auto; 
          display: flex; align-items: center; justify-content: flex-end; padding: 0 15px;
        }
        .cvv-display span { font-size: 8px; color: #64748b; margin-right: 10px; }
        .cvv-display strong { font-style: italic; color: #1e293b; font-size: 14px; }
        .back-logo { position: absolute; bottom: 20px; right: 20px; color: rgba(255,255,255,0.1); font-weight: 900; }

        @media (max-width: 768px) {
          .card-number { font-size: 15px; }
          .emv-chip-pro { width: 35px; height: 26px; }
          .mc-logo-css { width: 35px; height: 22px; }
          .circle { width: 22px; height: 22px; }
        }
      `}</style>
    </div>
  );
}