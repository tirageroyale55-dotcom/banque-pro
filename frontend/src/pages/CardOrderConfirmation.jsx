import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, UserCheck, Banknote, ShieldCheck, Wifi, Mail } from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  const [userData, setUserData] = useState(null);
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulation de récupération de données DB (Structures User.js et Account.js)
    const fetchDbData = async () => {
      try {
        setUserData({
          prenom: "Jean",
          nom: "Dupont",
          email: "jean.dupont@email.com",
          adresse: "15 Rue de la Banque",
          ville: "Paris",
          codePostal: "75002"
        });
        
        setAccountData({
          iban: "IT76 L 05387 12345 000000123456",
          accountNumber: "000000123456"
        });
      } catch (err) {
        console.error("Erreur sécurité", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDbData();
  }, []);

  if (!card) return <div className="p-10">Erreur de session sécurisée.</div>;
  if (loading) return <div className="p-10 text-center text-teal">Authentification en cours...</div>;

  return (
    <div className="bper-order-page">
      
      {/* BARRE DE NAVIGATION SUPÉRIEURE (STYLE BANCAIRE) */}
      <header className="bper-header-bar">
        <div className="header-inner">
          <button className="bper-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Catalogue</span>
          </button>
          <div className="bper-logo-center">
            BPER<span>:</span> <small>Banca</small>
          </div>
          <div className="secure-badge">
            <ShieldCheck size={16} /> SECURE
          </div>
        </div>
      </header>

      <main className="bper-main-content">
        <div className="content-container">
          
          <div className="page-intro">
            <h1>Validation de la Demande</h1>
            <p>Veuillez confirmer les informations ci-dessous pour finaliser votre commande de carte bancaire.</p>
          </div>

          <div className="confirmation-layout">
            
            {/* SECTION CARTE (PRÉSENTATION INSTITUTIONNELLE) */}
            <aside className="card-summary-aside">
              <div className="sticky-card-box">
                <div className="institution-card-presenter">
                  {/* STYLE CARTE EXACT REPRODUIT (Fixe pour Pro) */}
                  <div className="card-body-strict" style={{ background: card.bg }}>
                    <div className="card-gloss-light"></div>
                    
                    <div className="card-row-t">
                      <div className="card-logo-w" style={{ color: card.logoColor }}>
                        BPER<span>:</span> <small>Banca</small>
                      </div>
                      <Wifi size={20} className="nfc-w" strokeWidth={1.5} />
                    </div>

                    <div className="chip-w"></div>

                    <div className="card-row-b">
                      <div className="card-type-w">{card.type}</div>
                      <div className="mc-symbol-w">
                        <div className="c-w r-w"></div>
                        <div className="c-w y-w"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-info-text">
                  <h2>{card.name}</h2>
                  <p className="price-tag">{card.price} € / mois</p>
                  <p className="fee-mention">Frais de tenue de compte inclus.</p>
                </div>
              </div>
            </aside>

            {/* SECTION FORMULAIRE ET DONNÉES (GRILLE PRO) */}
            <section className="form-data-section">
              
              <div className="bper-data-panel">
                <h3><UserCheck size={18} /> Identification du Titulaire</h3>
                <div className="data-row">
                  <span className="data-label">Nom</span>
                  <span className="data-value">{userData.nom.toUpperCase()}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Prénom</span>
                  <span className="data-value">{userData.prenom}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Email rattaché</span>
                  <span className="data-value">{userData.email}</span>
                </div>
              </div>

              <div className="bper-data-panel">
                <h3><Mail size={18} /> Adresse de Livraison</h3>
                <p className="data-text">{userData.adresse}, {userData.codePostal} {userData.ville}</p>
                <span className="help-text">La carte sera envoyée à l'adresse de résidence connue par BPER Banca.</span>
              </div>

              <div className="bper-data-panel">
                <h3><Banknote size={18} /> Compte Associé</h3>
                <div className="data-row iban-row">
                  <span className="data-label">IBAN</span>
                  <span className="data-value mono">{accountData.iban}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">Numéro de compte BPER</span>
                  <span className="data-value">{accountData.accountNumber}</span>
                </div>
              </div>

              {/* Formulaire & Action */}
              <form className="bper-final-form">
                <div className="bper-input-group">
                  <label htmlFor="comments"><FileText size={16} /> Notes ou précisions (optionnel)</label>
                  <textarea id="comments" rows="3" placeholder="Ajouter une instruction pour le conseiller..."></textarea>
                </div>
                
                <div className="consent-check">
                  <input type="checkbox" id="consent" required />
                  <label htmlFor="consent">Je confirme avoir pris connaissance des conditions contractuelles liées à cette carte.</label>
                </div>

                <button type="submit" className="bper-submit-btn">
                  CONFIRMER ET ENVOYER LA DEMANDE
                </button>
              </form>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER BANCAIRE */}
      <footer className="bper-footer">
        <div className="footer-inner">
          <p>© 2024 BPER Banca S.p.A. - Tous droits réservés.</p>
          <p>La sécurité est notre priorité.</p>
        </div>
      </footer>

      <style jsx>{`
        /* --- STYLES GLOBAUX & TYPO --- */
        .bper-order-page {
          background: #f1f4f6; /* Gris bancaire très clair */
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1a202c; /* Presque noir */
        }

        /* --- HEADER --- */
        .bper-header-bar {
          background: #fff;
          border-bottom: 1px solid #e2e8f0;
          padding: 15px 30px;
          position: sticky; top: 0; z-index: 100;
        }

        .header-inner {
          max-width: 1300px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
        }

        .bper-back-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: none; color: #005a64; font-weight: 700; cursor: pointer;
        }

        .bper-logo-center { font-weight: 900; font-size: 20px; text-transform: uppercase; }
        .bper-logo-center span { color: #a3e635; }
        .bper-logo-center small { font-size: 10px; font-weight: 400; text-transform: none; color: #64748b; }

        .secure-badge {
          background: #ecfdf5; color: #10b981;
          padding: 5px 12px; border-radius: 20px; font-weight: 800; font-size: 11px;
          display: flex; align-items: center; gap: 5px; border: 1px solid #a7f3d0;
        }

        /* --- MAIN CONTENT & LAYOUT --- */
        .bper-main-content { padding: 50px 20px; }
        .content-container { max-width: 1200px; margin: 0 auto; }

        .page-intro { text-align: center; margin-bottom: 50px; max-width: 600px; margin-left: auto; margin-right: auto; }
        .page-intro h1 { color: #1a202c; font-size: 36px; font-weight: 900; }
        .page-intro p { color: #64748b; margin-top: 10px; font-size: 16px; }

        .confirmation-layout {
          display: grid;
          grid-template-columns: 350px 1fr; /* Sidebar fixe, contenu flex */
          gap: 50px;
          align-items: start;
        }

        /* --- SIDEBAR CARTE --- */
        .sticky-card-box { position: sticky; top: 100px; }
        .institution-card-presenter {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex; justify-content: center;
        }

        /* REPRODUCTION CARTE STRICTE (COPIE EXACTE) */
        .card-body-strict {
          width: 290px; aspect-ratio: 1.58/1; border-radius: 14px;
          position: relative; padding: 22px; overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; justify-content: space-between;
        }

        .card-gloss-light {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.06) 48%, rgba(255,255,255,0) 52%);
        }

        .card-row-t { display: flex; justify-content: space-between; align-items: center; }
        .card-logo-w { font-weight: 900; font-size: 20px; }
        .card-logo-w span { color: #a3e635; }
        .card-logo-w small { font-size: 10px; font-weight: 400; text-transform: none; color: rgba(255,255,255,0.8); }
        .nfc-w { color: white; transform: rotate(90deg); opacity: 0.8; }

        .chip-w {
          width: 42px; height: 32px; border-radius: 6px;
          background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%);
          border: 1px solid rgba(0,0,0,0.1);
        }

        .card-row-b { display: flex; justify-content: space-between; align-items: flex-end; }
        .card-type-w { color: white; font-weight: 800; font-size: 11px; letter-spacing: 1px; }

        .mc-symbol-w { display: flex; position: relative; width: 36px; height: 22px; }
        .c-w { width: 22px; height: 22px; border-radius: 50%; position: absolute; }
        .r-w { background: #eb001b; left: 0; }
        .y-w { background: #ff5f00; right: 0; opacity: 0.9; }

        .card-info-text { text-align: center; margin-top: 25px; padding: 0 10px; }
        .card-info-text h2 { color: #1a202c; font-size: 20px; font-weight: 800; }
        .price-tag { color: #005a64; font-weight: 900; font-size: 26px; margin: 8px 0; }
        .fee-mention { color: #94a3b8; font-size: 12px; }

        /* --- FORM & DATA PANELS --- */
        .bper-data-panel {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 30px; margin-bottom: 25px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .bper-data-panel h3 {
          display: flex; align-items: center; gap: 12px;
          color: #005a64; font-size: 18px; font-weight: 800;
          margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9;
        }

        .data-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f8fafc; }
        .data-row:last-child { border-bottom: none; }
        .data-label { color: #64748b; font-size: 14px; }
        .data-value { color: #1a202c; font-weight: 700; font-size: 16px; text-align: right; }
        .data-value.mono { font-family: 'Roboto Mono', monospace; font-size: 14px; letter-spacing: -0.5px; }
        .data-text { color: #1a202c; font-size: 16px; font-weight: 600; margin-bottom: 10px; }
        .help-text { color: #94a3b8; font-size: 12px; }

        /* Form action */
        .bper-final-form { background: #fff; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; }
        .bper-input-group label { display: flex; align-items: center; gap: 8px; color: #1a202c; font-weight: 700; margin-bottom: 10px; font-size: 14px; }
        .bper-input-group textarea {
          width: 100%; border-radius: 12px; border: 1px solid #cbd5e1; background: #f8fafc;
          padding: 15px; font-family: inherit; font-size: 14px; resize: vertical;
        }

        .consent-check { display: flex; align-items: start; gap: 12px; margin: 25px 0 35px; }
        .consent-check input { margin-top: 3px; accent-color: #005a64; width: 16px; height: 16px; }
        .consent-check label { color: #64748b; font-size: 14px; line-height: 1.5; cursor: pointer; }

        .bper-submit-btn {
          width: 100%; background: #005a64; color: white; border: none;
          padding: 22px; border-radius: 12px; font-weight: 800; font-size: 16px;
          cursor: pointer; transition: background 0.2s, transform 0.1s;
          letter-spacing: 1px;
        }
        .bper-submit-btn:hover { background: #00454d; }
        .bper-submit-btn:active { transform: translateY(1px); }

        /* --- FOOTER --- */
        .bper-footer { border-top: 1px solid #e2e8f0; padding: 40px; text-align: center; background: #fff; margin-top: 60px; }
        .footer-inner { color: #94a3b8; font-size: 13px; display: flex; flex-direction: column; gap: 5px; }

        /* --- RESPONSIVE MOBILE --- */
        @media (max-width: 1000px) {
          .confirmation-layout { grid-template-columns: 1fr; gap: 30px; }
          .sticky-card-box { position: relative; top: 0; }
          .institution-card-presenter { padding: 20px; }
          .bper-main-content { padding: 30px 15px; }
          .page-intro h1 { font-size: 28px; }
          .bper-header-bar { padding: 15px; }
          .secure-badge { padding: 4px 8px; font-size: 10px; }
          .bper-logo-center { font-size: 18px; }
          .iban-row { flex-direction: column; align-items: start; gap: 5px; }
          .iban-row .data-value { text-align: left; }
        }
      `}</style>
    </div>
  );
}