import { useState } from "react";
import { Wifi } from 'lucide-react';

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  // Formatage du numéro (ex: •••• •••• •••• 4444)
  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    const last4 = num.toString().slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  // Détection du type de design
  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${card.status || 'inactive'}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { 
            background: card.bg, 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            overflow: 'hidden'
          } : {}}
        >
          {isCustomCard ? (
            /* DESIGN EXACT : CARDORDERCONFIRMATION */
            <>
              <div className="card-gloss-effect"></div>
              
              <div className="card-top-row-custom">
                <div className="bper-logo-custom" style={{ color: card.logoColor }}>
                  BPER<span>:</span> <small>Banca</small>
                </div>
                <Wifi size={20} className="nfc-icon-custom" strokeWidth={1.5} />
              </div>

              <div className="emv-chip-custom">
                <div className="chip-line-h1"></div>
                <div className="chip-line-h2"></div>
                <div className="chip-line-v"></div>
              </div>

              <div className="card-mid-row-custom">
                {formatNumber(card.number)}
              </div>

              <div className="card-bottom-row-custom">
                <div className="holder-info-custom">
                  <span className="label-custom">TITULAIRE</span>
                  <span className="value-custom">{card.holder || "NOM CLIENT"}</span>
                </div>
                <div className="exp-info-custom">
                  <span className="label-custom">EXP</span>
                  <span className="value-custom">{card.expiry || `${card.exp_month}/${card.exp_year}`}</span>
                </div>
                {/* LOGO MASTERCARD EXACT */}
                <div className="mc-symbol-custom">
  <div className="mc-circle mc-red"></div>
  <div className="mc-circle mc-orange"></div>
</div>
              </div>
            </>
          ) : (
            /* DESIGN PAR DÉFAUT (INCHANGÉ) */
            <>
              <div className="card-header">
                <div className="card-bank">BPER</div>
                <img src="/bancomat.svg" height="28" alt="bancomat" />
              </div>
              <div className="chip-area"><div className="chip"></div></div>
              <div className="card-number">{formatNumber(card.number)}</div>
              <div className="card-footer">
                <div><span>TITULAIRE</span><strong>{card.holder}</strong></div>
                <div><span>EXP</span><strong>{card.exp_month}/{card.exp_year}</strong></div>
                <img src="/mastercard.svg" className="mastercard" alt="mc" />
              </div>
            </>
          )}
        </div>

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv || "•••"}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
  /* LOGO MASTERCARD CSS - TAILLE ET FORME EXACTE */
  .mc-symbol-custom {
    position: relative;
    width: 32px;    /* Largeur exacte du logo SVG standard */
    height: 20px;   /* Hauteur exacte */
    display: flex;
    align-items: center;
    z-index: 2;
  }

  .mc-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    position: absolute;
  }

  .mc-red {
    background-color: #eb001b;
    left: 0;
    z-index: 1;
  }

  .mc-orange {
    background-color: #ff5f00;
    right: 0;
    z-index: 2;
    /* Pour créer l'effet d'intersection propre au logo Mastercard */
    opacity: 0.92; 
  }

  /* Ajustement pour que le logo soit bien calé en bas à droite */
  .card-bottom-row-custom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    padding-top: 5px;
  }

  /* Si tu veux que le logo soit un peu plus petit sur mobile comme l'original */
  @media (max-width: 480px) {
    .mc-symbol-custom {
      transform: scale(0.85);
      transform-origin: bottom right;
    }
  }
`}</style>
    </div>
  );
}