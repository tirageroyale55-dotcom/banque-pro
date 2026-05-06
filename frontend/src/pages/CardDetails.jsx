import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Globe, ShieldCheck, Zap } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!card) return <div className="p-10">Chargement...</div>;

  // Configuration des assets locaux et textes spécifiques
  const contentMap = {
    debit: {
      localImg: "/images/debit_scene.jpg", // Chemin vers ton dossier public
      title: "Gestion Dynamique",
      desc: "Contrôlez vos finances en temps réel avec la réactivité BPER."
    },
    classic: {
      localImg: "/images/classic_scene.jpg",
      title: "Sérénité Quotidienne",
      desc: "Le partenaire idéal pour vos achats et vos projets personnels."
    },
    gold: {
      localImg: "/images/gold_scene.jpg",
      title: "Exclusivité Premium",
      desc: "Accédez à un univers de services privilèges et de hautes protections."
    }
  };

  const info = contentMap[card.id] || contentMap.debit;

  return (
    <div className="details-wrapper">
      {/* Retour rapide */}
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
      </button>

      {/* SECTION 1 : FOCUS PRODUIT (VISIBLE IMMÉDIATEMENT) */}
      <section className="product-hero-section">
        <div className="card-presentation-box">
          <div className="card-3d-render" style={{ background: card.bg }}>
            <div className="card-inner-design">
              <div className="card-top-header">
                <span className="brand-logo">BPER<span>:</span> <small>Banca</small></span>
                <div className="nfc-wave"></div>
              </div>
              <div className="emv-chip-gold"></div>
              <div className="card-numbers-ghost">**** **** **** 8841</div>
              <div className="card-holder-name">NOM DU TITULAIRE</div>
              <div className="card-badge-type">{card.type}</div>
            </div>
            <div className="card-reflection"></div>
          </div>
        </div>

        <div className="product-cta-block">
          <h1>{card.name}</h1>
          <div className="price-display">
            <span className="amount">{card.price}</span>
            <span className="label">/ mois</span>
          </div>
          <p className="hero-subtitle">Technologie de paiement sécurisée de nouvelle génération.</p>
          <button className="btn-order-now">
            Commander maintenant
          </button>
        </div>
      </section>

      {/* SECTION 2 : LIFESTYLE & DÉTAILS (VISIBLE AU SCROLL) */}
      <section className="experience-scroll-section">
        <div className="lifestyle-grid">
          <div className="image-side">
            {/* Cette image provient de ton dossier public/images/ */}
            <img src={info.localImg} alt="Scène bancaire réaliste" className="main-lifestyle-img" />
            <div className="image-caption">
              <span>Conseil Expert BPER Banca</span>
            </div>
          </div>

          <div className="details-side">
            <h2 className="section-title">{info.title}</h2>
            <p className="section-text">{info.desc}</p>

            <div className="benefits-stack">
              <div className="benefit-card">
                <ShieldCheck className="b-icon" />
                <div>
                  <h4>Sécurité Avancée</h4>
                  <p>Protection contre la fraude et cryptage des données bancaires EMV.</p>
                </div>
              </div>
              <div className="benefit-card">
                <Globe className="b-icon" />
                <div>
                  <h4>Usage International</h4>
                  <p>Payez et retirez de l'argent partout dans le monde sans soucis.</p>
                </div>
              </div>
              <div className="benefit-card">
                <Zap className="b-icon" />
                <div>
                  <h4>Avantages Exclusifs</h4>
                  <p>Accès aux programmes de fidélité et assurances voyage BPER.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .details-wrapper { background: #fff; }

        .back-btn {
          position: fixed; top: 25px; left: 25px; z-index: 100;
          background: #fff; border: 1px solid #e2e8f0; padding: 10px;
          border-radius: 50%; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        /* SECTION HERO (CARTE) */
        .product-hero-section {
          height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: #fcfdfe; padding: 20px;
        }

        .card-3d-render {
          width: 360px; aspect-ratio: 1.58/1; border-radius: 20px;
          position: relative; padding: 30px; color: #fff;
          box-shadow: 0 40px 80px rgba(0,0,0,0.25);
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
        }
        
        .card-3d-render:hover { transform: translateY(-10px) rotateX(5deg); }

        .brand-logo { font-size: 26px; font-weight: 900; }
        .brand-logo span { color: #a3e635; }
        .emv-chip-gold { 
          width: 55px; height: 42px; 
          background: linear-gradient(135deg, #fde047, #a16207); 
          border-radius: 8px; margin-top: 25px; 
        }
        .card-numbers-ghost { margin-top: 35px; font-size: 20px; font-family: monospace; letter-spacing: 4px; opacity: 0.9; }
        .card-badge-type { position: absolute; bottom: 30px; right: 30px; font-weight: 800; letter-spacing: 2px; font-size: 14px; }

        .product-cta-block { text-align: center; margin-top: 50px; }
        .product-cta-block h1 { color: #005a64; font-size: 32px; font-weight: 800; margin-bottom: 10px; }
        .price-display { display: flex; align-items: baseline; justify-content: center; gap: 8px; }
        .amount { font-size: 38px; font-weight: 900; color: #1e293b; }
        .label { color: #64748b; font-weight: 500; }
        .hero-subtitle { color: #94a3b8; margin: 15px 0 30px; font-size: 16px; }

        .btn-order-now {
          background: #005a64; color: #fff; border: none;
          padding: 18px 50px; border-radius: 100px; font-weight: 700;
          font-size: 17px; cursor: pointer; transition: 0.3s;
          box-shadow: 0 10px 25px rgba(0, 90, 100, 0.2);
        }
        .btn-order-now:hover { background: #00454d; transform: scale(1.05); }

        /* SECTION LIFESTYLE (SCROLL) */
        .experience-scroll-section { padding: 100px 5%; background: #fff; }
        .lifestyle-grid { 
          display: grid; grid-template-columns: 1.2fr 0.8fr; 
          gap: 80px; align-items: center; max-width: 1200px; margin: 0 auto; 
        }

        .main-lifestyle-img { 
          width: 100%; border-radius: 40px; 
          box-shadow: 0 30px 60px rgba(0,0,0,0.1); 
          object-fit: cover; height: 650px;
        }

        .section-title { color: #005a64; font-size: 42px; font-weight: 800; margin-bottom: 25px; }
        .section-text { color: #64748b; font-size: 19px; line-height: 1.7; margin-bottom: 45px; }

        .benefits-stack { display: grid; gap: 35px; }
        .benefit-card { display: flex; gap: 20px; }
        .b-icon { color: #005a64; flex-shrink: 0; }
        .benefit-card h4 { color: #1e293b; font-weight: 700; margin-bottom: 5px; }
        .benefit-card p { color: #64748b; font-size: 15px; margin: 0; }

        /* Mobile */
        @media (max-width: 1000px) {
          .lifestyle-grid { grid-template-columns: 1fr; gap: 40px; }
          .main-lifestyle-img { height: 400px; }
          .card-3d-render { width: 300px; }
          .product-hero-section { height: auto; padding: 120px 20px 60px; }
          .section-title { font-size: 32px; }
        }
      `}</style>
    </div>
  );
}