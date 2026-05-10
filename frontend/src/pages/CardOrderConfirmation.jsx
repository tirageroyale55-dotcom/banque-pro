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
        // Utilisation du endpoint validé
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
  if (loading) return <div className="bper-loading-state">Vérification de sécurité...</div>;

  const { user, account } = dbData;

  const handleFinalSubmit = async () => {
    // Logique d'envoi ici
    alert("Demande envoyée !");
    navigate("/dashboard");
  };

  return (
    <div className="order-page-main">
      <nav className="order-nav">
        <div className="nav-inner">
          <button className="btn-back-action" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Retour</span>
          </button>
          <div className="badge-ssl">
            <ShieldCheck size={14} />
            <span>SÉCURISÉ</span>
          </div>
        </div>
      </nav>

      <main className="order-content">
        <div className="order-container">
          
          <header className="order-header-text">
            <h1>Confirmation de commande</h1>
            <p>Veuillez valider les détails de votre nouvelle carte <strong>{card.name}</strong>.</p>
          </header>

          <div className="order-grid-layout">
            
            {/* COLONNE GAUCHE : LA CARTE (STYLE STRICT CARDDETAILS) */}
            <aside className="order-visual-sidebar">
              <div className="sticky-box">
                <div className="card-preview-container">
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
                  
                  <div className="card-meta-info">
                    <h2>{card.name}</h2>
                    <p className="price-tag">{card.price} <span>/ mois</span></p>
                  </div>
                </div>

                <div className="account-summary-box">
                  <div className="summary-head"><Landmark size={16}/> Compte associé</div>
                  <div className="summary-line">
                    <span className="label-text">Compte</span>
                    <span className="value-text">{account.accountNumber}</span>
                  </div>
                  <div className="summary-line">
                    <span className="label-text">IBAN</span>
                    <span className="value-text iban-mono">{account.iban}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* COLONNE DROITE : FORMULAIRE ET INFOS */}
            <section className="order-form-area">
              
              <div className="data-section">
                <div className="section-title">
                  <User size={18} />
                  <h3>Titulaire de la carte</h3>
                </div>
                <div className="info-fields">
                  <div className="field">
                    <label>Nom complet</label>
                    <p>{user.civilite} {user.nom} {user.prenom}</p>
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="field">
                    <label>Téléphone</label>
                    <p>{user.telephone}</p>
                  </div>
                </div>
              </div>

              <div className="data-section">
                <div className="section-title">
                  <MapPin size={18} />
                  <h3>Adresse de livraison</h3>
                </div>
                <div className="address-display-box">
                  <p className="primary-addr">{user.adresse}</p>
                  <p className="secondary-addr">{user.codePostal} {user.ville}, {user.pays}</p>
                  <div className="shipping-info">
                    <Info size={14} />
                    <span>Livraison sécurisée sous 3 à 5 jours.</span>
                  </div>
                </div>
              </div>

              <div className="data-section">
                <div className="section-title">
                  <MessageSquare size={18} />
                  <h3>Note complémentaire</h3>
                </div>
                <textarea 
                  className="bper-textarea"
                  placeholder="Ajoutez une information utile pour la livraison..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="final-submit-container">
                <p className="legal-small">
                  En validant, vous acceptez les frais de tenue de compte liés à la carte {card.name}.
                </p>
                <button className="btn-confirm-final" onClick={handleFinalSubmit}>
                  <span>Confirmer la commande</span>
                  <ChevronRight size={20} />
                </button>
              </div>

            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        .order-page-main { background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .order-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        .bper-loading-state { padding: 100px; text-align: center; color: #64748b; }

        /* NAV */
        .order-nav { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 15px 0; position: sticky; top: 0; z-index: 100; }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .btn-back-action { background: none; border: none; color: #005a64; display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer; }
        .badge-ssl { display: flex; align-items: center; gap: 6px; color: #059669; font-size: 11px; font-weight: 800; border: 1px solid #dcfce7; background: #f0fdf4; padding: 5px 12px; border-radius: 4px; }

        /* HEADER */
        .order-header-text { padding: 40px 0; }
        .order-header-text h1 { font-size: 28px; font-weight: 800; color: #1e293b; }
        .order-header-text p { color: #64748b; margin-top: 5px; }

        /* GRID */
        .order-grid-layout { display: grid; grid-template-columns: 380px 1fr; gap: 40px; }

        /* ==========================================
           STYLE STRICT DE LA CARTE (DE CARDDETAILS)
           ========================================== */
        .card-preview-container {
          background: #f8fafc; border: 1px solid #e2e8f0; 
          border-radius: 24px; padding: 30px; text-align: center; margin-bottom: 20px;
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
        .card-physical-container { display: flex; justify-content: center; }
        .card-body {
          width: 280px; aspect-ratio: 1.58 / 1; border-radius: 14px;
          position: relative; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
        }
        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }
        .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 20px; letter-spacing: -0.5px; text-align: left; }
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

        .card-meta-info { margin-top: 20px; }
        .card-meta-info h2 { font-size: 22px; font-weight: 800; color: #1e293b; }
        .price-tag { font-size: 24px; font-weight: 800; color: #005a64; margin-top: 5px; }
        .price-tag span { font-size: 14px; color: #94a3b8; }

        /* INFOS */
        .data-section { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 20px; }
        .section-title { display: flex; align-items: center; gap: 10px; color: #005a64; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .section-title h3 { font-size: 14px; font-weight: 800; text-transform: uppercase; }
        .info-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 4px; display: block; }
        .field p { font-size: 15px; font-weight: 700; color: #1e293b; }
        .address-display-box .primary-addr { font-size: 18px; font-weight: 700; color: #1e293b; }
        .address-display-box .secondary-addr { color: #64748b; margin-top: 4px; }
        .shipping-info { display: flex; align-items: center; gap: 8px; margin-top: 15px; font-size: 12px; color: #64748b; background: #f8fafc; padding: 10px; border-radius: 8px; }
        .bper-textarea { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; font-family: inherit; resize: none; }
        .bper-textarea:focus { outline: none; border-color: #005a64; background: #fff; }

        .account-summary-box { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
        .summary-head { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; color: #005a64; margin-bottom: 12px; }
        .summary-line { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
        .iban-mono { font-family: 'Roboto Mono', monospace; color: #005a64; font-size: 11px; }

        .final-submit-container { margin-top: 30px; }
        .btn-confirm-final { width: 100%; background: #005a64; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; box-shadow: 0 10px 20px rgba(0,90,100,0.15); }
        .legal-small { font-size: 11px; color: #94a3b8; margin-bottom: 15px; line-height: 1.4; }

        @media (max-width: 1000px) {
          .order-grid-layout { grid-template-columns: 1fr; }
          .sticky-box { position: static; }
          .info-fields { grid-template-columns: 1fr; }
          .order-visual-sidebar { order: -1; }
        }
      `}</style>
    </div>
  );
}