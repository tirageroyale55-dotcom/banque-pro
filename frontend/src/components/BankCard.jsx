import { useState } from "react";
import { Wifi } from 'lucide-react'; // Assure-toi d'avoir lucide-react installé

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    return num.replace(/\d{4}(?=.)/g, '$& '); // Formatage propre avec espaces
  };

  // Styles dynamiques basés sur la sélection de l'utilisateur
  const cardStyle = {
    background: card.bg || 'linear-gradient(135deg, #005a64 0%, #003a42 100%)',
    transition: 'all 0.4s ease'
  };

  const logoStyle = {
    color: card.logoColor || '#ffffff'
  };

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${card.status || 'active'}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        
        {/* FRONT : REPRODUCTION DU STYLE CARD_ORDER_CONFIRMATION */}
        <div className="card-front" style={cardStyle}>
          <div className="card-gloss"></div>
          
          <div className="card-top-row">
            <div className="bper-logo-styled" style={logoStyle}>
              BPER<span>:</span> <small>Banca</small>
            </div>
            <Wifi size={20} className="nfc-icon-styled" strokeWidth={1.5} />
          </div>

          <div className="emv-chip-styled">
            <div className="chip-line-s horizontal-1"></div>
            <div className="chip-line-s horizontal-2"></div>
            <div className="chip-line-s vertical"></div>
          </div>

          <div className="card-mid-row">
            <div className="card-number-display">
              {formatNumber(card.number)}
            </div>
          </div>

          <div className="card-bottom-row-styled">
            <div className="card-holder-info">
              <span className="label-xs">TITULAIRE</span>
              <div className="value-sm">{card.holder || "NOM DU TITULAIRE"}</div>
            </div>
            
            <div className="card-brand-area">
              <div className="mc-symbol-styled">
                <div className="circle red"></div>
                <div className="circle yellow"></div>
              </div>
            </div>
          </div>
        </div>

        {/* BACK : GARDE LE CVV ET LA BANDE MAGNÉTIQUE */}
        <div className="card-back" style={cardStyle}>
          <div className="magnetic-strip"></div>
          <div className="signature-area">
            <div className="cvv-display">
              <span>CVV</span>
              <strong>{card.cvv || "•••"}</strong>
            </div>
          </div>
          <div className="back-footer">
            <p>Usage strictement personnel. Cette carte est la propriété de BPER Banca.</p>
          </div>
        </div>

      </div>

      <style jsx>{`
        /* STRUCTURE 3D */
        .card-3d { width: 320px; height: 200px; perspective: 1000px; cursor: pointer; margin: 0 auto; }
        .card-inner { position: relative; width: 100%; height: 100%; text-align: left; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
        .card-3d.flipped .card-inner { transform: rotateY(180deg); }

        .card-front, .card-back {
          position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
          border-radius: 16px; padding: 22px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; justify-content: space-between;
        }

        .card-back { transform: rotateY(180deg); }
        .card-gloss { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0) 52%); pointer-events: none; }

        /* LOGO & NFC */
        .card-top-row { display: flex; justify-content: space-between; align-items: center; }
        .bper-logo-styled { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; }
        .bper-logo-styled span { color: #a3e635; }
        .bper-logo-styled small { font-size: 10px; font-weight: 400; opacity: 0.8; }
        .nfc-icon-styled { color: white; opacity: 0.8; transform: rotate(90deg); }

        /* PUCE EMV PROFESSIONNELLE */
        .emv-chip-styled {
          width: 40px; height: 30px; border-radius: 6px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          position: relative; border: 0.5px solid rgba(0,0,0,0.1);
        }
        .chip-line-s { position: absolute; background: rgba(0,0,0,0.15); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }

        /* NUMÉRO */
        .card-number-display {
          font-family: 'Roboto Mono', monospace; font-size: 19px;
          color: white; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* BAS DE CARTE */
        .card-bottom-row-styled { display: flex; justify-content: space-between; align-items: flex-end; }
        .label-xs { font-size: 9px; color: rgba(255,255,255,0.6); display: block; margin-bottom: 2px; }
        .value-sm { color: white; font-size: 13px; font-weight: 600; text-transform: uppercase; }

        /* MASTERCARD SYMBOL */
        .mc-symbol-styled { display: flex; position: relative; width: 40px; height: 25px; }
        .circle { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        /* DOS DE LA CARTE */
        .magnetic-strip { background: #1a1a1a; width: 120%; height: 40px; margin: 0 -22px; }
        .signature-area { background: #ffffff; height: 35px; width: 80%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding: 0 10px; }
        .cvv-display { color: #1a1a1a; font-family: 'Roboto Mono', monospace; font-style: italic; }
        .cvv-display span { font-size: 8px; margin-right: 5px; color: #666; font-style: normal; }
        .back-footer { font-size: 7px; color: rgba(255,255,255,0.4); line-height: 1.2; }
      `}</style>
    </div>
  );
}