import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Globe, Zap, Wifi } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  const topRef = useRef(null); // Référence pour forcer la vue en haut

  useEffect(() => {
    // 1. Force le scroll tout en haut de la fenêtre
    window.scrollTo(0, 0);
    
    // 2. Force l'élément de la carte à être dans la vue (Fix spécial Mobile)
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    
    // 3. Petit fix pour les Layouts avec overflow interne
    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.scrollTop = 0;
  }, []);

  if (!card) return <div className="p-10">Chargement...</div>;

  const getScene = () => {
    switch (card.id) {
      case 'debit': return { img: "/images/debit_scene.jpg", title: "Liberté Numérique" };
      case 'classic': return { img: "/images/classic_scene.jpg", title: "Accompagnement Pro" };
      case 'gold': return { img: "/images/gold_scene.jpg", title: "Privilège & Prestige" };
      default: return { img: "/images/debit_scene.jpg", title: "Service BPER" };
    }
  };

  const scene = getScene();

  return (
    <div className="details-container-fix" ref={topRef}>
      {/* Retour bouton */}
      <button className="back-action-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} /> <span>Retour</span>
      </button>

      {/* SECTION 1 : LA CARTE (PRIORITÉ MOBILE) */}
      <section className="section-hero-product">
        <div className="card-perspective-wrapper">
          <div className="card-floating-animation">
            <div className="card-body-bper" style={{ background: card.bg }}>
              <div className="card-gloss-shine"></div>
              
              <div className="card-layout-top">
                <div className="bper-brand-logo" style={{ color: card.logoColor }}>
                  BPER<span>:</span> <small>Banca</small>
                </div>
                <Wifi size={24} className="nfc-icon-svg" strokeWidth={1.5} />
              </div>

              <div className="emv-chip-pro">
                <div className="chip-line-h"></div>
                <div className="chip-line-v"></div>
              </div>

              <div className="card-layout-bottom">
                <div className="card-type-label">{card.type}</div>
                <div className="mc-logo-wrap">
                  <div className="mc-c mc-1"></div>
                  <div className="mc-c mc-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-product-info">
          <h1>{card.name}</h1>
          <p className="hero-price-tag">{card.price} <span>/ mois</span></p>
          <button className="order-main-btn">Commander maintenant</button>
        </div>
      </section>

      {/* SECTION 2 : IMAGE & DÉTAILS */}
      <section className="section-lifestyle-pro">
        <div className="lifestyle-pro-grid">
          <div className="image-side-pro">
            <img src={scene.img} alt={scene.title} className="scene-img-realist" />
          </div>

          <div className="content-side-pro">
            <h2 className="bper-teal-headline">{scene.title}</h2>
            <p className="bper-subtext">
              Une expertise bancaire premium pour sécuriser vos transactions et accompagner vos projets partout dans le monde.
            </p>

            <div className="features-stack-pro">
              <div className="feat-row">
                <ShieldCheck className="feat-icon-bper" />
                <div>
                  <h4>Sécurité Maximale</h4>
                  <p>Authentification forte et cryptage EMV de pointe.</p>
                </div>
              </div>
              <div className="feat-row">
                <Globe className="feat-icon-bper" />
                <div>
                  <h4>Globalité</h4>
                  <p>Utilisation sans frontières dans le réseau Mastercard.</p>
                </div>
              </div>
              <div className="feat-row">
                <Zap className="feat-icon-bper" />
                <div>
                  <h4>Avantages BPER</h4>
                  <p>Services exclusifs et assistance dédiée 24/7.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .details-container-fix { 
          background: #fff; 
          padding: 20px;
          display: block; /* Évite les problèmes de flexbox sur mobile au scroll */
        }

        .back-action-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #005a64;
          font-weight: 700; cursor: pointer; margin-bottom: 20px;
        }

        /* SECTION CARTE */
        .section-hero-product {
          display: flex; flex-direction: column; align-items: center;
          padding: 20px 0 40px; 
          border-bottom: 1px solid #f1f5f9; 
          margin-bottom: 40px;
          min-height: auto; /* Laisse le contenu définir la hauteur sur mobile */
        }

        /* ANIMATION DE MOUVEMENT */
        .card-perspective-wrapper { 
          perspective: 1000px; 
          margin-top: 10px;
        }
        
        .card-floating-animation {
          animation: cardFloat 5s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes cardFloat {
          0% { transform: rotateY(-5deg) rotateX(5deg) translateY(0); }
          50% { transform: rotateY(5deg) rotateX(-5deg) translateY(-10px); }
          100% { transform: rotateY(-5deg) rotateX(5deg) translateY(0); }
        }

        .card-body-bper {
          width: 320px; /* Taille optimisée mobile */
          aspect-ratio: 1.58 / 1; border-radius: 16px;
          position: relative; padding: 20px; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          display: flex; flex-direction: column; justify-content: space-between;
        }

        /* Desktop Adjustments */
        @media (min-width: 768px) {
          .card-body-bper { width: 360px; padding: 25px; }
          .section-hero-product { padding: 40px 0 60px; }
        }

        .card-gloss-shine {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 70%);
        }

        .card-layout-top { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-brand-logo { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; }
        .bper-brand-logo span { color: #a3e635; }
        .bper-brand-logo small { font-size: 10px; opacity: 0.8; }
        .nfc-icon-svg { color: white; transform: rotate(90deg); opacity: 0.8; }

        .emv-chip-pro {
          width: 44px; height: 32px; background: linear-gradient(135deg, #fde047 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.1);
        }

        .card-layout-bottom { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-type-label { font-size: 11px; font-weight: 800; color: white; letter-spacing: 1.5px; }

        .mc-logo-wrap { display: flex; position: relative; width: 36px; height: 22px; }
        .mc-c { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .mc-1 { background: #eb001b; left: 0; }
        .mc-2 { background: #ff5f00; right: 0; opacity: 0.9; }

        .hero-product-info { text-align: center; margin-top: 30px; }
        .hero-product-info h1 { color: #1e293b; font-size: 24px; font-weight: 800; }
        .hero-price-tag { font-size: 24px; font-weight: 800; color: #005a64; margin-top: 8px; }
        .hero-price-tag span { font-size: 14px; color: #94a3b8; }

        .order-main-btn {
          margin-top: 20px; padding: 14px 40px; background: #005a64;
          color: white; border: none; border-radius: 12px; font-weight: 700;
          font-size: 15px; cursor: pointer; transition: 0.3s;
          width: 100%; max-width: 320px;
        }

        /* SECTION LIFESTYLE */
        .section-lifestyle-pro { padding: 20px 0 60px; }
        .lifestyle-pro-grid { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; }

        @media (min-width: 1024px) {
          .lifestyle-pro-grid { grid-template-columns: 1fr 1fr; gap: 60px; }
          .hero-product-info h1 { font-size: 32px; }
        }

        .scene-img-realist { 
          width: 100%; height: 350px; object-fit: cover; 
          border-radius: 20px; box-shadow: 0 15px 30px rgba(0,0,0,0.1); 
        }

        @media (min-width: 768px) {
          .scene-img-realist { height: 500px; }
        }

        .bper-teal-headline { color: #005a64; font-size: 28px; font-weight: 800; margin-bottom: 15px; }
        .bper-subtext { font-size: 16px; color: #64748b; line-height: 1.6; margin-bottom: 30px; }

        .features-stack-pro { display: grid; gap: 25px; }
        .feat-row { display: flex; gap: 15px; }
        .feat-icon-bper { color: #005a64; flex-shrink: 0; }
        .feat-row h4 { font-weight: 700; color: #1e293b; margin-bottom: 3px; font-size: 15px; }
        .feat-row p { color: #64748b; font-size: 13.5px; margin: 0; }
      `}</style>
    </div>
  );
}