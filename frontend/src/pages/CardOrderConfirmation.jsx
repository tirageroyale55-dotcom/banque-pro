import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from "../services/api"; 
import { 
  ArrowLeft, ShieldCheck, Landmark, User, 
  MapPin, Wifi, ChevronRight, MessageSquare, Info
} from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      try {
        // Appel à ton service API existant
        const res = await api("/client/dashboard");
        setDbData(res);
      } catch (err) {
        console.error("Erreur de chargement", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (!card) return null;
  if (loading) return <div className="p-10 text-center">Chargement sécurisé...</div>;

  const { user, account } = dbData;

  return (
    <div className="details-container-fix">
      {/* HEADER NAVIGATION */}
      <nav className="bper-order-nav">
        <button className="back-action-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} /> <span>Retour</span>
        </button>
        <div className="security-badge">
          <ShieldCheck size={16} />
          <span>CRYPTAGE BANCAIRE SSL</span>
        </div>
      </nav>

      <main className="order-main-content">
        <div className="layout-grid-pro">
          
          {/* SECTION 1 : LA CARTE (COPIE STRICTE DE CARDDETAILS) */}
          <aside className="section-hero-product">
            <div className="card-perspective-wrapper">
              <div className="card-floating-animation">
                <div className="card-physical-container">
                  <div className="card-body" style={{ background: card.bg }}>
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
            </div>

            {/* COMPTE DE DÉBIT RÉEL */}
            <div className="account-summary-mini">
              <div className="summary-title"><Landmark size={16}/> Compte lié</div>
              <div className="summary-row">
                <span>N° Compte</span>
                <span className="bold">{account.accountNumber}</span>
              </div>
              <div className="summary-row">
                <span>IBAN</span>
                <span className="bold mono">{account.iban}</span>
              </div>
            </div>
          </aside>

          {/* SECTION 2 : FORMULAIRE ET COORDONNÉES */}
          <section className="form-data-scroll">
            
            <div className="info-group">
              <div className="group-header">
                <User size={18} />
                <h3>Coordonnées Titulaire</h3>
              </div>
              <div className="user-details">
                <div className="det-row">
                  <label>Identité</label>
                  <p>{user.civilite} {user.nom} {user.prenom}</p>
                </div>
                <div className="det-row">
                  <label>E-mail</label>
                  <p>{user.email}</p>
                </div>
                <div className="det-row">
                  <label>Mobile</label>
                  <p>{user.telephone}</p>
                </div>
              </div>
            </div>

            <div className="info-group">
              <div className="group-header">
                <MapPin size={18} />
                <h3>Lieu de livraison</h3>
              </div>
              <div className="address-display">
                <p className="primary">{user.adresse}</p>
                <p className="secondary">{user.codePostal}, {user.ville} - {user.pays}</p>
              </div>
            </div>

            <div className="info-group">
              <div className="group-header">
                <MessageSquare size={18} />
                <h3>Note additionnelle</h3>
              </div>
              <textarea 
                className="bper-textarea"
                placeholder="Une précision sur la livraison ?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
              />
            </div>

            <div className="final-checkout-action">
              <div className="legal-info">
                <Info size={14} />
                <span>En validant, vous acceptez le prélèvement mensuel de {card.price} sur votre compte courant.</span>
              </div>
              <button className="order-main-btn large">
                Confirmer la commande
                <ChevronRight size={20} />
              </button>
            </div>

          </section>
        </div>
      </main>

      <style jsx>{`
        .details-container-fix { 
          background: #f8fafc; min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .bper-order-nav {
          background: #fff; padding: 15px 20px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100;
        }

        .back-action-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #005a64;
          font-weight: 700; cursor: pointer;
        }

        .security-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #059669; font-weight: 800;
          background: #ecfdf5; padding: 6px 12px; border-radius: 4px;
        }

        .order-main-content { padding: 40px 0; }
        .layout-grid-pro {
          max-width: 1100px; margin: 0 auto; padding: 0 20px;
          display: grid; grid-template-columns: 380px 1fr; gap: 60px;
        }

        /* --- STYLE STRICT DE CARDDETAILS.JSX --- */
        .section-hero-product { 
          display: flex; flex-direction: column; align-items: center;
        }
        
        .card-perspective-wrapper { perspective: 1000px; }
        
        .card-floating-animation {
          animation: cardFloat 5s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes cardFloat {
          0% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
          50% { transform: rotateY(5deg) rotateX(-4deg) translateY(-8px); }
          100% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
        }

        .card-physical-container {
          padding: 30px; background: #fff; border-radius: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05); display: flex; justify-content: center;
        }

        .card-body {
          width: 280px; aspect-ratio: 1.58 / 1; border-radius: 14px;
          position: relative; padding: 20px; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          display: flex; flex-direction: column; justify-content: space-between;
        }

        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }

        .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; }
        .bper-logo span { color: #a3e635; }
        .bper-logo small { font-size: 11px; font-weight: 400; opacity: 0.8; }
        .nfc-icon { opacity: 0.8; transform: rotate(90deg); color: white; }

        .emv-chip {
          width: 42px; height: 32px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 6px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.15);
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

        .hero-product-info { text-align: center; margin: 25px 0; }
        .hero-product-info h1 { color: #1e293b; font-size: 24px; font-weight: 800; }
        .hero-price-tag { font-size: 24px; font-weight: 800; color: #005a64; }

        /* --- BLOCS FORMULAIRE --- */
        .info-group {
          background: white; border: 1px solid #e2e8f0; border-radius: 16px;
          padding: 30px; margin-bottom: 25px;
        }
        .group-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px; color: #005a64; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;
        }
        .group-header h3 { font-size: 14px; font-weight: 800; text-transform: uppercase; }

        .det-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dotted #f1f5f9; }
        .det-row label { color: #64748b; font-size: 13px; }
        .det-row p { font-weight: 700; color: #1e293b; font-size: 14px; }

        .address-display .primary { font-size: 16px; font-weight: 700; color: #1e293b; }
        .address-display .secondary { color: #64748b; font-size: 14px; }

        .bper-textarea {
          width: 100%; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;
          background: #f8fafc; font-family: inherit; resize: none;
        }

        .order-main-btn {
          background: #005a64; color: white; border: none; border-radius: 12px;
          padding: 18px; font-weight: 800; font-size: 16px; width: 100%;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        .legal-info { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 12px; margin-bottom: 15px; }

        .account-summary-mini {
          width: 100%; background: #fff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px;
        }
        .summary-title { font-size: 12px; font-weight: 800; color: #005a64; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; }
        .mono { font-family: 'Roboto Mono', monospace; color: #005a64; }

        /* RESPONSIVE */
        @media (max-width: 1000px) {
          .layout-grid-pro { grid-template-columns: 1fr; }
          .section-hero-product { margin-bottom: 20px; }
        }
      `}</style>
    </div>
  );
}