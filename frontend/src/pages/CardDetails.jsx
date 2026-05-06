import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowLeft, Lock, Star, ShieldAlert } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};

  // Remonter en haut de page à l'ouverture
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!card) return <div className="p-10">Chargement...</div>;

  // Configuration dynamique des visuels et détails selon la carte
  const getCardSpecifics = () => {
    switch (card.id) {
      case 'debit':
        return {
          sceneImage: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1200",
          sceneAlt: "Femme élégante au bureau avec carte Débit",
          description: "La liberté au quotidien avec un contrôle total sur vos dépenses en temps réel.",
          longAdvantage: "Paiements internationaux sans frais cachés et gestion 100% mobile.",
          securityDetail: "Verrouillage instantané depuis l'application en cas de perte."
        };
      case 'classic':
        return {
          sceneImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1200",
          sceneAlt: "Conseiller présentant la carte Classic à une cliente",
          description: "Le parfait équilibre entre souplesse de paiement et protections d'assurance standard.",
          longAdvantage: "Débit différé jusqu'à 30 jours pour une meilleure gestion de votre trésorerie.",
          securityDetail: "Protection renforcée pour tous vos achats sur internet (3D Secure)."
        };
      case 'gold':
        return {
          sceneImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1200",
          sceneAlt: "Femme d'affaires présentant la carte Gold",
          description: "L'excellence bancaire : plafonds élevés et services de conciergerie exclusifs.",
          longAdvantage: "Assurances voyage premium et accès aux salons VIP dans les aéroports.",
          securityDetail: "Garantie protection achat et extension de garantie constructeur incluse."
        };
      default:
        return {};
    }
  };

  const extra = getCardSpecifics();

  return (
    <div className="details-wrapper">
      {/* Bouton Retour Flottant (Pas d'entête comme demandé) */}
      <button className="back-floating-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
      </button>

      {/* SECTION 1 : PRÉSENTATION CARTE RÉALISTE */}
      <section className="section-card-focus">
        <div className="card-container-3d">
          <div className="card-visual" style={{ background: card.bg }}>
            <div className="card-gloss-effect"></div>
            <div className="card-top">
              <span className="bper-brand">BPER<span>:</span> <small>Banca</small></span>
              <div className="contactless-wave"></div>
            </div>
            <div className="card-chip"></div>
            <div className="card-number">**** **** **** 4290</div>
            <div className="card-holder">PREMIUM HOLDER</div>
            <div className="card-type-label">{card.type}</div>
          </div>
        </div>
        
        <div className="card-briefing">
          <h1>{card.name}</h1>
          <p className="hero-price">{card.price} <span>/ mois</span></p>
          <button className="cta-order">Commander maintenant</button>
        </div>
      </section>

      {/* SECTION 2 : SCÈNE RÉALISTE (LIFESTYLE) */}
      <section className="section-lifestyle">
        <div className="lifestyle-image-box">
          <img src={extra.sceneImage} alt={extra.sceneAlt} />
          <div className="floating-card-mini" style={{ background: card.bg }}></div>
        </div>
        
        <div className="lifestyle-content">
          <h2 className="title-bper">L'expérience BPER à vos côtés</h2>
          <p className="scene-desc">{extra.description}</p>
          
          <div className="features-grid-details">
            <div className="feat-item">
              <Globe className="feat-icon" />
              <div>
                <h4>Avantages</h4>
                <p>{extra.longAdvantage}</p>
              </div>
            </div>
            <div className="feat-item">
              <Lock className="feat-icon" />
              <div>
                <h4>Sécurité</h4>
                <p>{extra.securityDetail}</p>
              </div>
            </div>
            <div className="feat-item">
              <ShieldCheck className="feat-icon" />
              <div>
                <h4>Assurances</h4>
                <p>Protection contre le vol et la fraude incluse 24h/24.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .details-wrapper { background: #ffffff; min-height: 100vh; overflow-x: hidden; }

        .back-floating-btn {
          position: fixed; top: 20px; left: 20px; z-index: 100;
          background: rgba(255, 255, 255, 0.9); border: none; padding: 12px;
          border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.1); cursor: pointer;
        }

        /* Section 1 : Focus Carte */
        .section-card-focus {
          height: 100vh; display: flex; flex-direction: column;
          justify-content: center; align-items: center; padding: 20px;
          background: radial-gradient(circle at center, #f8fafc 0%, #e2e8f0 100%);
        }

        .card-container-3d { 
          perspective: 1000px; margin-bottom: 40px; 
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotateX(5deg); }
          50% { transform: translateY(-15px) rotateX(-5deg); }
        }

        .card-visual {
          width: 340px; aspect-ratio: 1.58/1; border-radius: 18px;
          position: relative; padding: 25px; color: white;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3); overflow: hidden;
        }

        .card-gloss-effect {
          position: absolute; top: -100%; left: -100%; width: 300%; height: 300%;
          background: linear-gradient(135deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 60%);
          animation: shine 6s infinite;
        }

        @keyframes shine { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }

        .bper-brand { font-size: 24px; font-weight: 900; }
        .bper-brand span { color: #a3e635; }
        .card-chip { width: 50px; height: 38px; background: linear-gradient(135deg, #facc15, #ca8a04); border-radius: 8px; margin-top: 20px; }
        .card-number { margin-top: 30px; font-size: 18px; letter-spacing: 3px; font-family: 'Courier New', monospace; }
        .card-type-label { position: absolute; bottom: 25px; right: 25px; font-weight: 800; letter-spacing: 2px; }

        .card-briefing h1 { font-size: 28px; color: #005a64; font-weight: 800; margin-bottom: 10px; text-align: center; }
        .hero-price { font-size: 32px; color: #1e293b; font-weight: 800; text-align: center; }
        .cta-order {
          margin-top: 20px; padding: 16px 40px; background: #005a64;
          color: white; border: none; border-radius: 50px; font-weight: 700;
          font-size: 16px; cursor: pointer; transition: 0.3s;
        }

        /* Section 2 : Lifestyle & Détails */
        .section-lifestyle { padding: 80px 5%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }

        .lifestyle-image-box { position: relative; border-radius: 30px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        .lifestyle-image-box img { width: 100%; height: 600px; object-fit: cover; }
        
        .floating-card-mini {
          position: absolute; bottom: 30px; right: 30px; width: 120px; aspect-ratio: 1.58/1;
          border-radius: 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2);
        }

        .title-bper { color: #005a64; font-size: 36px; font-weight: 800; margin-bottom: 20px; }
        .scene-desc { font-size: 18px; color: #64748b; line-height: 1.6; margin-bottom: 40px; }

        .features-grid-details { display: grid; gap: 30px; }
        .feat-item { display: flex; gap: 20px; align-items: flex-start; }
        .feat-icon { color: #005a64; flex-shrink: 0; margin-top: 5px; }
        .feat-item h4 { color: #1e293b; font-weight: 700; margin: 0 0 5px 0; }
        .feat-item p { color: #64748b; font-size: 14px; margin: 0; line-height: 1.5; }

        /* Responsive Mobile */
        @media (max-width: 1000px) {
          .section-lifestyle { grid-template-columns: 1fr; padding-top: 40px; }
          .lifestyle-image-box img { height: 400px; }
          .card-visual { width: 280px; }
          .title-bper { font-size: 28px; }
          .section-card-focus { height: auto; padding: 100px 20px; }
        }
      `}</style>
    </div>
  );
}