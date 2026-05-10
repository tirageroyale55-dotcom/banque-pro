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
  if (loading) return <div className="bper-loading-state">Sécurisation de la session...</div>;

  const { user, account } = dbData;

  const handleFinalSubmit = () => {
    alert("Votre demande de carte a été transmise à votre conseiller.");
    navigate("/dashboard");
  };

  return (
    <div className="bper-confirmation-screen">
      {/* HEADER NAV */}
      <nav className="bper-top-nav">
        <div className="nav-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          <div className="security-badge">
            <ShieldCheck size={14} />
            <span>SSL SECURE</span>
          </div>
        </div>
      </nav>

      <main className="bper-content">
        <div className="layout-container">
          
          <header className="content-header">
            <h1>Confirmation</h1>
            <p>Vérifiez vos informations pour la carte <strong>{card.name}</strong>.</p>
          </header>

          <div className="main-grid">
            
            {/* COLONNE GAUCHE : LA CARTE (STYLE STRICT CARDDETAILS) */}
            <aside className="visual-sidebar">
              <div className="sticky-wrapper">
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

                <div className="card-meta-simple">
                  <h2>{card.name}</h2>
                  <p className="price">{card.price} <span>/ mois</span></p>
                </div>

                <div className="summary-card-account">
                  <div className="summary-title"><Landmark size={16}/> Compte de prélèvement</div>
                  <div className="summary-row">
                    <span className="lbl">Numéro</span>
                    <span className="val">{account.accountNumber}</span>
                  </div>
                  <div className="summary-row">
                    <span className="lbl">IBAN</span>
                    <span className="val mono">{account.iban}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* COLONNE DROITE : FORMULAIRE ET INFOS */}
            <section className="form-section">
              
              <div className="info-group">
                <div className="group-header">
                  <User size={18} />
                  <h3>Titulaire</h3>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nom complet</label>
                    <p>{user.civilite} {user.nom} {user.prenom}</p>
                  </div>
                  <div className="info-item">
                    <label>E-mail</label>
                    <p>{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MapPin size={18} />
                  <h3>Expédition</h3>
                </div>
                <div className="address-box">
                  <p className="main-address">{user.adresse}</p>
                  <p className="sub-address">{user.codePostal} {user.ville}, {user.pays}</p>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MessageSquare size={18} />
                  <h3>Note particulière</h3>
                </div>
                <textarea 
                  className="bper-textarea"
                  placeholder="Ajouter une instruction pour la livraison ou votre conseiller..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="confirmation-footer">
                <div className="legal-info">
                  <Info size={14} />
                  <p>En confirmant, vous acceptez l'émission de la carte {card.name} aux conditions tarifaires en vigueur.</p>
                </div>
                <button className="btn-final-confirm" onClick={handleFinalSubmit}>
                  <span>Confirmer la demande</span>
                  <ChevronRight size={20} />
                </button>
              </div>

            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        .bper-confirmation-screen {
          background-color: #f8fafc; min-height: 100vh;
          font-family: 'Inter', sans-serif; padding-bottom: 50px;
        }

        .layout-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

        /* NAV */
        .bper-top-nav {
          background: #fff; border-bottom: 1px solid #e2e8f0; padding: 12px 0;
          position: sticky; top: 0; z-index: 100;
        }
        .nav-container { display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        .btn-back { background: none; border: none; color: #005a64; display: flex; align-items: center; gap: 6px; font-weight: 700; cursor: pointer; }
        .security-badge { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #059669; font-weight: 800; background: #ecfdf5; padding: 4px 10px; border-radius: 4px; border: 1px solid #d1fae5; }

        /* HEADER */
        .content-header { padding: 30px 0; }
        .content-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .content-header p { color: #64748b; font-size: 15px; }

        /* GRID */
        .main-grid { display: grid; grid-template-columns: 380px 1fr; gap: 40px; align-items: start; }
        .sticky-wrapper { position: sticky; top: 100px; }

        /* ====================================================
           REPRODUCTION STRICTE DU STYLE DE CARTE CARDDETAILS
           ==================================================== */
        .card-perspective-wrapper { perspective: 1000px; }
        .card-floating-animation { animation: cardFloat 5s ease-in-out infinite; transform-style: preserve-3d; }
        @keyframes cardFloat {
          0% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
          50% { transform: rotateY(5deg) rotateX(-4deg) translateY(-8px); }
          100% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
        }
        .card-physical-container {
          padding: 25px; background: #fff; border-radius: 20px;
          display: flex; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .card-body {
          width: 280px; aspect-ratio: 1.58 / 1; border-radius: 14px;
          position: relative; padding: 20px; overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }
        .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 18px; letter-spacing: -0.5px; }
        .bper-logo span { color: #a3e635; }
        .bper-logo small { font-size: 10px; font-weight: 400; opacity: 0.8; }
        .nfc-icon { opacity: 0.8; transform: rotate(90deg); color: white; }
        .emv-chip {
          width: 40px; height: 30px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 5px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.1);
        }
        .chip-line { position: absolute; background: rgba(0,0,0,0.2); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }
        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-label { font-size: 10px; font-weight: 800; color: white; letter-spacing: 1px; text-transform: uppercase; }
        .mc-symbol { display: flex; position: relative; width: 34px; height: 20px; }
        .circle { width: 20px; height: 20px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        /* META */
        .card-meta-simple { text-align: center; margin: 20px 0; }
        .card-meta-simple h2 { font-size: 22px; font-weight: 800; color: #1e293b; }
        .price { font-size: 24px; font-weight: 800; color: #005a64; }
        .price span { font-size: 14px; color: #94a3b8; }

        /* BLOCS INFO */
        .info-group { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #005a64; border-bottom: 1px solid #f8fafc; padding-bottom: 12px; }
        .group-header h3 { font-size: 13px; font-weight: 800; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .info-item p { font-size: 14px; font-weight: 700; color: #1e293b; }
        .address-box .main-address { font-size: 16px; font-weight: 700; color: #1e293b; }
        .address-box .sub-address { font-size: 14px; color: #64748b; margin-top: 2px; }
        .bper-textarea { width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 12px; font-family: inherit; font-size: 14px; resize: none; }
        
        .summary-card-account { background: #005a64; border-radius: 16px; padding: 20px; color: white; }
        .summary-title { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; margin-bottom: 15px; opacity: 0.9; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .summary-row .val { font-weight: 700; }
        .summary-row .mono { font-family: 'Roboto Mono', monospace; font-size: 11px; }

        /* FOOTER */
        .legal-info { display: flex; gap: 8px; font-size: 12px; color: #64748b; margin-bottom: 20px; line-height: 1.4; }
        .btn-final-confirm {
          width: 100%; background: #005a64; color: white; border: none; padding: 18px; border-radius: 12px;
          font-weight: 800; font-size: 16px; display: flex; justify-content: center; align-items: center; gap: 10px; cursor: pointer;
        }

        /* RESPONSIVE MOBILE */
        @media (max-width: 850px) {
          .main-grid { grid-template-columns: 1fr; gap: 20px; }
          .visual-sidebar { order: -1; }
          .sticky-wrapper { position: static; }
          .info-grid { grid-template-columns: 1fr; }
          .content-header h1 { font-size: 24px; }
          .card-body { width: 260px; } /* Un peu plus petit pour les petits écrans */
        }
      `}</style>
    </div>
  );
}