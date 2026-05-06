import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, Globe, ArrowLeft, Lock, creditCard, ShoppingBag, Landmark } from 'lucide-react';

export default function CardDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};

  // Scroll en haut automatique au chargement
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!card) return <div className="p-10">Chargement des données bancaires...</div>;

  // Configuration spécifique par type de carte
  const cardConfigs = {
    debit: {
      image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=1000",
      alt: "Femme élégante au bureau présentant la carte Debit Online",
      description: "La solution agile pour vos paiements quotidiens, alliant simplicité et sécurité immédiate."
    },
    classic: {
      image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1000",
      alt: "Conseiller présentant la carte Classic à une cliente",
      description: "Le confort d'un crédit maîtrisé avec des garanties d'assurance étendues pour toute la famille."
    },
    gold: {
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1000",
      alt: "Présentation exclusive de la carte BPER Gold",
      description: "L'excellence bancaire : plafonds élevés, services VIP et protection premium internationale."
    }
  };

  const config = cardConfigs[card.id] || cardConfigs.debit;

  return (
    <div className="details-page">
      {/* HEADER FIXE NAVIGATION */}
      <nav className="bper-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} /> Catalogue
        </button>
        <div className="nav-logo">BPER: <span>Banca</span></div>
      </nav>

      {/* SECTION 1 : PRÉSENTATION CARTE (HERO) */}
      <section className="hero-card-section">
        <div className="card-presentation">
          <div className="card-visual-wrapper">
             <div className="card-real-render" style={{ background: card.bg }}>
                <div className="card-gloss-effect"></div>
                <div className="card-chip-gold"></div>
                <div className="card-logo-white">BPER: <span>Banca</span></div>
                <div className="card-number">•••• •••• •••• 4012</div>
                <div className="card-holder-name">CLIENT PRIVILÉGIÉ</div>
                <div className="card-type-tag">{card.type}</div>
             </div>
          </div>
          <div className="card-intro-text">
            <span className="badge">Sélection officielle</span>
            <h1>{card.name}</h1>
            <p className="price-tag">{card.price} <span>/ mois</span></p>
            <button className="main-order-btn">Commander maintenant</button>
          </div>
        </div>
      </section>

      {/* SECTION 2 : LIFESTYLE ET DÉTAILS (SCROLL) */}
      <section className="experience-details-section">
        <div className="experience-container">
          
          {/* IMAGE RÉALISTE DYNAMIQUE */}
          <div className="lifestyle-image-box">
            <img src={config.image} alt={config.alt} />
            <div className="image-overlay-info">
              <div className="mini-card-float" style={{ background: card.bg }}></div>
            </div>
          </div>

          {/* DÉTAILS TECHNIQUES & AVANTAGES */}
          <div className="details-content">
            <h2 className="section-title">Pourquoi choisir la {card.name} ?</h2>
            <p className="section-desc">{config.description}</p>

            <div className="features-grid">
              <div className="feature-item">
                <div className="icon-circle"><Zap size={22} /></div>
                <div>
                  <h4>Fonctionnalités</h4>
                  <ul>
                    {card.features.map((f, i) => <li key={i}><CheckCircle2 size={16} /> {f}</li>)}
                    <li>Paiements NFC & sans contact</li>
                  </ul>
                </div>
              </div>

              <div className="feature-item">
                <div className="icon-circle"><Lock size={22} /></div>
                <div>
                  <h4>Sécurité BPER</h4>
                  <p>Technologie 3D Secure 2.0, blocage instantané via application et cryptage EMV.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="icon-circle"><Globe size={22} /></div>
                <div>
                  <h4>Avantages Internationaux</h4>
                  <p>Retraits gratuits en zone Euro et assistance voyage 24h/24 incluse.</p>
                </div>
              </div>
            </div>
            
            <div className="security-guarantee">
              <ShieldCheck size={24} color="#10b981" />
              <span>Garantie de protection contre la fraude intégrée</span>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .details-page { background: #ffffff; min-height: 100vh; font-family: 'Inter', sans-serif; color: #1e293b; }
        
        /* Nav */
        .bper-nav { display: flex; justify-content: space-between; align-items: center; padding: 15px 5%; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; z-index: 100; }
        .back-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; color: #64748b; font-weight: 600; }
        .nav-logo { font-weight: 900; color: #005a64; }
        .nav-logo span { color: #10b981; }

        /* Section 1: Hero */
        .hero-card-section { padding: 60px 5%; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); display: flex; justify-content: center; }
        .card-presentation { display: flex; align-items: center; gap: 60px; max-width: 1100px; width: 100%; }
        .card-visual-wrapper { perspective: 1000px; }
        
        .card-real-render { 
          width: 400px; aspect-ratio: 1.58/1; border-radius: 20px; position: relative; padding: 30px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.15); transform: rotateY(-5deg); transition: 0.5s;
        }
        .card-chip-gold { width: 50px; height: 40px; background: linear-gradient(135deg, #fde047, #ca8a04); border-radius: 8px; margin-bottom: 20px; }
        .card-logo-white { color: white; font-weight: 900; font-size: 24px; }
        .card-number { color: white; font-family: 'Courier New', monospace; font-size: 1.2rem; margin-top: 40px; letter-spacing: 2px; }
        .card-holder-name { color: rgba(255,255,255,0.8); font-size: 0.8rem; margin-top: 10px; text-transform: uppercase; }
        .card-type-tag { position: absolute; bottom: 30px; right: 30px; color: white; font-weight: 800; opacity: 0.6; }

        .card-intro-text h1 { font-size: 42px; font-weight: 800; color: #0f172a; margin: 10px 0; }
        .price-tag { font-size: 32px; font-weight: 800; color: #005a64; }
        .price-tag span { font-size: 16px; color: #94a3b8; font-weight: 400; }
        .main-order-btn { margin-top: 25px; background: #10b981; color: white; border: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.3s; }
        .main-order-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }

        /* Section 2: Experience */
        .experience-container { display: grid; grid-template-columns: 1fr 1fr; gap: 0; min-height: 600px; }
        .lifestyle-image-box { position: relative; overflow: hidden; height: 100%; }
        .lifestyle-image-box img { width: 100%; height: 100%; object-fit: cover; }
        
        .details-content { padding: 80px 60px; background: #fff; }
        .section-title { font-size: 32px; font-weight: 800; margin-bottom: 15px; }
        .section-desc { color: #64748b; font-size: 18px; line-height: 1.6; margin-bottom: 40px; }

        .features-grid { display: grid; gap: 30px; }
        .feature-item { display: flex; gap: 20px; }
        .icon-circle { width: 50px; height: 50px; background: #f0fdf4; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .feature-item h4 { margin: 0 0 8px 0; font-size: 18px; }
        .feature-item p, .feature-item li { color: #64748b; font-size: 14px; margin: 0; }
        .feature-item ul { list-style: none; padding: 0; }
        .feature-item li { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }

        .security-guarantee { margin-top: 50px; display: flex; align-items: center; gap: 12px; padding: 20px; background: #f8fafc; border-radius: 12px; font-weight: 600; font-size: 14px; }

        /* MOBILE RESPONSIVE */
        @media (max-width: 1000px) {
          .card-presentation { flex-direction: column; text-align: center; gap: 30px; }
          .card-real-render { width: 320px; transform: none; }
          .experience-container { grid-template-columns: 1fr; }
          .lifestyle-image-box { height: 400px; order: 2; }
          .details-content { padding: 40px 20px; order: 3; }
          .card-intro-text h1 { font-size: 30px; }
        }
      `}</style>
    </div>
  );
}