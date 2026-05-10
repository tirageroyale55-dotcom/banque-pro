import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from "../services/api"; // Ton service sécurisé

import { 
  ArrowLeft, ShieldCheck, Landmark, User, 
  MapPin, Send, Wifi, ChevronRight, AlertTriangle, MessageSquare
} from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState(""); // État pour le formulaire supplémentaire

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchRealData = async () => {
      try {
        // Utilisation du chemin exact validé : /client/dashboard
        const responseData = await api("/client/dashboard");
        setDbData(responseData);
      } catch (err) {
        console.error("Erreur Backend BPER:", err);
        setError("Échec de la connexion sécurisée aux données bancaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    // Ici tu lanceras ton api("/client/order-card", { cardId: card.id, note: comment })
    alert("Demande envoyée avec succès ! Votre conseiller BPER vous contactera sous peu.");
    navigate("/dashboard");
  };

  if (!card) return null;
  if (loading) return <div className="bper-loader">Vérification des accès au serveur central...</div>;

  const realUser = dbData.user;       
  const realAccount = dbData.account; 

  return (
    <div className="order-page-corporate">
      {/* HEADER DE NAVIGATION SÉCURISÉ */}
      <header className="bper-nav-header">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Modifier mon choix</span>
        </button>
        <div className="ssl-badge">
          <ShieldCheck size={16} />
          <span>CRYPTAGE BANCAIRE SSL ACTIF</span>
        </div>
      </header>

      <main className="order-main-view">
        <div className="container-pro">
          
          <div className="page-head">
            <h1>Validation de commande</h1>
            <p>Vérifiez vos informations et personnalisez votre demande si nécessaire.</p>
          </div>

          <div className="order-layout-grid">
            
            {/* --- COLONNE GAUCHE : VISUEL CARTE & COMPTE --- */}
            <div className="sticky-column">
              
              {/* LA CARTE (STRUCTURE ET ANIMATION EXACTE DE CARDDETAILS.JSX) */}
              <div className="card-visual-section">
                <div className="card-perspective-wrapper">
                  <div className="card-floating-animation">
                    <div className="card-physical-container">
                      <div className="card-body" style={{ background: card.bg }}>
                        <div className="card-gloss"></div>
                        <div className="card-top-row">
                          <div className="bper-logo" style={{ color: card.logoColor }}>
                            BPER<span>:</span> <small>Banca</small>
                          </div>
                          <Wifi size={20} className="nfc-icon" />
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
                <div className="card-info-summary">
                  <h2>{card.name}</h2>
                  <div className="price-tag">{card.price} <span>/ mois</span></div>
                </div>
              </div>

              {/* INFOS COMPTE RÉELLES */}
              <div className="data-card account-card">
                <div className="title-row">
                  <Landmark size={18} />
                  <h3>Compte lié</h3>
                </div>
                <div className="detail-line">
                  <span className="lbl">Numéro de compte</span>
                  <span className="val">{realAccount.accountNumber}</span>
                </div>
                <div className="detail-line iban-line">
                  <span className="lbl">IBAN</span>
                  <span className="val mono">{realAccount.iban}</span>
                </div>
              </div>
            </div>

            {/* --- COLONNE DROITE : FORMULAIRE ET USER --- */}
            <div className="scroll-column">
              
              {/* INFOS TITULAIRE RÉELLES (USER.JS) */}
              <div className="data-card">
                <div className="title-row">
                  <User size={18} />
                  <h3>Coordonnées du titulaire</h3>
                </div>
                <div className="detail-line">
                  <span className="lbl">Identité</span>
                  <span className="val">{realUser.civilite} {realUser.nom} {realUser.prenom}</span>
                </div>
                <div className="detail-line">
                  <span className="lbl">Email client</span>
                  <span className="val">{realUser.email}</span>
                </div>
                <div className="detail-line">
                  <span className="lbl">Téléphone</span>
                  <span className="val">{realUser.telephone}</span>
                </div>
              </div>

              {/* ADRESSE DE LIVRAISON RÉELLE (USER.JS) */}
              <div className="data-card">
                <div className="title-row">
                  <MapPin size={18} />
                  <h3>Adresse d'expédition</h3>
                </div>
                <p className="full-address">
                  {realUser.adresse}<br />
                  {realUser.codePostal} {realUser.ville}, {realUser.pays}
                </p>
              </div>

              {/* FORMULAIRE SUPPLÉMENTAIRE (NEW) */}
              <div className="data-card comment-card">
                <div className="title-row">
                  <MessageSquare size={18} />
                  <h3>Informations complémentaires</h3>
                </div>
                <p className="form-tip">Une demande spécifique ? Précisez-la ci-dessous.</p>
                <textarea 
                  className="bper-textarea"
                  placeholder="Ex: Je souhaite que la carte soit livrée en agence..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                ></textarea>
              </div>

              {/* ACTION FINALE */}
              <div className="order-action-box">
                <p className="legal-notice">
                  En confirmant, vous autorisez BPER Banca à débiter les frais mensuels de {card.price} 
                  sur votre compte {realAccount.accountNumber}.
                </p>
                <button className="btn-confirm-final" onClick={handleFinalSubmit}>
                  <span>Confirmer l'envoi de la demande</span>
                  <ChevronRight size={20} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .order-page-corporate {
          background: #f1f5f9; min-height: 100vh;
          font-family: 'Inter', sans-serif; color: #1e293b;
        }

        .container-pro { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .bper-loader { padding: 100px; text-align: center; color: #64748b; font-weight: 600; }

        /* HEADER */
        .bper-nav-header {
          background: #fff; padding: 14px 24px; display: flex;
          justify-content: space-between; align-items: center;
          border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100;
        }
        .back-link {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #005a64;
          font-weight: 700; cursor: pointer; font-size: 14px;
        }
        .ssl-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: #059669; font-weight: 800;
          background: #ecfdf5; padding: 6px 12px; border-radius: 4px;
          border: 1px solid #d1fae5;
        }

        /* PAGE INTRO */
        .page-head { padding: 40px 0; }
        .page-head h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 5px; }
        .page-head p { color: #64748b; font-size: 15px; }

        /* GRID SYSTEM (DESKTOP) */
        .order-layout-grid {
          display: grid; grid-template-columns: 420px 1fr;
          gap: 40px; align-items: start;
        }

        /* CARTE & ANIMATION (COPIE CONFORME CARDDETAILS) */
        .card-visual-section {
          background: #005a64; border-radius: 20px;
          padding: 30px; text-align: center; color: white;
          margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0, 90, 100, 0.2);
        }
        .card-perspective-wrapper { perspective: 1000px; margin-bottom: 20px; }
        .card-floating-animation {
          animation: cardFloat 5s ease-in-out infinite; transform-style: preserve-3d;
        }
        @keyframes cardFloat {
          0%, 100% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); }
          50% { transform: rotateY(5deg) rotateX(-4deg) translateY(-8px); }
        }
        .card-physical-container {
          padding: 20px; background: rgba(255,255,255,0.1); border-radius: 20px;
          display: inline-block;
        }
        .card-body {
          width: 290px; aspect-ratio: 1.58 / 1; border-radius: 12px;
          position: relative; padding: 20px; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%);
        }
        .card-top-row { display: flex; justify-content: space-between; align-items: center; }
        .bper-logo { font-weight: 900; font-size: 18px; }
        .bper-logo span { color: #a3e635; }
        .nfc-icon { color: white; transform: rotate(90deg); }
        .emv-chip {
          width: 40px; height: 30px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border-radius: 4px; position: relative; border: 1px solid rgba(0,0,0,0.1);
        }
        .mc-symbol { display: flex; position: relative; width: 35px; height: 20px; }
        .circle { width: 20px; height: 20px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }
        
        .card-info-summary h2 { font-size: 22px; font-weight: 700; }
        .price-tag { font-size: 24px; font-weight: 800; color: #a3e635; }
        .price-tag span { font-size: 14px; opacity: 0.8; }

        /* BLOCS DE DONNÉES */
        .data-card {
          background: white; border: 1px solid #e2e8f0;
          border-radius: 16px; padding: 25px; margin-bottom: 20px;
        }
        .title-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px; color: #005a64;
          border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;
        }
        .title-row h3 { font-size: 14px; font-weight: 800; text-transform: uppercase; }

        .detail-line { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dotted #f1f5f9; }
        .detail-line:last-child { border-bottom: none; }
        .lbl { color: #64748b; font-size: 13px; }
        .val { color: #1e293b; font-weight: 700; font-size: 14px; }
        .val.mono { font-family: 'Roboto Mono', monospace; font-size: 12px; color: #005a64; }

        .full-address { line-height: 1.6; font-weight: 600; color: #1e293b; font-size: 14px; }

        /* TEXTAREA FORMULAIRE */
        .form-tip { font-size: 12px; color: #64748b; margin-bottom: 15px; }
        .bper-textarea {
          width: 100%; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 15px; font-family: inherit; font-size: 14px;
          resize: none; transition: 0.3s;
        }
        .bper-textarea:focus { outline: none; border-color: #005a64; box-shadow: 0 0 0 3px rgba(0, 90, 100, 0.1); }

        /* ACTION FINALE */
        .order-action-box { padding: 0 10px; }
        .legal-notice { font-size: 11px; color: #94a3b8; line-height: 1.5; margin-bottom: 25px; }
        .btn-confirm-final {
          width: 100%; background: #005a64; color: white; border: none;
          padding: 18px; border-radius: 12px; font-weight: 800; font-size: 16px;
          cursor: pointer; display: flex; justify-content: center; align-items: center;
          gap: 12px; transition: 0.3s;
          box-shadow: 0 10px 25px rgba(0, 90, 100, 0.2);
        }
        .btn-confirm-final:hover { background: #00454d; transform: translateY(-2px); }

        /* RESPONSIVE */
        @media (max-width: 1000px) {
          .order-layout-grid { grid-template-columns: 1fr; gap: 30px; }
          .container-pro { padding: 0 16px; }
          .card-perspective-wrapper { display: flex; justify-content: center; }
          .detail-line { flex-direction: column; gap: 4px; }
          .val { text-align: left; }
          .iban-line { overflow-x: auto; white-space: nowrap; }
        }
      `}</style>
    </div>
  );
}