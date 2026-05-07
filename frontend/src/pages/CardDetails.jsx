import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Globe, Zap, Wifi, CheckCircle2 } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  const topRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
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
    <div className="catalog-container" ref={topRef} style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Bouton Retour */}
      <button className="back-action-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} /> <span>Retour au catalogue</span>
      </button>

      {/* SECTION 1 : LA CARTE EXACTE DU CATALOGUE (AVEC MOUVEMENT) */}
      <section className="hero-product-view">
        <div className="card-perspective-container">
          <div className="card-animation-loop">
            {/* STRUCTURE CSS STRICTEMENT IDENTIQUE AU CATALOGUE */}
            <div className="card-body" style={{ background: card.bg, width: '320px', height: '202px' }}>
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

        <div className="product-hero-details">
          <h1>{card.name}</h1>
          <p className="price-tag-large">{card.price}<small>/mois</small></p>
          <button className="order-btn-large">Commander maintenant</button>
        </div>
      </section>

      {/* SECTION 2 : LIFESTYLE & AVANTAGES */}
      <section className="lifestyle-section-pro">
        <div className="lifestyle-grid-pro">
          <div className="img-container-pro">
            <img src={scene.img} alt={scene.title} className="lifestyle-img-pro" />
          </div>

          <div className="content-container-pro">
            <h2 className="bper-title-pro">{scene.title}</h2>
            <p className="bper-text-pro">
              BPER Banca vous offre une expérience de paiement sécurisée et fluide, 
              conçue pour s'adapter à votre style de vie, où que vous soyez.
            </p>

            <ul className="features-list-pro">
              {card.features.map((feature, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={18} className="icon-green-pro" />
                  <span>{feature}</span>
                </li>
              ))}
              <li><ShieldCheck size={18} className="icon-green-pro" /> <span>Protection fraude 24/7</span></li>
            </ul>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* RÉCUPÉRATION EXACTE DES STYLES DU CATALOGUE */
        .card-body {
          aspect-ratio: 1.58 / 1;
          border-radius: 14px;
          position: relative;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transform-style: preserve-3d;
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
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; z-index: 2;
          border: 1px solid rgba(0,0,0,0.15); overflow: hidden;
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

        /* ANIMATION DE MOUVEMENT */
        .card-perspective-container { perspective: 1000px; padding: 20px 0; }
        .card-animation-loop {
          animation: cardFloatDetail 6s ease-in-out infinite;
        }
        @keyframes cardFloatDetail {
          0% { transform: rotateY(-8deg) rotateX(5deg) translateY(0); }
          50% { transform: rotateY(8deg) rotateX(-5deg) translateY(-15px); }
          100% { transform: rotateY(-8deg) rotateX(5deg) translateY(0); }
        }

        /* MISE EN PAGE DETAILS */
        .back-action-btn {
          display: flex; align-items: center; gap: 10px; padding: 20px;
          background: none; border: none; color: #005a64; font-weight: 700; cursor: pointer;
        }

        .hero-product-view {
          display: flex; flex-direction: column; align-items: center;
          padding: 20px 20px 60px; text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .product-hero-details h1 { color: #1e293b; font-size: 26px; margin: 30px 0 10px; font-weight: 800; }
        .price-tag-large { font-size: 32px; font-weight: 800; color: #005a64; }
        .price-tag-large small { font-size: 14px; color: #94a3b8; margin-left: 4px; }

        .order-btn-large {
          margin-top: 30px; padding: 16px 50px; background: #005a64; color: white;
          border: none; border-radius: 14px; font-weight: 700; font-size: 16px;
          cursor: pointer; width: 100%; max-width: 320px;
        }

        /* SECTION LIFESTYLE */
        .lifestyle-section-pro { padding: 60px 20px; }
        .lifestyle-grid-pro { display: grid; grid-template-columns: 1fr; gap: 40px; max-width: 1100px; margin: 0 auto; }
        
        .lifestyle-img-pro { 
          width: 100%; height: 400px; object-fit: cover; border-radius: 24px; 
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }

        .bper-title-pro { color: #005a64; font-size: 32px; font-weight: 800; margin-bottom: 20px; }
        .bper-text-pro { color: #64748b; font-size: 17px; line-height: 1.6; margin-bottom: 30px; }

        .features-list-pro { list-style: none; padding: 0; }
        .features-list-pro li { 
          display: flex; align-items: center; gap: 15px; margin-bottom: 15px; 
          font-size: 15px; color: #475569; font-weight: 500;
        }
        .icon-green-pro { color: #10b981; }

        @media (min-width: 1024px) {
          .lifestyle-grid-pro { grid-template-columns: 1.2fr 0.8fr; align-items: center; }
          .hero-product-view { padding: 60px 20px; }
          .product-hero-details h1 { font-size: 36px; }
        }
      `}</style>
    </div>
  );
}