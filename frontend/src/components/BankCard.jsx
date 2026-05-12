import { useState } from "react";
import { Wifi } from 'lucide-react'; // Assure-toi d'avoir installé lucide-react

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    return "•••• •••• •••• " + num.slice(-4);
  };

  const status = card.status || "inactive";
  
  // On détecte si c'est une carte personnalisée (via la présence de bg ou logoColor)
  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div className="card-front" style={isCustomCard ? { background: card.bg, padding: 0, overflow: 'hidden' } : {}}>
          
          {isCustomCard ? (
            /* --- DESIGN EXACT DE CARDORDERCONFIRMATION --- */
            <div className="custom-card-content" style={{ height: '100%', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="card-gloss"></div>
              
              <div className="card-top-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <div className="bper-logo" style={{ color: card.logoColor, fontWeight: '900', fontSize: '20px' }}>
                  BPER<span style={{ color: '#a3e635' }}>:</span> <small style={{ fontSize: '11px', fontWeight: '400', opacity: 0.8 }}>Banca</small>
                </div>
                <Wifi size={20} style={{ opacity: 0.8, transform: 'rotate(90deg)', color: 'white' }} strokeWidth={1.5} />
              </div>

              <div className="emv-chip" style={{ width: '42px', height: '32px', background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', borderRadius: '6px', position: 'relative', zIndex: 2, border: '1px solid rgba(0,0,0,0.15)' }}>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', width: '100%', height: '1px', top: '33%' }}></div>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', width: '100%', height: '1px', top: '66%' }}></div>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', height: '100%', width: '1px', left: '50%' }}></div>
              </div>

              <div className="card-mid-row" style={{ zIndex: 2, color: 'white', fontFamily: 'monospace', fontSize: '16px', letterSpacing: '2px', marginTop: '10px' }}>
                {formatNumber(card.number)}
              </div>

              <div className="card-bottom-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                <div className="card-label" style={{ fontSize: '10px', fontWeight: '800', color: 'white', opacity: 0.9, textTransform: 'uppercase' }}>
                  {card.name || "BPER CARD"}
                </div>
                <div className="mc-symbol" style={{ display: 'flex', position: 'relative', width: '36px', height: '22px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', position: 'absolute', background: '#eb001b', left: 0 }}></div>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', position: 'absolute', background: '#ff5f00', right: 0, opacity: 0.9 }}></div>
                </div>
              </div>
            </div>
          ) : (
            /* --- TON DESIGN ORIGINAL (POUR LES AUTRES CARTES) --- */
            <>
              <div className="card-header">
                <div className="card-bank">BPER</div>
                <img src="/bancomat.svg" height="28" alt="bancomat"/>
              </div>
              <div className={`card-status ${status}`}>{status === 'active' ? 'Carte active' : 'Carte inactive'}</div>
              <div className="chip-area"><div className="chip"></div></div>
              <div className="card-number">{formatNumber(card.number)}</div>
              <div className="card-footer">
                <div><span>TITULAIRE</span><strong>{card.holder}</strong></div>
                <div><span>EXP</span><strong>{card.exp_month}/{card.exp_year}</strong></div>
                <img src="/mastercard.svg" className="mastercard" alt="mc"/>
              </div>
            </>
          )}
        </div>

        {/* --- FACE ARRIÈRE (BACK) --- */}
        <div className="card-back" style={isCustomCard ? { background: card.bg } : {}}>
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
          pointer-events: none;
        }
        /* Conserve tes styles card-3d, flipped, etc. existants dans ton dashboard.css */
      `}</style>
    </div>
  );
}