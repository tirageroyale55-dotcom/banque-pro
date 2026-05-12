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
    blocked: "Carte bloquée",
    "En cours d'investigation": "En cours..."
  };

  // --- CONFIGURATION DES COULEURS DYNAMIQUES ---
  // On utilise le 'bg' et 'logoColor' s'ils existent (venant de CardOrderConfirmation)
  // Sinon, on laisse vide pour que ton fichier CSS habituel prenne le relais.
  const customBg = card.bg ? { background: card.bg } : {};
  const customLogo = card.logoColor ? { color: card.logoColor } : {};

  return (
    <div
      className={`card-3d ${flipped ? "flipped" : ""} ${status}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="card-inner">
        {/* FRONT */}
        {/* On applique le style 'customBg' sur card-front */}
        <div className="card-front" style={customBg}>
          
          <div className="card-header">
            {/* On applique le style 'customLogo' sur le texte BPER */}
            <div className="card-bank" style={customLogo}>BPER</div>
            <img src="/bancomat.svg" height="28" alt="bancomat" />
          </div>

          <div className={`card-status ${status}`}>
            {statusText[status] || status}
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

            <img src="/mastercard.svg" className="mastercard" alt="mastercard" />
          </div>
        </div>

        {/* BACK */}
        {/* On applique aussi le dégradé au dos de la carte pour la cohérence */}
        <div className="card-back" style={customBg}>
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