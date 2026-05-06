import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, Globe, ShieldCheck, Zap, Wifi } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!card) return <div className="p-10">Chargement...</div>;

  // Configuration des images locales et des scènes spécifiques
  const getScene = () => {
    switch (card.id) {
      case 'debit':
        return { img: "/images/debit_scene.jpg", title: "Liberté Numérique" };
      case 'classic':
        return { img: "/images/classic_scene.jpg", title: "Accompagnement Pro" };
      case 'gold':
        return { img: "/images/gold_scene.jpg", title: "Privilège & Prestige" };
      default:
        return { img: "/images/debit_scene.jpg", title: "Service BPER" };
    }
  };

  const scene = getScene();

  return (
    <div className="details-wrapper">
      {/* Retour flottant */}
      <button className="back-btn-float" onClick={() => navigate(-1)}>
        <ArrowLeft size={24} />
      </button>

      {/* SECTION 1 : LA CARTE (VISIBLE DE SUITE) */}
      <section className="hero-card-section">
        <div className="card-focus-container">
          {/* REPRODUCTION EXACTE DU STYLE CARDCATALOG */}
          <div className="card-body-realist" style={{ background: card.bg }}>
            <div className="card-gloss-overlay"></div>
            
            <div className="card-row-top">
              <div className="bper-logo-detail" style={{ color: card.logoColor }}>
                BPER<span>:</span> <small>Banca</small>
              </div>
              <Wifi size={24} className="nfc-icon-detail" strokeWidth={1.5} />
            </div>

            <div className="emv-chip-realist">
              <div className="chip-line-h1"></div>
              <div className="chip-line-h2"></div>
              <div className="chip-line-v"></div>
            </div>

            <div className="card-row-bottom">
              <div className="card-type-text">{card.type}</div>
              <div className="mastercard-logo">
                <div className="mc-circle mc-red"></div>
                <div className="mc-circle mc-yellow"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-cta-area">
          <h1>{card.name}</h1>
          <p className="hero-price-tag">{card.price}<span>/mois</span></p>
          <button className="btn-order-bper">Commander maintenant</button>
        </div>
      </section>

      {/* SECTION 2 : IMAGE LIFESTYLE & DÉTAILS (AU SCROLL) */}
      <section className="lifestyle-details-section">
        <div className="lifestyle-layout">
          <div className="image-frame">
            <img src={scene.img} alt={scene.title} className="realist-photo" />
          </div>

          <div className="text-content-frame">
            <h2 className="bper-teal-title">{scene.title}</h2>
            <p className="bper-description">
              Découvrez un service bancaire conçu pour votre confort. La technologie BPER Banca 
              vous assure une sécurité mondiale et une gestion simplifiée.
            </p>

            <div className="benefits-list-pro">
              <div className="benefit-item-pro">
                <ShieldCheck className="icon-teal" />
                <div>
                  <h4>Sécurité Totale</h4>
                  <p>Technologie de cryptage EMV et authentification forte.</p>
                </div>
              </div>
              <div className="benefit-item-pro">
                <Globe className="icon-teal" />
                <div>
                  <h4>Portée Mondiale</h4>
                  <p>Acceptée dans plus de 200 pays et territoires.</p>
                </div>
              </div>
              <div className="benefit-item-pro">
                <Zap className="icon-teal" />
                <div>
                  <h4>Services Exclusifs</h4>
                  <p>Avantages et assistances dédiés à votre profil.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .details-wrapper { background: #ffffff; }

        .back-btn-float {
          position: fixed; top: 25px; left: 25px; z-index: 100;
          background: #fff; border: 1px solid #f1f5f9; padding: 12px;
          border-radius: 50%; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        /* SECTION 1 : CARTE */
        .hero-card-section {
          height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; background: #f8fafc;
        }

        .card-focus-container { perspective: 1000px; margin-bottom: 50px; }

        /* REPRODUCTION STYLE EXACT CARDCATALOG */
        .card-body-realist {
          width: 350px; aspect-ratio: 1.58 / 1; border-radius: 16px;
          position: relative; padding: 25px; overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.25);
          display: flex; flex-direction: column; justify-content: space-between;
        }

        .card-gloss-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }

        .card-row-top { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo-detail { font-weight: 900; font-size: 22px; letter-spacing: -0.5px; }
        .bper-logo-detail span { color: #a3e635; }
        .bper-logo-detail small { font-size: 11px; font-weight: 400; opacity: 0.8; }
        .nfc-icon-detail { color: white; transform: rotate(90deg); opacity: 0.8; }

        .emv-chip-realist {
          width: 50px; height: 38px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.1);
        }
        .chip-line-h1 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; top: 33%; }
        .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.2); width: 100%; height: 1px; top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.2); height: 100%; width: 1px; left: 50%; }

        .card-row-bottom { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-type-text { font-size: 12px; font-weight: 800; color: white; letter-spacing: 1.5px; }

        .mastercard-logo { display: flex; position: relative; width: 40px; height: 25px; }
        .mc-circle { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .mc-red { background: #eb001b; left: 0; }
        .mc-yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        .hero-cta-area { text-align: center; }
        .hero-cta-area h1 { color: #005a64; font-size: 34px; font-weight: 800; margin-bottom: 5px; }
        .hero-price-tag { font-size: 28px; font-weight: 800; color: #1e293b; }
        .hero-price-tag span { font-size: 14px; color: #94a3b8; margin-left: 4px; }

        .btn-order-bper {
          margin-top: 25px; padding: 18px 60px; background: #005a64;
          color: white; border: none; border-radius: 100px; font-weight: 700;
          font-size: 16px; cursor: pointer; transition: 0.3s;
          box-shadow: 0 10px 20px rgba(0, 90, 100, 0.2);
        }

        /* SECTION 2 : LIFESTYLE */
        .lifestyle-details-section { padding: 100px 5%; background: white; }
        .lifestyle-layout { 
          display: grid; grid-template-columns: 1.1fr 0.9fr; 
          gap: 70px; max-width: 1200px; margin: 0 auto; align-items: center;
        }

        .realist-photo { 
          width: 100%; height: 600px; object-fit: cover; 
          border-radius: 40px; box-shadow: 0 25px 50px rgba(0,0,0,0.12); 
        }

        .bper-teal-title { color: #005a64; font-size: 40px; font-weight: 800; margin-bottom: 20px; }
        .bper-description { font-size: 18px; color: #64748b; line-height: 1.7; margin-bottom: 40px; }

        .benefits-list-pro { display: grid; gap: 35px; }
        .benefit-item-pro { display: flex; gap: 20px; }
        .icon-teal { color: #005a64; flex-shrink: 0; margin-top: 4px; }
        .benefit-item-pro h4 { font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .benefit-item-pro p { color: #64748b; font-size: 15px; margin: 0; }

        @media (max-width: 1000px) {
          .hero-card-section { height: auto; padding: 120px 20px 60px; }
          .card-body-realist { width: 300px; }
          .lifestyle-layout { grid-template-columns: 1fr; }
          .realist-photo { height: 400px; }
        }
      `}</style>
    </div>
  );
}