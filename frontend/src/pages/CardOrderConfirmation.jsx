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
        // Chemin validé par tes tests précédents
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
    alert("Demande transmise avec succès.");
    navigate("/dashboard");
  };

  return (
    <div className="bper-confirmation-screen">
      {/* HEADER NAVIGATION */}
      <nav className="bper-top-nav">
        <div className="nav-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
          <div className="security-badge">
            <ShieldCheck size={14} />
            <span>Lien sécurisé</span>
          </div>
        </div>
      </nav>

      <main className="bper-content">
        <div className="layout-container">
          
          <header className="content-header">
            <h1>Confirmation de commande</h1>
            <p>Vérifiez les détails pour l'envoi de votre carte <strong>{card.name}</strong>.</p>
          </header>

          <div className="main-grid">
            
            {/* COLONNE GAUCHE : LA CARTE (STYLE STRICT CARDDETAILS) */}
            <aside className="visual-sidebar">
              <div className="sticky-wrapper">
                
                {/* REPRODUCTION STRICTE DU STYLE CARDDETAILS */}
                <div className="card-physical-container">
                  <div className="card-floating-animation">
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

                <div className="card-meta-simple">
                  <h2>{card.name}</h2>
                  <p className="price-label">{card.price} <span>/ mois</span></p>
                </div>

                {/* RÉSUMÉ COMPTE */}
                <div className="summary-card-account">
                  <div className="summary-title"><Landmark size={16}/> Compte de prélèvement</div>
                  <div className="summary-row">
                    <span>N° de compte</span>
                    <span className="val-bold">{account.accountNumber}</span>
                  </div>
                  <div className="summary-row">
                    <span>IBAN</span>
                    <span className="val-bold mono">{account.iban}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* COLONNE DROITE : FORMULAIRE & INFOS */}
            <section className="form-section">
              
              <div className="info-group">
                <div className="group-header">
                  <User size={18} />
                  <h3>Titulaire de la carte</h3>
                </div>
                <div className="info-flex-grid">
                  <div className="info-block">
                    <label>Nom complet</label>
                    <p>{user.civilite} {user.nom} {user.prenom}</p>
                  </div>
                  <div className="info-block">
                    <label>E-mail</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="info-block">
                    <label>Mobile</label>
                    <p>{user.telephone}</p>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MapPin size={18} />
                  <h3>Adresse de livraison</h3>
                </div>
                <div className="address-display">
                  <p className="addr-main">{user.adresse}</p>
                  <p className="addr-sub">{user.codePostal}, {user.ville} — {user.pays}</p>
                  <div className="info-alert">
                    <Info size={14} />
                    <span>L'envoi sera effectué par courrier recommandé A/R.</span>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MessageSquare size={18} />
                  <h3>Instructions particulières</h3>
                </div>
                <textarea 
                  className="bper-textarea"
                  placeholder="Ex: Code d'accès, instructions pour le livreur..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="action-final-zone">
                <p className="legal-info">
                  En validant, vous acceptez la tarification de {card.price}/mois applicable dès l'activation de la carte.
                </p>
                <button className="btn-confirm-order" onClick={handleFinalSubmit}>
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
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .layout-container { max-width: 1150px; margin: 0 auto; padding: 0 20px; }

        /* HEADER */
        .bper-top-nav {
          background: #fff; border-bottom: 1px solid #e2e8f0;
          padding: 15px 0; position: sticky; top: 0; z-index: 100;
        }
        .nav-container {
          display: flex; justify-content: space-between; align-items: center;
          max-width: 1150px; margin: 0 auto; padding: 0 20px;
        }
        .btn-back {
          background: none; border: none; color: #005a64;
          display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;
        }
        .security-badge {
          display: flex; align-items: center; gap: 6px;
          color: #059669; background: #f0fdf4; padding: 6px 12px;
          border-radius: 20px; font-size: 11px; font-weight: 700; border: 1px solid #dcfce7;
        }

        .content-header { padding: 40px 0 30px; }
        .content-header h1 { font-size: 28px; color: #0f172a; font-weight: 800; }
        .content-header p { color: #64748b; margin-top: 5px; }

        /* GRID */
        .main-grid {
          display: grid; grid-template-columns: 380px 1fr;
          gap: 50px; padding-bottom: 60px;
        }

        .sticky-wrapper { position: sticky; top: 100px; }

        /* ====================================================
           STYLE STRICT DE LA CARTE (PROVENANT DE CARDDETAILS)
           ==================================================== */
        .card-physical-container {
          padding: 30px; background: #f1f5f9; border-radius: 24px;
          display: flex; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          perspective: 1000px;
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
          width: 42px; height: 32px; z-index: 2; border-radius: 6px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          position: relative; border: 1px solid rgba(0,0,0,0.15); overflow: hidden;
        }
        .chip-line { position: absolute; background: rgba(0,0,0,0.2); }
        .horizontal-1 { width: 100%; height: 1px; top: 33%; }
        .horizontal-2 { width: 100%; height: 1px; top: 66%; }
        .vertical { height: 100%; width: 1px; left: 50%; }

        .card-bottom-row { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-label { font-size: 11px; font-weight: 800; color: white; letter-spacing: 1px; }

        .mc-symbol { display: flex; position: relative; width: 36px; height: 22px; }
        .circle { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        /* INFO CARTE META */
        .card-meta-simple { text-align: center; margin: 20px 0; }
        .card-meta-simple h2 { font-size: 22px; font-weight: 800; color: #1e293b; }
        .price-label { font-size: 20px; font-weight: 800; color: #005a64; margin-top: 5px; }
        .price-label span { font-size: 13px; color: #94a3b8; }

        /* BLOCS FORMULAIRE */
        .info-group { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 30px; margin-bottom: 25px; }
        .group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #005a64; border-bottom: 1px solid #f8fafc; padding-bottom: 15px; }
        .group-header h3 { font-size: 14px; font-weight: 800; text-transform: uppercase; }

        .info-flex-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .info-block label { display: block; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 5px; }
        .info-block p { font-size: 15px; font-weight: 700; color: #0f172a; }

        .address-display .addr-main { font-size: 18px; font-weight: 800; color: #0f172a; }
        .address-display .addr-sub { color: #64748b; font-size: 14px; margin-top: 4px; }
        .info-alert { display: flex; align-items: center; gap: 8px; background: #f0f9ff; padding: 12px; border-radius: 10px; color: #0369a1; font-size: 13px; margin-top: 20px; }

        .bper-textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; background: #fcfdfe; font-family: inherit; font-size: 14px; resize: none; transition: 0.2s; }
        .bper-textarea:focus { outline: none; border-color: #005a64; background: #fff; box-shadow: 0 0 0 4px rgba(0, 90, 100, 0.05); }

        .action-final-zone { margin-top: 30px; }
        .btn-confirm-order {
          width: 100%; background: #005a64; color: #fff; border: none; padding: 20px; border-radius: 15px; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; box-shadow: 0 10px 20px rgba(0, 90, 100, 0.15); transition: 0.3s;
        }
        .btn-confirm-order:hover { background: #00454d; transform: translateY(-2px); }
        .legal-info { font-size: 11px; color: #94a3b8; text-align: center; margin-bottom: 15px; line-height: 1.5; }

        /* SUMMARY ACC */
        .summary-card-account { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
        .val-bold { font-weight: 700; color: #0f172a; }
        .val-bold.mono { font-family: 'Roboto Mono', monospace; font-size: 11.5px; color: #005a64; }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 1000px) {
          .main-grid { grid-template-columns: 1fr; gap: 30px; }
          .sticky-wrapper { position: static; }
          .visual-sidebar { order: -1; }
          .info-flex-grid { grid-template-columns: 1fr; }
          .card-physical-container { padding: 20px; }
          .card-body { width: 100%; max-width: 300px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}