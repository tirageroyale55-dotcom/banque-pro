import { useState } from "react";
import { Wifi } from 'lucide-react';

export default function BankCard({ card, user }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  // Formattage du numéro : •••• •••• •••• 1234
  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    const s = String(num).replace(/\s/g, '');
    return "•••• •••• •••• " + s.slice(-4);
  };

  const status = card.status || "inactive";
  
  // On détecte si c'est la carte personnalisée (via bg)
  const isCustomCard = !!card.bg;

  // Récupération du nom complet du titulaire
  // Soit via l'objet user passé en prop, soit via card.holder stocké
  const holderName = user ? `${user.prenom} ${user.nom}` : (card.holder || "NOM TITULAIRE");

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-inner">
        {/* --- FACE AVANT (FRONT) --- */}
        <div className="card-front" style={isCustomCard ? { background: card.bg, padding: '0', overflow: 'hidden', border: 'none' } : {}}>
          
          {isCustomCard ? (
            /* DESIGN EXACT CARDORDERCONFIRMATION */
            <div className="custom-wrapper" style={{ height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div className="card-gloss"></div>
              
              {/* Top Row: Logo & NFC */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <div style={{ color: card.logoColor, fontWeight: '900', fontSize: '18px', letterSpacing: '-0.5px' }}>
                  BPER<span style={{ color: '#a3e635' }}>:</span> <small style={{ fontSize: '10px', fontWeight: '400', opacity: 0.8 }}>Banca</small>
                </div>
                <Wifi size={18} style={{ opacity: 0.8, transform: 'rotate(90deg)', color: 'white' }} />
              </div>

              {/* Puce EMV Stylisée */}
              <div className="emv-chip-custom">
                <div className="chip-line-h1"></div>
                <div className="chip-line-h2"></div>
                <div className="chip-line-v"></div>
              </div>

              {/* Numéro de carte */}
              <div style={{ zIndex: 2, color: 'white', fontFamily: 'monospace', fontSize: '15px', letterSpacing: '1.5px', marginTop: '5px' }}>
                {formatNumber(card.number)}
              </div>

              {/* Bottom Row: Titulaire & Mastercard Logo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                <div style={{ color: 'white' }}>
                  <div style={{ fontSize: '8px', opacity: 0.7, marginBottom: '2px' }}>TITULAIRE</div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{holderName}</div>
                </div>
                
                {/* Logo Mastercard (SVG ou CSS Cercles) */}
                <div className="mc-symbol-custom">
                  <div className="mc-circle-red"></div>
                  <div className="mc-circle-yellow"></div>
                </div>
              </div>
            </div>
          ) : (
            /* TON DESIGN PAR DÉFAUT (Inchangé) */
            <>
              <div className="card-header">
                <div className="card-bank">BPER</div>
                <img src="/bancomat.svg" height="28" alt="bancomat"/>
              </div>
              <div className={`card-status ${status}`}>{status === 'active' ? 'Carte active' : 'Carte inactive'}</div>
              <div className="chip-area"><div className="chip"></div></div>
              <div className="card-number">{formatNumber(card.number)}</div>
              <div className="card-footer">
                <div><span>TITULAIRE</span><strong>{holderName}</strong></div>
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
            <strong>{card.cvv || "•••"}</strong>
          </div>
          <div className="back-logo" style={{ position: 'absolute', bottom: '20px', right: '20px', color: card.logoColor, fontWeight: 'bold', fontSize: '12px', opacity: 0.5 }}>
             BPER: Banca
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Styles spécifiques pour le nouveau look */
        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
          pointer-events: none;
        }

        .emv-chip-custom {
          width: 38px; height: 28px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 4px; position: relative; z-index: 2; border: 0.5px solid rgba(0,0,0,0.2);
        }
        .chip-line-h1 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; top: 33%; }
        .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.2); height: 100%; width: 1px; left: 50%; }

        .mc-symbol-custom { display: flex; position: relative; width: 32px; height: 20px; z-index: 2; }
        .mc-circle-red { width: 20px; height: 20px; border-radius: 50%; background: #eb001b; position: absolute; left: 0; }
        .mc-circle-yellow { width: 20px; height: 20px; border-radius: 50%; background: #ff5f00; position: absolute; right: 0; opacity: 0.9; }
      `}</style>
    </div>
  );
}