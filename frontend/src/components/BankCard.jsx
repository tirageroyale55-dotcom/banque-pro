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
    inactive: "CARTE INACTIVE",
    active: "CARTE ACTIVE",
    blocked: "CARTE BLOQUÉE",
    "EN COURS": "EN COURS"
  };

  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${rawStatus}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (RECTO) : LOGO MASTERCARD PRÉSENT --- */}
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
            <Wifi size={22} className="nfc-icon-all" />
          </div>

          <div className="chip-area">
            <div className="emv-chip-real">
              <div className="chip-line horizontal-1"></div>
                          <div className="chip-line horizontal-2"></div>
                          <div className="chip-line vertical"></div>
            </div>
          </div>

          <div className="card-number">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer">
            <div className="footer-left-group">
              <div className="holder-section">
                <span>TITULAIRE</span>
                <strong>{card.holder || "NOM CLIENT"}</strong>
              </div>

              <div className={`status-badge-bper ${displayStatus.toLowerCase().replace(/\s/g, '-')}`}>
                <span className="dot-light"></span>
                {statusText[displayStatus] || displayStatus}
              </div>
            </div>

            <div className="exp-section">
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>

            {/* On n'affiche le logo QUE si la carte n'est PAS retournée */}
{!flipped && (
  <div 
  className="mastercard-fixed-layout" 
  style={{ 
    opacity: flipped ? 0 : 1, 
    transition: 'opacity 0.1s ease' // Disparition ultra rapide
  }}
>
  <div className="mc-circle mc-red"></div>
  <div className="mc-circle mc-orange"></div>
</div>
)}
          </div>
        </div>

        {/* --- FACE ARRIÈRE (VERSO) : AUCUN LOGO MASTERCARD --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
          {/* Le logo Mastercard a été supprimé d'ici pour toutes les versions */}
        </div>
      </div>

      <style jsx>{`
        .footer-left-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
        
        .status-badge-bper {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 8px;
          font-weight: 800;
          color: white;
          width: fit-content;
        }

        .dot-light { width: 6px; height: 6px; border-radius: 50%; }

        .en-cours .dot-light, .active .dot-light { 
          animation: blink-status 2s infinite; 
          box-shadow: 0 0 6px currentColor;
        }
        .en-cours .dot-light { background: #fbbf24; color: #fbbf24; }
        .active .dot-light { background: #4ade80; color: #4ade80; }
        .blocked .dot-light { background: #f87171; color: #f87171; }
        .inactive .dot-light { background: #94a3b8; }

        @keyframes blink-status { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .emv-chip-real {
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.15);
        }
        .chip-line { position: absolute; background: rgba(0,0,0,0.2); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }

        /* TAILLE EXACTE MASTERCARD */
        .mastercard-fixed-layout {
          position: relative; width: 45px; height: 28px;
          display: flex; align-items: center; margin-left: 10px;
        }
        .mc-circle { width: 28px; height: 28px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; z-index: 1; }
        .mc-orange { background: #ff5f00; right: 0; z-index: 2; opacity: 0.92; }

        .nfc-icon-all { opacity: 0.8; transform: rotate(90deg); color: white; }
        .bper-logo-custom { font-weight: 900; font-size: 19px; }
        .bper-logo-custom span { color: #a3e635; }
        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none; z-index: 1;
        }

        /* 1. Force la séparation des faces pour Safari */
.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d; /* CRITIQUE */
}

/* 2. Cache l'envers de chaque face pendant la rotation */
.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden; /* CRITIQUE POUR IPHONE */
  backface-visibility: hidden;         /* CRITIQUE */
  -webkit-transform-style: preserve-3d;
}

/* 3. Assure-toi que la face arrière est bien retournée par défaut */
.card-back {
  transform: rotateY(180deg);
  z-index: 1;
}

/* 4. Correction spécifique pour le logo Mastercard qui "flotte" */
.mastercard-fixed-layout {
  position: relative; 
  width: 45px; 
  height: 28px;
  display: flex; 
  align-items: center; 
  margin-left: 10px;
  opacity: 0.99;

  /* --- CORRECTION ULTIME DESYNCHRO IPHONE --- */
  
  /* 1. On le rend invisible mais présent (ne retire pas du DOM) */
  visibility: visible; 
  
  /* 2. Cache l'envers, critique pour Safari */
  -webkit-backface-visibility: hidden !important;
  backface-visibility: hidden !important;
  
  /* 3. Force une couche de rendu distincte pour chaque face */
  -webkit-transform: translateZ(1px);
  transform: translateZ(1px); 

  /* 4. Désactive les interactions pour éviter les bugs de clic */
  pointer-events: none; 
}
      `}</style>
    </div>
  );
}