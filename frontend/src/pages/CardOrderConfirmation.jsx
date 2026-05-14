import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from "../services/api"; 
import { 
  ArrowLeft, ShieldCheck, Landmark, User, 
  MapPin, Wifi, ChevronRight, MessageSquare, Info
} from 'lucide-react';

import { generateCardNumber, generateExpiry, generateCVV } from '../utils/cardGenerator';


export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false); // État pour l'alerte

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      try {
        // 1. Charger les données du dashboard
        const res = await api("/client/dashboard");
        setDbData(res);

        // 2. Vérifier si une demande de carte existe déjà sur le serveur
        const checkCard = await api("/client/current-request", "GET");
        if (checkCard && checkCard.status) {
          setHasPendingRequest(true);
        }
      } catch (err) {
        
        console.log("Aucune demande en cours, accès autorisé.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- ÉCRAN D'ALERTE PROFESSIONNEL : DEMANDE DÉJÀ EN COURS ---
  if (hasPendingRequest) {
    return (
      <div className="bper-confirmation-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '48px 30px', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', maxWidth: '400px', width: '90%', margin: '20px', border: '1px solid #f1f5f9' }}>
          
          <div style={{ background: '#fff7ed', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Info size={32} color="#f97316" strokeWidth={2.5} />
          </div>

          <h2 style={{ color: '#0f172a', fontWeight: '900', fontSize: '22px', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Demande en cours
          </h2>

          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', fontWeight: '500' }}>
            Une demande est déjà associée à votre compte. Veuillez patienter jusqu'à la validation de celle-ci avant d'en soumettre une nouvelle.
          </p>

          <button 
            onClick={() => navigate("/dashboard")}
            style={{ 
              width: '100%', 
              background: '#005a64', 
              color: 'white', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '14px', 
              fontSize: '16px', 
              fontWeight: '900', 
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(0, 90, 100, 0.15)',
              transition: 'transform 0.2s ease'
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  if (!card) return null;
  if (loading) return <div className="bper-loading-state">Vérification de votre compte...</div>;

  

  const { user, account } = dbData;

  const handleFinalSubmit = async () => {
    if (hasPendingRequest) return;
  const expiry = generateExpiry();
  const cardData = {
    cardName: card.name,
    number: generateCardNumber(),
    expiry: `${expiry.month}/${expiry.year}`,
    cvv: generateCVV(),
    bg: card.bg,
    logoColor: card.logoColor,
    comment: comment
  };

  try {
    // SYNTAXE EXACTE POUR TON WRAPPER : URL, MÉTHODE, CORPS
    const response = await api("/client/request-card", "POST", cardData);

    if (response) {
      localStorage.setItem("pending_card_request", JSON.stringify({
        ...cardData,
        status: "En cours d'investigation"
      }));
      setIsSuccess(true);
    }
  } catch (err) {
    console.error("Erreur MongoDB:", err);
    alert("Impossible d'enregistrer la demande.");
  }
};

  if (isSuccess) {
    return (
      <div className="bper-confirmation-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '48px 30px', background: '#fff', borderRadius: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', maxWidth: '400px', width: '90%', margin: '20px', border: '1px solid #f1f5f9' }}>
          
          <div style={{ background: '#f0fdf4', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShieldCheck size={36} color="#059669" strokeWidth={2.5} />
          </div>

          <h2 style={{ color: '#0f172a', fontWeight: '900', fontSize: '22px', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Demande envoyée !
          </h2>

          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', fontWeight: '500' }}>
            Votre demande est en cours de traitement. Vous recevrez une validation après l'investigation des conditions de sécurité par nos services.
          </p>

          <button 
            onClick={() => navigate("/dashboard")}
            style={{ 
              width: '100%', 
              background: '#005a64', 
              color: 'white', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '14px', 
              fontSize: '16px', 
              fontWeight: '900', 
              letterSpacing: '1px',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(0, 90, 100, 0.15)',
              transition: 'transform 0.2s ease'
            }}
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bper-confirmation-screen">
      {/* HEADER FIXE */}
      <nav className="bper-top-nav">
        <div className="nav-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Retour</span>
          </button>
          <div className="security-badge">
            <ShieldCheck size={14} />
            <span>SÉCURISÉE</span>
          </div>
        </div>
      </nav>

      <main className="bper-content">
        <div className="layout-container">
          
          <header className="content-header">
            <h1>Validation de commande</h1>
            <p>Vérifiez vos informations de livraison pour votre carte <strong>{card.name}</strong>.</p>
          </header>

          <div className="main-grid">
            
            {/* COLONNE GAUCHE : LA CARTE (STRICT STYLE CARDDETAILS) */}
            <aside className="visual-sidebar">
              <div className="sticky-wrapper">
                
                {/* REPRODUCTION EXACTE DU CSS CARDDETAILS */}
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

                <div className="card-meta">
                  <h2>{card.name}</h2>
                  <p className="price">{card.price} <span>/ mois</span></p>
                </div>

                <div className="summary-card-account">
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
                    <span>Livraison par courrier recommandé sous 3 à 5 jours.</span>
                  </div>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MessageSquare size={18} />
                  <h3>Note supplémentaire</h3>
                </div>
                <textarea 
                  className="bper-input-text"
                  placeholder="Informations utiles pour le livreur ou votre conseiller..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="confirmation-footer">
                <p className="legal-box">
                  En confirmant, vous autorisez BPER Banca à émettre la carte et à appliquer les frais de gestion mensuels.
                </p>
                <button className="btn-submit-order" onClick={handleFinalSubmit}>
                  <span>Confirmer la commande</span>
                  <ChevronRight size={20} />
                </button>
              </div>

            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* STRUCTURE GLOBALE */
        .bper-confirmation-screen {
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }
        .layout-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .bper-loading-state { padding: 100px; text-align: center; font-weight: 600; color: #005a64; }

        /* NAVIGATION */
        .bper-top-nav { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 15px 0; position: sticky; top: 0; z-index: 100; }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
        .btn-back { background: none; border: none; color: #005a64; display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer; }
        .security-badge { display: flex; align-items: center; gap: 6px; color: #059669; background: #f0fdf4; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid #dcfce7; }

        /* HEADER */
        .content-header { padding: 30px 0; }
        .content-header h1 { font-size: 28px; color: #0f172a; font-weight: 800; margin-bottom: 8px; }
        .content-header p { color: #64748b; font-size: 15px; }

        /* GRID SYSTEM */
        .main-grid { display: grid; grid-template-columns: 400px 1fr; gap: 40px; padding-bottom: 60px; }
        .sticky-wrapper { position: sticky; top: 100px; }

        /* ====================================================
           REPRODUCTION STRICTE CSS CARTE (DEPUIS CARDDETAILS)
           ==================================================== */
        .card-perspective-wrapper { perspective: 1000px; margin-bottom: 20px; }
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
          padding: 30px; background: #f8fafc; border-radius: 24px;
          display: flex; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.02);
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
          width: 42px; height: 32px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
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

        /* META TEXT */
        .card-meta { text-align: center; margin: 20px 0; }
        .card-meta h2 { font-size: 22px; font-weight: 800; color: #1e293b; }
        .price { font-size: 24px; font-weight: 800; color: #005a64; margin-top: 5px; }
        .price span { font-size: 14px; color: #94a3b8; }

        /* FORM BLOCS */
        .info-group { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 20px; }
        .group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #005a64; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .group-header h3 { font-size: 13px; font-weight: 800; text-transform: uppercase; }

        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .info-item label { display: block; font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; }
        .info-item p { font-size: 14px; color: #1e293b; font-weight: 700; }

        .address-box .main-address { font-size: 16px; font-weight: 700; color: #1e293b; }
        .address-box .sub-address { color: #64748b; font-size: 14px; }
        .delivery-notice { display: flex; align-items: center; gap: 8px; margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 8px; font-size: 12px; color: #64748b; }

        .bper-input-text { width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 12px; font-family: inherit; resize: none; font-size: 14px; }
        .bper-input-text:focus { border-color: #005a64; outline: none; background: #fff; }

        .btn-submit-order { width: 100%; background: #005a64; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 800; font-size: 16px; display: flex; justify-content: center; align-items: center; gap: 10px; cursor: pointer; box-shadow: 0 10px 15px rgba(0, 90, 100, 0.1); }

        .summary-card-account { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 12px; margin-top: 8px; }
        .mono { font-family: 'Roboto Mono', monospace; font-size: 11px; color: #005a64; }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 1000px) {
          .main-grid { grid-template-columns: 1fr; gap: 20px; }
          .sticky-wrapper { position: static; }
          .info-grid { grid-template-columns: 1fr; }
          .card-body { width: 100%; max-width: 310px; margin: 0 auto; }
          .visual-sidebar { order: -1; }
          .content-header h1 { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}