import { useState } from "react";
import { Wifi } from 'lucide-react'; // Assure-toi d'avoir lucide-react installé

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    // Si c'est un numéro complet (16 chiffres), on formate, sinon on montre la fin
    return num.length === 16 
      ? num.match(/.{1,4}/g).join(" ") 
      : "•••• •••• •••• " + num.slice(-4);
  };

  // On vérifie si c'est une carte personnalisée (si elle a un BG)
  const isCustom = !!card.bg;
  const status = card.status || "inactive";

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* FRONT */}
        <div className="card-front" style={isCustom ? { background: card.bg, padding: 0, overflow: 'hidden' } : {}}>
          
          {/* Si c'est une carte personnalisée, on utilise ton design CardOrderConfirmation */}
          {isCustom ? (
            <div className="custom-card-design" style={{ width: '100%', height: '100%', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="card-gloss"></div>
              
              <div className="card-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <div className="bper-logo" style={{ color: card.logoColor, fontWeight: 900, fontSize: '20px' }}>
                  BPER<span style={{color: '#a3e635'}}>:</span> <small style={{fontSize: '11px', fontWeight: 400, opacity: 0.8}}>Banca</small>
                </div>
                <Wifi size={20} style={{ opacity: 0.8, transform: 'rotate(90deg)', color: 'white' }} strokeWidth={1.5} />
              </div>

              <div className="emv-chip" style={{ width: '42px', height: '32px', background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', borderRadius: '6px', position: 'relative', zIndex: 2, border: '1px solid rgba(0,0,0,0.15)' }}>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', width: '100%', height: '1px', top: '33%' }}></div>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', width: '100%', height: '1px', top: '66%' }}></div>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', height: '100%', width: '1px', left: '50%' }}></div>
              </div>

              <div className="card-mid-row" style={{ zIndex: 2 }}>
                <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '18px', letterSpacing: '2px', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                  {formatNumber(card.number)}
                </div>
              </div>

              <div className="card-bottom-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Titulaire</span>
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: 'bold', textTransform: 'uppercase' }}>{card.holder || "NOM DU TITULAIRE"}</span>
                </div>
                <div className="mc-symbol" style={{ display: 'flex', position: 'relative', width: '36px', height: '22px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', position: 'absolute', background: '#eb001b', left: 0 }}></div>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', position: 'absolute', background: '#ff5f00', right: 0, opacity: 0.9 }}></div>
                </div>
              </div>
            </div>
          ) : (
            /* DESIGN PAR DÉFAUT (Si pas de bg personnalisé) */
            <>
              <div className="card-header">
                <div className="card-bank">BPER</div>
                <img src="/bancomat.svg" height="28" alt="bancomat" />
              </div>
              <div className={`card-status ${status}`}>{status}</div>
              <div className="chip-area"><div className="chip"></div></div>
              <div className="card-number">{formatNumber(card.number)}</div>
              <div className="card-footer">
                <div><span>TITULAIRE</span><strong>{card.holder}</strong></div>
                <div><span>EXP</span><strong>{card.expiry}</strong></div>
                <img src="/mastercard.svg" className="mastercard" alt="mc" />
              </div>
            </>
          )}
        </div>

        {/* BACK (Applique aussi le BG personnalisé) */}
        <div className="card-back" style={isCustom ? { background: card.bg } : {}}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv}</strong>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
          z-index: 1;
        }
      `}</style>
    </div>
  );
}