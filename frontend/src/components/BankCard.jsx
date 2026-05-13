import { useState } from "react";
import { Wifi } from 'lucide-react';

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  // Formatage du numéro (ex: •••• 1234)
  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    const last4 = num.toString().slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const status = card.status || "inactive";
  
  // On détecte si c'est la carte personnalisée issue de CardOrderConfirmation
  const isCustomCard = !!card.bg;

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div 
          className="card-front" 
          style={isCustomCard ? { background: card.bg, padding: 0, overflow: 'hidden', border: 'none' } : {}}
        >
          
          {isCustomCard ? (
            /* DESIGN EXACT CARDORDERCONFIRMATION */
            <div className="custom-card-wrapper" style={{ height: '100%', padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'white' }}>
              <div className="card-gloss"></div>
              
              {/* Top Row: Logo & NFC */}
              <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', zIndex: 2, justifyContent: 'space-between' }}>
                <div style={{ color: card.logoColor, fontWeight: '900', fontSize: '18px', letterSpacing: '-0.5px' }}>
                  BPER<span style={{ color: '#a3e635' }}>:</span> <small style={{ fontSize: '10px', fontWeight: '400', opacity: 0.8 }}>Banca</small>
                </div>
                <Wifi size={18} style={{ opacity: 0.7, transform: 'rotate(90deg)' }} />
              </div>

              {/* Chip EMV */}
              <div className="emv-chip" style={{ width: '38px', height: '28px', background: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)', borderRadius: '5px', position: 'relative', zIndex: 2, border: '1px solid rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', width: '100%', height: '1px', top: '33%' }}></div>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', width: '100%', height: '1px', top: '66%' }}></div>
                <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.2)', height: '100%', width: '1px', left: '50%' }}></div>
              </div>

              {/* Card Number */}
              <div style={{ zIndex: 2, fontSize: '16px', letterSpacing: '1.5px', fontFamily: 'monospace', margin: '5px 0' }}>
                {formatNumber(card.number)}
              </div>

              {/* Bottom Row: Holder, Expiry & Mastercard Logo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '8px', opacity: 0.7, textTransform: 'uppercase' }}>Titulaire</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                    {card.holder || "NOM PRENOM"} 
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', opacity: 0.7, textTransform: 'uppercase' }}>Exp</span>
                  <span style={{ fontSize: '11px', fontWeight: '700' }}>{card.expiry || "MM/AA"}</span>
                </div>

                {/* Logo Mastercard Strict */}
                <div className="mc-symbol" style={{ display: 'flex', position: 'relative', width: '32px', height: '20px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', position: 'absolute', background: '#eb001b', left: 0 }}></div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', position: 'absolute', background: '#ff5f00', right: 0, opacity: 0.9 }}></div>
                </div>
              </div>
            </div>
          ) : (
            /* DESIGN ORIGINAL POUR LES AUTRES CARTES */
            <>
              <div className="card-header">
                <div className="card-bank">BPER</div>
                <img src="/bancomat.svg" height="28" alt="bancomat" />
              </div>
              <div className={`card-status ${status}`}>
                {status === 'active' ? 'Carte active' : 'Carte inactive'}
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
        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}