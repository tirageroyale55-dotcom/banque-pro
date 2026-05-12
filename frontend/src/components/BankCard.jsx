import { useState } from "react";

export default function BankCard({ card }) {
  const [flipped, setFlipped] = useState(false);
  if (!card) return null;

  const formatNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    return "•••• •••• •••• " + num.slice(-4);
  };

  const status = card.status || "inactive";
  const statusText = {
    inactive: "Carte inactive",
    active: "Carte active",
    blocked: "Carte bloquée"
  };

  // --- LOGIQUE DE STYLE DYNAMIQUE ---
  // Si card.bg existe (carte demandée), on l'utilise, sinon on laisse le CSS gérer
  const dynamicStyle = card.bg ? { 
    background: card.bg,
    transition: 'all 0.3s ease'
  } : {};

  const dynamicLogoStyle = card.logoColor ? { color: card.logoColor } : {};

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* FRONT */}
        <div className="card-front" style={dynamicStyle}> {/* On applique le BG ici */}
          <div className="card-header">
            {/* On applique la couleur du logo ici */}
            <div className="card-bank" style={dynamicLogoStyle}>BPER</div>
            <img src="/bancomat.svg" height="28" alt="bancomat" />
          </div>

          <div className={`card-status ${status}`}>
            {card.status === "En cours d'investigation" ? "DEMANDE EN COURS" : statusText[status]}
          </div>

          <div className="chip-area">
            <div className="chip"></div>
          </div>

          <div className="card-number">
            {formatNumber(card.number)}
          </div>

          <div className="card-footer">
            <div>
              <span>TITULAIRE</span>
              <strong>{card.holder || "NOM CLIENT"}</strong>
            </div>
            <div>
              <span>EXP</span>
              <strong>{card.expiry || `${card.exp_month}/${card.exp_year}`}</strong>
            </div>
            <img src="/mastercard.svg" className="mastercard" alt="mc" />
          </div>
        </div>

        {/* BACK */}
        <div className="card-back" style={dynamicStyle}>
          <div className="magnetic"></div>
          <div className="cvv-box">
            <span>CVV</span>
            <strong>{card.cvv}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}