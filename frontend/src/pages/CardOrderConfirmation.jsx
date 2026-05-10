import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// IMPORTE TON SERVICE API EXISTANT ICI
import { api } from "../services/api"; 

import { 
  ArrowLeft, ShieldCheck, Landmark, User, 
  MapPin, Send, Wifi, ChevronRight, AlertTriangle 
} from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  // États pour les données RÉELLES
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // RÉCUPÉRATION DES VRAIES INFOS VIA TON SERVICE API
    const fetchRealData = async () => {
  try {
    // Utilisation du chemin exact défini dans tes routes : /client/dashboard
    const responseData = await api("/client/dashboard");
    setDbData(responseData);
  } catch (err) {
    console.error("Erreur récupération données confirmation:", err);
    setError("Une erreur technique est survenue lors de la sécurisation de votre demande.");
  } finally {
    setLoading(false);
  }
};

    fetchRealData();
  }, [navigate]);

  if (!card) return null; // Redirection si on arrive ici sans carte sélectionnée

  // ÉCRANS DE CHARGEMENT ET D'ERREUR BPER PRO
  if (loading) {
    return (
      <div className="bper-order-page flex-center">
        <div className="status-screen">
          <div className="bper-spinner"></div>
          <p>Initialisation du protocole de demande sécurisé BPER Banca...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bper-order-page flex-center">
        <div className="status-screen error">
          <AlertTriangle size={48} />
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  // ALIAS POUR UNE LECTURE PLUS FACILE (Mappage direct sur User.js et Account.js)
  const realUser = dbData.user;       
  const realAccount = dbData.account; 

  return (
    <div className="bper-order-page">
      {/* HEADER NAVIGATION FIXE */}
      <header className="order-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Annuler la commande</span>
        </button>
        <div className="security-tag">
          <ShieldCheck size={16} />
          <span>Cryptage SSL BPER Banca actif</span>
        </div>
      </header>

      <main className="order-main-content">
        <div className="content-container">
          
          <section className="page-intro">
            <h1>Confirmation de votre commande</h1>
            <p>Conformément aux réglementations bancaires, veuillez vérifier l'exactitude des informations ci-dessous.</p>
          </section>

          <div className="order-grid">
            
            {/* COLONNE GAUCHE (CARTE & COMPTE) */}
            <div className="left-column">
              
              {/* LA CARTE (STYLE STRICT CARDDETAILS) */}
              <div className="card-summary-box">
                <div className="card-visual-wrapper">
                  <div className="card-body-strict" style={{ background: card.bg }}>
                    <div className="card-gloss"></div>
                    <div className="card-top">
                      <div className="bper-logo" style={{ color: card.logoColor }}>
                        BPER<span>:</span> <small>Banca</small>
                      </div>
                      <Wifi size={20} className="nfc-icon" />
                    </div>
                    <div className="emv-chip">
                      <div className="chip-line-h1"></div>
                      <div className="chip-line-h2"></div>
                      <div className="chip-line-v"></div>
                    </div>
                    <div className="card-bottom">
                      <div className="card-label">{card.type}</div>
                      <div className="mc-symbol">
                        <div className="circle red"></div>
                        <div className="circle yellow"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-specs">
                  <h3>{card.name}</h3>
                  <p className="price-main">{card.price} <span>/ mois</span></p>
                </div>
              </div>

              {/* INFOS COMPTE (ACCOUNT.JS RÉEL DE LA DB) */}
              <div className="info-block account-block">
                <div className="block-title">
                  <Landmark size={18} />
                  <h2>Compte de prélèvement</h2>
                </div>
                <div className="data-row">
                  <span className="label">Numéro de compte</span>
                  <span className="value">{realAccount.accountNumber}</span>
                </div>
                <div className="data-row iban-row">
                  <span className="label">IBAN</span>
                  <span className="value iban-style">{realAccount.iban}</span>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE (USER & ADRESSE) */}
            <div className="right-column">
              
              {/* INFOS PERSONNELLES (USER.JS RÉEL DE LA DB) */}
              <div className="info-block">
                <div className="block-title">
                  <User size={18} />
                  <h2>Titulaire de la carte</h2>
                </div>
                <div className="data-row titular-row">
                  <span className="label">Nom complet</span>
                  {/* Récupère civilite, nom, prenom réels du schéma Mongoose */}
                  <span className="value">{realUser.civilite} {realUser.nom} {realUser.prenom}</span>
                </div>
                <div className="data-row">
                  <span className="label">Identifiant Client (Email)</span>
                  <span className="value email-value">{realUser.email}</span>
                </div>
                <div className="data-row">
                  <span className="label">Numéro de téléphone lié</span>
                  <span className="value">{realUser.telephone}</span>
                </div>
              </div>

              {/* ADRESSE (USER.JS RÉEL DE LA DB) */}
              <div className="info-block">
                <div className="block-title">
                  <MapPin size={18} />
                  <h2>Adresse d'expédition</h2>
                </div>
                <p className="address-display">
                  {/* Récupère adresse, codePostal, ville, pays réels du schéma Mongoose */}
                  {realUser.adresse}<br />
                  {realUser.codePostal}, {realUser.ville}<br />
                  {realUser.pays}
                </p>
                <div className="info-note">
                  La carte sera expédiée sous 3 jours ouvrés par courrier recommandé.
                </div>
              </div>

              {/* ACTION FINALE SÉCURISÉE */}
              <div className="final-action-card">
                <p className="terms-text">
                  En validant cette demande, vous certifiez l'exactitude des données ci-dessus 
                  et autorisez BPER Banca à émettre la carte {card.name} associée au compte cité ci-contre.
                </p>
                <button className="bper-submit-btn">
                  <span>Confirmer et Envoyer la demande</span>
                  <ChevronRight size={20} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        /* LAYOUT GLOBAL CORPORATE */
        .bper-order-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1e293b;
          padding-bottom: 60px;
        }

        .flex-center { display: flex; align-items: center; justify-content: center; }

        .content-container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* HEADER FIXE PROFESSIONNEL BPER */
        .order-header {
          background: #fff;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #005a64;
          font-weight: 700; cursor: pointer; font-size: 14px;
        }

        .security-tag {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; color: #059669; font-weight: 600;
          background: #ecfdf5; padding: 6px 12px; border-radius: 20px;
          border: 1px solid #d1fae5;
        }

        /* ÉCRANS DE STATUT */
        .status-screen {
          text-align: center; color: #64748b;
          display: flex; flex-direction: column; align-items: center; gap: 15px;
        }
        .bper-spinner {
          width: 35px; height: 35px; border: 3px solid #f3f3f3;
          border-top: 3px solid #005a64; border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .status-screen.error { color: #ef4444; }
        .status-screen.error button {
          background: #ef4444; color: white; border: none;
          padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px;
        }

        /* INTRO PAGE */
        .page-intro { padding: 48px 0; text-align: left; }
        .page-intro h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 10px; letter-spacing: -0.5px; }
        .page-intro p { color: #64748b; font-size: 15px; line-height: 1.5; max-width: 700px; }

        /* GRID SYSTEM (DESKTOP) */
        .order-grid {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 32px;
          align-items: start;
        }

        /* BLOCS D'INFORMATION ÉPURÉS CORPORATE */
        .info-block {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.01);
        }

        .block-title {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px; color: #005a64;
          border-bottom: 1px solid #f1f5f9; padding-bottom: 14px;
        }

        .block-title h2 { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.75px; }

        .data-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0; border-bottom: 1px solid #f1f5f9; gap: 15px;
        }
        .data-row:last-child { border-bottom: none; }

        .label { color: #64748b; font-size: 13px; flex-shrink: 0; font-weight: 500; }
        .value { color: #1e293b; font-weight: 600; font-size: 14px; text-align: right; }
        .iban-style { font-family: 'Roboto Mono', 'Courier New', monospace; color: #005a64; letter-spacing: -0.5px; font-size: 12.5px; }
        .email-value { word-break: break-all; } /* Empêche le débordement d'un email long */

        /* CARTE VISUELLE (STYLE STRICT CARDDETAILS) */
        .card-summary-box {
          background: linear-gradient(135deg, #005a64 0%, #003d44 100%);
          border-radius: 20px; padding: 28px; margin-bottom: 24px;
          color: white; text-align: center;
          box-shadow: 0 10px 20px rgba(0, 90, 100, 0.1);
        }

        .card-visual-wrapper { display: flex; justify-content: center; margin-bottom: 24px; }

        .card-body-strict {
          width: 290px; aspect-ratio: 1.58/1; border-radius: 12px;
          position: relative; padding: 18px; overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.35);
          display: flex; flex-direction: column; justify-content: space-between;
        }

        .card-gloss {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 60%);
        }

        .card-top { display: flex; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 18px; text-align: left; }
        .bper-logo span { color: #a3e635; }
        .nfc-icon { color: white; transform: rotate(90deg); margin-left: auto; opacity: 0.9; }

        .emv-chip {
          width: 40px; height: 30px; background: #eab308; border-radius: 4px;
          position: relative; margin-top: 10px; z-index: 2;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .chip-line-h1, .chip-line-h2 { position: absolute; background: rgba(0,0,0,0.15); width: 100%; height: 1px; }
        .chip-line-h1 { top: 33%; } .chip-line-h2 { top: 66%; }
        .chip-line-v { position: absolute; background: rgba(0,0,0,0.15); height: 100%; width: 1px; left: 50%; }

        .card-bottom { display: flex; justify-content: space-between; align-items: flex-end; z-index: 2; }
        .card-label { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
        
        .mc-symbol { display: flex; position: relative; width: 35px; height: 20px; }
        .circle { width: 20px; height: 20px; border-radius: 50%; position: absolute; }
        .red { background: #eb001b; left: 0; }
        .yellow { background: #ff5f00; right: 0; opacity: 0.9; }

        .card-specs h3 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
        .price-main { font-size: 22px; font-weight: 800; color: #a3e635; }
        .price-main span { font-size: 12px; opacity: 0.8; }

        /* ADRESSE ET NOTES */
        .address-display { font-size: 14px; color: #1e293b; line-height: 1.7; font-weight: 600; margin-bottom: 20px; }
        .info-note { font-size: 12px; color: #64748b; background: #f8fafc; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }

        /* ACTION FINALE SÉCURISÉE BPER */
        .final-action-card { background: #fff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .terms-text { font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 20px; }

        .bper-submit-btn {
          width: 100%; background: linear-gradient(135deg, #005a64 0%, #00454d 100%);
          color: white; border: none; padding: 16px; border-radius: 10px;
          font-weight: 700; font-size: 16px; cursor: pointer;
          display: flex; justify-content: center; align-items: center; gap: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 8px 20px rgba(0, 90, 100, 0.15);
        }

        .bper-submit-btn:hover { background: #00454d; transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 90, 100, 0.2); }

        /* RESPONSIVE MEDIA QUERIES CORPORATE */
        @media (max-width: 1024px) {
          .order-grid { grid-template-columns: 1fr; gap: 24px; }
          .back-btn span { display: none; } /* Cache le texte du bouton retour sur tablette/mobile */
          .page-intro { padding: 32px 0; }
          .content-container { padding: 0 16px; }
        }

        @media (max-width: 640px) {
          .order-header { padding: 10px 16px; }
          .page-intro h1 { font-size: 22px; }
          .page-intro p { font-size: 14px; }
          .info-block { padding: 16px; border-radius: 10px; }
          .data-row { flex-direction: column; align-items: flex-start; gap: 4px; padding: 10px 0; }
          .value { text-align: left; }
          .iban-row { display: block; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; } /* Autorise le scroll de l'IBAN si trop long */
          .iban-style { font-size: 11.5px; display: inline-block; padding-bottom: 4px; }
          .titular-row { flex-direction: row; align-items: center; justify-content: space-between; gap: 15px; } /* Garde civilite et nom sur la même ligne */
          .titular-row .value { text-align: right; }
          .card-summary-box { padding: 20px; border-radius: 16px; }
          .card-body-strict { width: 100%; max-width: 270px; }
          .card-perspective-wrapper { display: flex; justify-content: center; }
          .card-visual-wrapper { margin-bottom: 18px; }
        }
      `}</style>
    </div>
  );
}