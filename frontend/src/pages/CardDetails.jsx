// ... tes imports ...
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // navigate est déjà importé
import { ArrowLeft, ShieldCheck, Globe, Zap, Wifi } from 'lucide-react';

export default function CardDetails() {
  // ... tes hooks ...
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  const topRef = useRef(null);

  useEffect(() => {
    // ... ton useEffect existant ...
    window.scrollTo(0, 0);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.scrollTop = 0;
  }, []);

  if (!card) return <div className="p-10">Chargement...</div>;

  // AJOUTE CETTE FONCTION POUR GÉRER LE CLIC
  const handleOrderClick = () => {
    console.log("Clic sur commander pour:", card.name);
    // Redirection vers la nouvelle page de confirmation
    // On passe les données de la carte pour qu'elles soient disponibles là-bas
    navigate('/order-confirmation', { state: { card } });
  };

  const getScene = () => {
    // ... ta fonction existante ...
    switch (card.id) {
      case 'debit': return { img: "/debit_scene.png", title: "Liberté Numérique" };
      case 'classic': return { img: "/classic_scene.png", title: "Accompagnement Pro" };
      case 'gold': return { img: "/gold_scene.png", title: "Privilège & Prestige" };
      default: return { img: "/images/debit_scene.jpg", title: "Service BPER" };
    }
  };

  const scene = getScene();

  return (
    <div className="details-container-fix" ref={topRef}>
      {/* ... ton code existant ... */}
      <button className="back-action-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} /> <span>Retour</span>
      </button>

      <section className="section-hero-product">
        <div className="card-perspective-wrapper">
          <div className="card-floating-animation">
            {/* ... ton style de carte strict ... */}
            <div className="card-physical-container">
              <div className="card-body" style={{ background: card.bg }}>
                {/* ... contenu de la carte ... */}
                <div className="card-gloss"></div>
                
                <div className="card-top-row">
                  <div className="bper-logo" style={{ color: card.logoColor }}>
                    BPER<span>:</span> <small>Banca</small>
                  </div>
                  <Wifi size={20} className="nfc-icon" strokeWidth={1.5} />
                </div>

                <div className="emv-chip">
                  <div className="chip-line horizontal-1"></div>
                  <div className="chip-line horizontal-2"></div>
                  <div className="chip-line vertical"></div>
                </div>

                <div className="card-bottom-row">
                  <div className="card-label">{card.type}</div>
                  <div className="mc-symbol">
                    <div className="circle red"></div>
                    <div className="circle yellow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-product-info">
          <h1>{card.name}</h1>
          <p className="hero-price-tag">{card.price} <span>/ mois</span></p>
          
          {/* AJOUTE LE onClick ICI SUR LE BOUTON EXISTANT */}
          <button className="order-main-btn" onClick={handleOrderClick}>
            Commander maintenant
          </button>
        </div>
      </section>

      {/* SECTION 2 ... le reste de ton code existant ... */}
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
        // ... tout ton CSS existant ...
        .details-container-fix { 
          background: #fff; 
          padding: 20px;
          display: block;
          font-family: 'Inter', sans-serif;
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
        }

        /* PERSPECTIVE ET FLOTTEMENT DE LA CARTE */
        .card-perspective-wrapper { 
          perspective: 1000px; 
          margin-top: 10px;
        }
        
        .card-floating-animation {
          animation: cardFloat 5s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes cardFloat {
          0% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
          50% { transform: rotateY(5deg) rotateX(-4deg) translateY(-8px); }
          100% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
        }

        /* ====================================================
           REPRODUCTION ABSOLUE ET STRICTE DE CARDCATALOG.JSX 
           ==================================================== */
        .card-physical-container {
          padding: 30px;
          background: #f8fafc;
          border-radius: 24px;
          display: flex;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.02);
        }

        .card-body {
          width: 280px; /* Base mobile */
          aspect-ratio: 1.58 / 1;
          border-radius: 14px;
          position: relative;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        @media (min-width: 768px) {
          .card-body { width: 310px; } /* Ajustement léger desktop sans déformer */
        }

        .card-gloss {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }

        .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; }
        .bper-logo span { color: #a3e635; }
        .bper-logo small { font-size: 11px; font-weight: 400; opacity: 0.8; }
        .nfc-icon { opacity: 0.8; transform: rotate(90deg); color: white; }

        .emv-chip {
          width: 42px;
          height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(0,0,0,0.15);
          overflow: hidden;
        }
        .chip-line { position: absolute; background: rgba(0,0,0,0.2); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }

        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-label { font-size: 11px; font-weight: 800; opacity: 0.9; color: white; letter-spacing: 1px; }

        .mc-symbol { display: flex; position: relative; width: 36px; height: 22px; }
        .circle { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        /* TEXTES ET CTA */
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