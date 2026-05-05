import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowLeft, Lock } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};

  if (!card) return <div className="p-10">Chargement...</div>;

  return (
    <div className="details-page">
      {/* Header de navigation */}
      <div className="details-header" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} /> <span>Retour au catalogue</span>
      </div>

      <div className="details-container">
        {/* SECTION 1 : VISUEL DE LA CARTE SÉLECTIONNÉE */}
        <div className="hero-section">
          <div className="card-display-box">
             {/* Ta structure de carte ultra-réaliste ici injectée dynamiquement */}
             <div className="card-body-large" style={{ background: card.bg }}>
                <div className="card-gloss"></div>
                <div className="bper-logo-lg">BPER: <span>Banca</span></div>
                <div className="emv-chip-lg"></div>
                <div className="card-type-lg">{card.type}</div>
             </div>
          </div>
          <div className="hero-text">
            <h1>{card.name}</h1>
            <p className="price-main">{card.price}<span> / mois</span></p>
          </div>
        </div>

        {/* SECTION 2 : L'IMAGE RÉALISTE ET DÉTAILS PRO */}
        <div className="experience-section">
          <div className="image-container">
            {/* Simulation de l'image de la femme élégante */}
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
              alt="Conseillère BPER" 
              className="lifestyle-img"
            />
            <div className="image-overlay-card" style={{ background: card.bg }}>
               {/* Mini carte dans sa main via superposition */}
            </div>
          </div>

          <div className="content-grid">
            <div className="info-block">
              <h3><Zap size={20} /> Fonctionnalités</h3>
              <ul>
                {card.features.map((f, i) => (
                  <li key={i}><CheckCircle2 size={16} className="text-green" /> {f}</li>
                ))}
                <li>Paiements sans contact illimités</li>
              </ul>
            </div>

            <div className="info-block">
              <h3><ShieldCheck size={20} /> Sécurité Maximale</h3>
              <p>Technologie EMV de dernière génération avec cryptage des données et authentification 3D Secure 2.0 pour tous vos achats en ligne.</p>
              <div className="security-badge"><Lock size={14}/> Protection Fraude 24/7</div>
            </div>

            <div className="info-block full-width">
              <h3><Globe size={20} /> Avantages Exclusifs</h3>
              <div className="perks-grid">
                <div className="perk">Assistance Voyage</div>
                <div className="perk">Garantie Achat 90 jours</div>
                <div className="perk">Programme Cashback BPER</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .details-page { background: #fdfdfd; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .details-header { padding: 20px; display: flex; align-items: center; gap: 10px; cursor: pointer; color: #005a64; font-weight: 600; }
        
        .details-container { max-width: 1100px; margin: 0 auto; padding: 20px; }
        
        .hero-section { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 50px; }
        .card-display-box { transform: scale(1.2); margin-bottom: 40px; margin-top: 30px; }
        .hero-text h1 { font-size: 32px; color: #1e293b; font-weight: 800; margin-bottom: 10px; }
        .price-main { font-size: 28px; color: #005a64; font-weight: 800; }

        .experience-section { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 40px; 
          background: white; 
          border-radius: 30px; 
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }

        .image-container { position: relative; height: 100%; }
        .lifestyle-img { width: 100%; height: 100%; object-fit: cover; }
        
        .content-grid { padding: 40px; display: grid; grid-template-columns: 1fr; gap: 30px; }
        .info-block h3 { display: flex; align-items: center; gap: 10px; color: #005a64; margin-bottom: 15px; font-weight: 700; }
        .info-block ul { list-style: none; padding: 0; }
        .info-block li { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #475569; }
        .text-green { color: #10b981; }

        .security-badge { 
          display: inline-flex; align-items: center; gap: 5px; 
          background: #ecfdf5; color: #065f46; padding: 6px 12px; 
          border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 10px;
        }

        .perks-grid { display: flex; gap: 10px; flex-wrap: wrap; }
        .perk { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 15px; border-radius: 10px; font-size: 12px; font-weight: 600; color: #1e293b; }

        /* Mobile */
        @media (max-width: 900px) {
          .experience-section { grid-template-columns: 1fr; }
          .card-display-box { transform: scale(1); }
          .image-container { height: 350px; }
        }

        /* Styles de la carte réutilisés */
        .card-body-large { width: 300px; aspect-ratio: 1.58/1; border-radius: 15px; position: relative; padding: 25px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .bper-logo-lg { font-weight: 900; font-size: 22px; color: white; }
        .emv-chip-lg { width: 45px; height: 35px; background: #facc15; border-radius: 8px; margin-top: 20px; }
        .card-type-lg { position: absolute; bottom: 25px; left: 25px; color: white; font-weight: 800; letter-spacing: 2px; }
      `}</style>
    </div>
  );
}