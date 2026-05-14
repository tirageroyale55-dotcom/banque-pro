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

  const isCustomCard = !!card.bg;
  const status = card.status === "En cours d'investigation" ? "EN COURS" : (card.status || "inactive");
  
  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "EN COURS": "EN COURS"
  };

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div className="card-front" style={isCustomCard ? { background: card.bg } : {}}>
          {isCustomCard && <div className="card-gloss-overlay"></div>}

          {/* HEADER HEADER */}
          <div className="card-header">
            {isCustomCard ? (
              <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
            ) : (
              <div className="card-bank">BPER</div>
            )}
            <Wifi size={20} className="nfc-icon-custom" strokeWidth={1.5} />
          </div>

          {/* PUCE RÉALISTE EMV */}
          <div className="chip-area">
            <div className="emv-chip-realist">
              <div className="chip-line-h1"></div>
              <div className="chip-line-h2"></div>
              <div className="chip-line-v"></div>
            </div>
          </div>

          {/* NUMÉRO DE CARTE */}
          <div className="card-number">{formatNumber(card.number)}</div>

          {/* FOOTER AVEC ALIGNEMENT FIXE */}
          <div className="card-footer">
            <div className="footer-left-info">
              <div className="holder-section">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>
              
              {/* BADGE STATUT LUMINEUX SOUS LE NOM */}
              <div className={`status-badge-pro ${status.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot-light"></span>
                {statusText[status] || status}
              </div>
            </div>

            <div className="footer-right-info">
              <div className="exp-section">
                <span>EXP</span>
                <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
              </div>

              {/* LOGO MASTERCARD CSS TAILLE RÉELLE */}
              <div className="mc-logo-css">
                <div className="mc-red-circle"></div>
                <div className="mc-orange-circle"></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FACE ARRIÈRE (BACK) - NETTOYÉE --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic-stripe"></div>
          <div className="signature-area">
            <div className="cvv-box">
              <span>CVV</span>
              <strong>{card.cvv || "•••"}</strong>
            </div>
          </div>
          {/* Rien d'autre ici pour ne pas polluer le design arrière */}
        </div>
      </div>

      <style jsx>{`
        /* STRUCTURE GLOBALE */
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.07) 48%, rgba(255,255,255,0) 52%);
          z-index: 1; pointer-events: none;
        }

        /* PUCE EMV RÉALISTE */
        .emv-chip-realist {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; border: 1px solid rgba(0,0,0,0.2);
        }
        .chip-line-h1, .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; }
        .chip-line-h1 { top: 33%; } .chip-line-h2 { top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.2); height: 100%; width: 1px; left: 50%; }

        /* FOOTER ALIGNEMENT */
        .card-footer { display: flex; justify-content: space-between; align-items: flex-end; width: 100%; }
        .footer-left-info { display: flex; flex-direction: column; gap: 6px; }
        .footer-right-info { display: flex; align-items: flex-end; gap: 15px; }

        /* BADGE PRO */
        .status-badge-pro {
          display: flex; align-items: center; gap: 5px; padding: 3px 8px;
          background: rgba(0,0,0,0.4); border-radius: 4px; font-size: 8px; color: white;
          width: fit-content; border: 1px solid rgba(255,255,255,0.1);
        }
        .dot-light { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 5px #4ade80; animation: pulse 2s infinite; }
        .en-cours .dot-light { background: #fbbf24; box-shadow: 0 0 5px #fbbf24; }

        /* MASTERCARD CSS EXACT */
        .mc-logo-css { position: relative; width: 36px; height: 22px; }
        .mc-red-circle, .mc-orange-circle { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .mc-red-circle { background: #eb001b; left: 0; }
        .mc-orange-circle { background: #ff5f00; right: 0; opacity: 0.9; }

        /* DOS DE CARTE */
        .magnetic-stripe { width: 100%; height: 40px; background: #1a1a1a; margin-top: 20px; }
        .signature-area { background: #eee; width: 80%; height: 35px; margin: 20px auto; display: flex; justify-content: flex-end; align-items: center; padding-right: 10px; }
        .cvv-box span { font-size: 8px; color: #666; margin-right: 5px; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}