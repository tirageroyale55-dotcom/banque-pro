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
  if (loading) return <div className="bper-loading-state">Chargement sécurisé...</div>;

  const { user, account } = dbData;

  return (
    <div className="bper-confirmation-screen">
      {/* HEADER FIXE */}
      <nav className="bper-top-nav">
        <div className="nav-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Annuler</span>
          </button>
          <div className="security-badge">
            <ShieldCheck size={14} />
            <span>Transaction sécurisée</span>
          </div>
        </div>
      </nav>

      <main className="bper-content">
        <div className="layout-container">
          
          <header className="content-header">
            <h1>Finaliser ma commande</h1>
            <p>Vérifiez vos informations de livraison et confirmez votre demande de carte <strong>{card.name}</strong>.</p>
          </header>

          <div className="main-grid">
            
            {/* COLONNE GAUCHE : VISUEL (STICKY SUR DESKTOP) */}
            <aside className="visual-sidebar">
              <div className="sticky-wrapper">
                <div className="card-display-box">
                  <div className="perspective-container">
                    <div className="card-animate-float">
                      <div className="card-object" style={{ background: card.bg }}>
                        <div className="card-inner-gloss"></div>
                        <div className="card-row-top">
                          <div className="logo-bper" style={{ color: card.logoColor }}>
                            BPER<span>:</span> <small>Banca</small>
                          </div>
                          <Wifi size={22} className="nfc" />
                        </div>
                        <div className="chip-emv">
                          <div className="chip-line h1"></div>
                          <div className="chip-line h2"></div>
                          <div className="chip-line v1"></div>
                        </div>
                        <div className="card-row-bottom">
                          <div className="type-label">{card.type}</div>
                          <div className="mc-brand">
                            <div className="c-red"></div>
                            <div className="c-yellow"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-meta">
                    <h2>{card.name}</h2>
                    <p className="price">{card.price} <span>/ mois</span></p>
                  </div>
                </div>

                <div className="summary-card small">
                  <div className="summary-title"><Landmark size={16}/> Compte de débit</div>
                  <div className="summary-row">
                    <span>Compte N°</span>
                    <span className="bold">{account.accountNumber}</span>
                  </div>
                  <div className="summary-row">
                    <span>IBAN</span>
                    <span className="bold mono">{account.iban}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* COLONNE DROITE : FORMULAIRES */}
            <section className="form-section">
              
              <div className="info-group">
                <div className="group-header">
                  <User size={18} />
                  <h3>Détails du titulaire</h3>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Nom et Prénom</label>
                    <p>{user.civilite} {user.nom} {user.prenom}</p>
                  </div>
                  <div className="info-item">
                    <label>E-mail associé</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Téléphone</label>
                    <p>{user.telephone}</p>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MapPin size={18} />
                  <h3>Adresse d'expédition</h3>
                </div>
                <div className="address-box">
                  <p className="main-address">{user.adresse}</p>
                  <p className="sub-address">{user.codePostal}, {user.ville} - {user.pays}</p>
                  <div className="delivery-notice">
                    <Info size={14} />
                    <span>Livraison par courrier recommandé sous 3 à 5 jours ouvrés.</span>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MessageSquare size={18} />
                  <h3>Note ou demande particulière</h3>
                </div>
                <textarea 
                  className="bper-input-text"
                  placeholder="Ex: Je souhaite être contacté par mon conseiller avant l'envoi..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="confirmation-footer">
                <div className="legal-box">
                  En cliquant sur le bouton ci-dessous, vous acceptez les conditions générales liées à l'utilisation de la carte {card.name}.
                </div>
                <button className="btn-submit-order">
                  <span>Confirmer la commande</span>
                  <ChevronRight size={20} />
                </button>
              </div>

            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* VARIABLES & RESET */
        .bper-confirmation-screen {
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .layout-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* NAVIGATION */
        .bper-top-nav {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 15px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-back {
          background: none; border: none; color: #005a64;
          display: flex; align-items: center; gap: 8px;
          font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .btn-back:hover { opacity: 0.7; }
        .security-badge {
          display: flex; align-items: center; gap: 6px;
          color: #059669; background: #f0fdf4;
          padding: 6px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 600; border: 1px solid #dcfce7;
        }

        /* HEADER */
        .content-header { padding: 40px 0; }
        .content-header h1 { font-size: 32px; color: #0f172a; font-weight: 800; margin-bottom: 10px; }
        .content-header p { color: #64748b; font-size: 16px; }

        /* GRID DESKTOP */
        .main-grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 50px;
          padding-bottom: 80px;
        }

        .sticky-wrapper {
          position: sticky;
          top: 100px;
        }

        /* CARD STYLING (ANIMATION EXACTE CARDDETAILS) */
        .card-display-box {
          background: #005a64;
          padding: 40px;
          border-radius: 24px;
          color: white;
          margin-bottom: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .perspective-container { perspective: 1000px; }
        .card-animate-float {
          animation: float 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotateX(2deg) rotateY(-5deg); }
          50% { transform: translateY(-15px) rotateX(-2deg) rotateY(5deg); }
        }
        .card-object {
          width: 100%; aspect-ratio: 1.58/1; border-radius: 15px;
          position: relative; padding: 20px; overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .card-inner-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%);
        }
        .card-row-top { display: flex; justify-content: space-between; }
        .logo-bper { font-weight: 900; font-size: 20px; }
        .logo-bper span { color: #a3e635; }
        .chip-emv {
          width: 45px; height: 35px; background: #fbbf24; border-radius: 6px;
          position: relative; border: 1px solid rgba(0,0,0,0.1);
        }
        .card-row-bottom { display: flex; justify-content: space-between; align-items: flex-end; }
        .type-label { font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .mc-brand { display: flex; position: relative; width: 40px; height: 25px; }
        .mc-brand div { width: 25px; height: 25px; border-radius: 50%; position: absolute; }
        .c-red { background: #eb001b; left: 0; }
        .c-yellow { background: #ff5f00; right: 0; opacity: 0.85; }

        .card-meta { margin-top: 25px; text-align: center; }
        .card-meta h2 { font-size: 24px; font-weight: 800; }
        .price { font-size: 26px; font-weight: 800; color: #a3e635; margin-top: 5px; }
        .price span { font-size: 14px; color: #cbd5e1; }

        /* BLOCS INFO */
        .info-group {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 30px; margin-bottom: 24px;
        }
        .group-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 25px; color: #005a64;
          border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;
        }
        .group-header h3 { font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; }
        .info-item label { display: block; font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 5px; text-transform: uppercase; }
        .info-item p { font-size: 15px; color: #1e293b; font-weight: 700; }

        .address-box .main-address { font-size: 18px; font-weight: 700; color: #1e293b; }
        .address-box .sub-address { color: #64748b; margin-top: 4px; }
        .delivery-notice {
          display: flex; align-items: center; gap: 8px;
          margin-top: 20px; padding: 12px; background: #f8fafc;
          border-radius: 8px; color: #475569; font-size: 13px;
        }

        .bper-input-text {
          width: 100%; border: 1px solid #e2e8f0; background: #f8fafc;
          border-radius: 12px; padding: 15px; font-family: inherit;
          resize: none; transition: 0.2s;
        }
        .bper-input-text:focus { border-color: #005a64; outline: none; background: #fff; box-shadow: 0 0 0 4px rgba(0, 90, 100, 0.05); }

        /* FOOTER ACTION */
        .confirmation-footer { margin-top: 40px; }
        .legal-box { font-size: 12px; color: #94a3b8; margin-bottom: 20px; line-height: 1.6; }
        .btn-submit-order {
          width: 100%; background: #005a64; color: white; border: none;
          padding: 20px; border-radius: 14px; font-weight: 800; font-size: 16px;
          display: flex; justify-content: center; align-items: center; gap: 10px;
          cursor: pointer; transition: 0.3s;
          box-shadow: 0 10px 15px -3px rgba(0, 90, 100, 0.2);
        }
        .btn-submit-order:hover { background: #00454d; transform: translateY(-2px); }

        /* SUMMARY COMPTE */
        .summary-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
        .summary-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #005a64; margin-bottom: 15px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
        .bold { font-weight: 700; color: #1e293b; }
        .mono { font-family: 'Roboto Mono', monospace; font-size: 11px; color: #005a64; }

        /* --- MOBILE ADAPTATION --- */
        @media (max-width: 1000px) {
          .main-grid { grid-template-columns: 1fr; gap: 30px; }
          .content-header h1 { font-size: 26px; }
          .visual-sidebar { order: -1; }
          .sticky-wrapper { position: static; }
          .info-grid { grid-template-columns: 1fr; gap: 15px; }
          .card-display-box { padding: 30px 20px; }
          .card-object { width: 280px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}