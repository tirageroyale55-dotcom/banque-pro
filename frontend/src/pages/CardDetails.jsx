import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Globe, Zap, Wifi } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const { card } = location.state || {};

  // 1. Correction du Scroll au montage
  useEffect(() => {
    window.scrollTo(0, 0);
    // Petit délai pour s'assurer que le DOM est prêt (utile avec les Layouts complexes)
    const timer = setTimeout(() => window.scrollTo(0, 0), 10);
    return () => clearTimeout(timer);
  }, []);

  // 2. Logique de mouvement 3D Pro
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const cardNode = cardRef.current;
    const rect = cardNode.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    cardNode.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  if (!card) return null;

  const scene = {
    debit: { img: "/images/debit_scene.jpg", title: "Liberté Numérique" },
    classic: { img: "/images/classic_scene.jpg", title: "Accompagnement Pro" },
    gold: { img: "/images/gold_scene.jpg", title: "Privilège & Prestige" }
  }[card.id] || { img: "/images/debit_scene.jpg", title: "Service BPER" };

  return (
    <div className="details-container-fixed">
      <button className="btn-back-minimal" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
      </button>

      {/* SECTION CARTE : PREMIÈRE CHOSE VISIBLE */}
      <div className="top-hero-section">
        <div 
          className="interactive-card-wrapper"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          ref={cardRef}
        >
          {/* STYLE EXACT CARDCATALOG */}
          <div className="card-pro-visual" style={{ background: card.bg }}>
            <div className="glass-shine"></div>
            <div className="top-info">
              <div className="bper-label-main">BPER<span>:</span> <small>Banca</small></div>
              <Wifi size={24} className="nfc-icon-pro" />
            </div>
            <div className="chip-pro-gold">
               <div className="chip-line-h1"></div><div className="chip-line-h2"></div><div className="chip-line-v"></div>
            </div>
            <div className="bottom-info">
              <div className="type-tag-pro">{card.type}</div>
              <div className="mc-logo-pro">
                <div className="circle-red"></div><div className="circle-orange"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-content-pro">
          <h1>{card.name}</h1>
          <div className="price-tag-pro">{card.price}<span>/mois</span></div>
          <button className="btn-order-pro">Commander maintenant</button>
        </div>
      </div>

      {/* SECTION SCENE REALISTE (AU SCROLL) */}
      <div className="bottom-experience-section">
        <div className="content-split">
          <div className="image-side-realist">
            <img src={scene.img} alt="BPER Experience" />
          </div>
          <div className="text-side-realist">
            <h2>{scene.title}</h2>
            <p>L'excellence bancaire BPER Banca s'adapte à votre style de vie. Profitez d'une technologie sécurisée et d'un accompagnement personnalisé.</p>
            
            <div className="features-stack-pro">
                <div className="item-pro"><ShieldCheck size={22}/> <span>Sécurité 3D Secure 2.0</span></div>
                <div className="item-pro"><Globe size={22}/> <span>Paiements Internationaux</span></div>
                <div className="item-pro"><Zap size={22}/> <span>Service Client Prioritaire</span></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .details-container-fixed { background: #fff; width: 100%; position: relative; }
        
        .btn-back-minimal {
          position: fixed; top: 20px; left: 20px; z-index: 100;
          background: #fff; border: 1px solid #eee; padding: 10px;
          border-radius: 50%; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .top-hero-section {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; background: #f9fbff;
          padding: 80px 20px;
        }

        /* MOUVEMENT PRO 3D */
        .interactive-card-wrapper {
          transition: transform 0.1s ease-out;
          will-change: transform;
          cursor: pointer;
          margin-bottom: 40px;
        }

        .card-pro-visual {
          width: 350px; aspect-ratio: 1.58 / 1; border-radius: 18px;
          position: relative; padding: 25px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; justify-content: space-between;
          color: white;
        }

        .glass-shine {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0) 52%);
        }

        .top-info { display: flex; justify-content: space-between; align-items: center; }
        .bper-label-main { font-weight: 900; font-size: 22px; }
        .bper-label-main span { color: #a3e635; }
        .nfc-icon-pro { transform: rotate(90deg); opacity: 0.8; }

        .chip-pro-gold {
          width: 50px; height: 38px; background: linear-gradient(135deg, #facc15, #ca8a04);
          border-radius: 6px; position: relative; border: 1px solid rgba(0,0,0,0.1);
        }
        .chip-line-h1, .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; }
        .chip-line-h1 { top: 33%; } .chip-line-h2 { top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.2); height: 100%; width: 1px; left: 50%; }

        .bottom-info { display: flex; justify-content: space-between; align-items: flex-end; }
        .type-tag-pro { font-weight: 800; letter-spacing: 2px; font-size: 12px; }
        .mc-logo-pro { display: flex; position: relative; width: 40px; height: 25px; }
        .circle-red, .circle-orange { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .circle-red { background: #eb001b; } .circle-orange { background: #ff5f00; right: 0; opacity: 0.9; }

        .cta-content-pro { text-align: center; }
        .cta-content-pro h1 { color: #005a64; font-size: 32px; margin-bottom: 5px; }
        .price-tag-pro { font-size: 28px; font-weight: 800; color: #1e293b; }
        .price-tag-pro span { font-size: 14px; color: #94a3b8; margin-left: 5px; }

        .btn-order-pro {
          margin-top: 30px; padding: 18px 60px; background: #005a64;
          color: white; border: none; border-radius: 100px; font-weight: 700;
          font-size: 16px; cursor: pointer; box-shadow: 0 10px 25px rgba(0,90,100,0.2);
        }

        .bottom-experience-section { padding: 100px 5%; background: white; }
        .content-split { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; max-width: 1200px; margin: 0 auto; }
        .image-side-realist img { width: 100%; height: 600px; object-fit: cover; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        
        .text-side-realist h2 { font-size: 38px; color: #005a64; margin-bottom: 20px; font-weight: 800; }
        .text-side-realist p { font-size: 18px; color: #64748b; line-height: 1.7; margin-bottom: 35px; }
        
        .features-stack-pro { display: grid; gap: 20px; }
        .item-pro { display: flex; align-items: center; gap: 15px; color: #1e293b; font-weight: 600; }
        .item-pro :global(svg) { color: #10b981; }

        @media (max-width: 1000px) {
          .top-hero-section { min-height: auto; padding: 100px 20px; }
          .content-split { grid-template-columns: 1fr; }
          .image-side-realist img { height: 400px; }
          .card-pro-visual { width: 300px; }
        }
      `}</style>
    </div>
  );
}