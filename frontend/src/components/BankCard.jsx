import { useState } from "react";
import { Wifi } from "lucide-react"; // Import nécessaire pour le nouveau style

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  if (!card) return null;

  // Détection du type de carte : Si elle a un "bg", c'est le nouveau style BPER
  const isNewBperStyle = !!card.bg;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    // Pour le nouveau style on affiche souvent les 4 derniers, pour l'ancien aussi
    return "•••• •••• •••• " + num.slice(-4);
  };

  const status = card.status || "inactive";
  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée",
    "En cours d'investigation": "INVESTIGATION"
  };

  // --- RENDU NOUVEAU STYLE (EXACTEMENT COMME CONFIRMATION) ---
  if (isNewBperStyle) {
    return (
      <div className={`card-body new-bper-style ${status}`} style={{ background: card.bg }}>
        <div className="card-gloss"></div>
        
        <div className="card-top-row">
          <div className="bper-logo" style={{ color: card.logoColor }}>
            BPER<span>:</span> <small>Banca</small>
          </div>
          <Wifi size={20} className="nfc-icon" strokeWidth={1.5} color="white" />
        </div>

        <div className="emv-chip">
          <div className="chip-line horizontal-1"></div>
          <div className="chip-line horizontal-2"></div>
          <div className="chip-line vertical"></div>
        </div>

        <div className="card-number-new">
           {card.number ? card.number.replace(/\d{4}(?=.)/g, '$& ') : formatNumber(card.number)}
        </div>

        <div className="card-bottom-row">
          <div className="card-label">{card.name || card.cardType}</div>
          <div className="mc-symbol">
            <div className="circle red"></div>
            <div className="circle yellow"></div>
          </div>
        </div>

        {/* CSS LOCAL POUR NE PAS POLLUER LE RESTE */}
        <style jsx>{`
          .new-bper-style {
            width: 100%; max-width: 320px; aspect-ratio: 1.58 / 1; border-radius: 14px;
            position: relative; padding: 20px; overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            display: flex; flex-direction: column; justify-content: space-between;
            color: white; font-family: 'Inter', sans-serif;
          }
          .card-gloss {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
          }
          .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
          .bper-logo { font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }
          .bper-logo span { color: #a3e635; }
          .bper-logo small { font-size: 10px; font-weight: 400; opacity: 0.8; }
          .nfc-icon { opacity: 0.8; transform: rotate(90deg); }
          .emv-chip {
            width: 40px; height: 30px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
            border-radius: 6px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.1);
          }
          .chip-line { position: absolute; background: rgba(0,0,0,0.2); }
          .horizontal-1 { width: 100%; height: 1px; top: 33%; }
          .horizontal-2 { width: 100%; height: 1px; top: 66%; }
          .vertical { height: 100%; width: 1px; left: 50%; }
          .card-number-new { font-family: 'Roboto Mono', monospace; font-size: 16px; letter-spacing: 2px; z-index: 2; margin-top: 10px; }
          .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
          .card-label { font-size: 10px; font-weight: 800; opacity: 0.9; letter-spacing: 1px; text-transform: uppercase; }
          .mc-symbol { display: flex; position: relative; width: 32px; height: 20px; }
          .circle { width: 20px; height: 20px; border-radius: 50%; position: absolute; }
          .red { background: #eb001b; left: 0; }
          .yellow { background: #ff5f00; right: 0; opacity: 0.9; }
        `}</style>
      </div>
    );
  }

  // --- RENDU ANCIEN STYLE (TON BANKCARD.JSX ORIGINAL) ---
  return (
    <div className={`card-3d ${flipped ? "flipped" : ""} ${status}`} onClick={() => setFlipped(!flipped)}>
      <div className="card-inner">
        <div className="card-front">
          <div className="card-header">
            <div className="card-bank">BPER</div>
            <img src="/bancomat.svg" height="28" alt="bancomat" />
          </div>
          <div className={`card-status ${status}`}>{statusText[status]}</div>
          <div className="chip-area"><div className="chip"></div></div>
          <div className="card-number">{formatNumber(card.number)}</div>
          <div className="card-footer">
            <div><span>TITULAIRE</span><strong>{card.holder || "CLIENT"}</strong></div>
            <div><span>EXP</span><strong>{card.exp_month}/{card.exp_year}</strong></div>
            <img src="/mastercard.svg" className="mastercard" alt="mastercard" />
          </div>
        </div>
        <div className="card-back">
          <div className="magnetic"></div>
          <div className="cvv-box"><span>CVV</span><strong>{card.cvv}</strong></div>
        </div>
      </div>
    </div>
  );
}