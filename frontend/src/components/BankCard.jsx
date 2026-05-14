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
  const rawStatus = card.status || "inactive";
  const displayStatus = rawStatus === "En cours d'investigation" ? "EN COURS" : rawStatus;
  
  const statusLabel = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "EN COURS": "EN COURS"
  };

  const isCustom = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        
        {/* --- FACE AVANT (RECTO) --- */}
        <div 
          className="card-front" 
          style={isCustom ? { background: card.bg, padding: '20px', overflow: 'hidden' } : {}}
        >
          {isCustom && <div className="card-gloss-effect"></div>}

          {/* Header : Logo & NFC */}
          <div className="card-top-row-layout">
            {isCustom ? (
              <div className="bper-logo-pro" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank">BPER</div>
            )}
            <Wifi size={20} className="nfc-icon-pro" strokeWidth={1.5} />
          </div>

          {/* Puce EMV Réaliste */}
          <div className="chip-container-pro">
            {isCustom ? (
              <div className="emv-chip-pro">
                <div className="chip-line-h1"></div>
                <div className="chip-line-h2"></div>
                <div className="chip-line-v"></div>
              </div>
            ) : (
              <div className="chip"></div>
            )}
          </div>

          {/* Numéro de carte */}
          <div className="card-number-pro">
            {formatNumber(card.number)}
          </div>

          {/* Footer : Titulaire, Status & Mastercard */}
          <div className="card-footer-pro">
            <div className="footer-left">
              <div className="holder-block">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              
              {/* Badge Statut Lumineux */}
              <div className={`status-badge-pro ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot"></span>
                {statusLabel[displayStatus] || displayStatus}
              </div>
            </div>

            <div className="footer-right">
              <div className="exp-block">
                <span>EXP</span>
                <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
              </div>
              
              {/* Logo Mastercard EXACT (Taille & Forme) */}
              <div className="mc-symbol-pro">
                <div className="mc-red"></div>
                <div className="mc-orange"></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (VERSO) : STYLE PAR DÉFAUT INTACT --- */}
        <div className="card-back" style={isCustom ? { background: card.bg } : {}}>
          <div className="magnetic-stripe"></div>
          <div className="signature-area">
            <div className="cvv-box">
              <span>CVV</span>
              <strong>{card.cvv || "•••"}</strong>
            </div>
          </div>
          <div className="card-back-info">
            Informations bancaires confidentielles.
          </div>
        </div>
      </div>

      <style jsx>{`
        /* RECTO LAYOUT */
        .card-top-row-layout { display: flex; justify-content: space-between; align-items: center; z-index: 2; margin-bottom: 10px; }
        .bper-logo-pro { font-weight: 900; font-size: 19px; letter-spacing: -0.5px; }
        .bper-logo-pro span { color: #a3e635; }
        .bper-logo-pro small { font-size: 10px; font-weight: 400; opacity: 0.8; color: inherit; }
        .nfc-icon-pro { opacity: 0.8; transform: rotate(90deg); color: white; }

        /* PUCE EMV RÉALISTE */
        .emv-chip-pro {
          width: 40px; height: 30px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative; border: 1px solid rgba(0,0,0,0.15);
        }
        .chip-line-h1, .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; }
        .chip-line-h1 { top: 33%; } .chip-line-h2 { top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.2); height: 100%; width: 1px; left: 50%; }

        /* NUMÉRO */
        .card-number-pro { 
          font-family: 'Courier New', monospace; font-size: 18px; color: white; 
          letter-spacing: 2px; margin: 15px 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.4); z-index: 2;
        }

        /* FOOTER */
        .card-footer-pro { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .footer-left { display: flex; flex-direction: column; gap: 8px; }
        .footer-right { display: flex; align-items: flex-end; gap: 15px; }
        
        .holder-block span, .exp-block span { font-size: 7px; opacity: 0.8; color: white; display: block; margin-bottom: 2px; }
        .holder-block strong, .exp-block strong { font-size: 11px; color: white; text-transform: uppercase; }

        /* STATUT PRO */
        .status-badge-pro {
          display: flex; align-items: center; gap: 5px; background: rgba(0,0,0,0.3);
          padding: 3px 8px; border-radius: 12px; font-size: 8px; font-weight: 800; color: white;
          border: 1px solid rgba(255,255,255,0.1); width: fit-content;
        }
        .status-badge-pro .dot { width: 5px; height: 5px; border-radius: 50%; background: #94a3b8; }
        .en-cours .dot { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; animation: pulse 2s infinite; }
        .active .dot { background: #4ade80; box-shadow: 0 0 6px #4ade80; }

        /* MASTERCARD EXACT */
        .mc-symbol-pro { position: relative; width: 38px; height: 24px; }
        .mc-red, .mc-orange { width: 24px; height: 24px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        /* VERSO (INTACT) */
        .magnetic-stripe { width: 100%; height: 40px; background: #111; margin-top: 20px; }
        .signature-area { background: #eee; height: 35px; width: 80%; margin: 15px auto 0; display: flex; align-items: center; justify-content: flex-end; padding: 0 10px; }
        .cvv-box span { font-size: 8px; color: #666; margin-right: 5px; }
        .cvv-box strong { font-family: 'Courier New', monospace; font-style: italic; font-weight: 800; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        @media (max-width: 768px) {
          .card-number-pro { font-size: 15px; }
          .mc-symbol-pro { width: 32px; height: 20px; }
          .mc-red, .mc-orange { width: 20px; height: 20px; }
        }
      `}</style>
    </div>
  );
}