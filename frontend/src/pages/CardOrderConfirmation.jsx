import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from "../services/api"; 
import { generateCardNumber, generateExpiry, generateCVV } from '../utils/cardGenerator';
import { 
  ArrowLeft, ShieldCheck, Landmark, User, 
  MapPin, Wifi, ChevronRight, MessageSquare, Info, CheckCircle2
} from 'lucide-react';

export default function CardOrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { card } = location.state || {};
  
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleFinalSubmit = () => {
    // Génération des données techniques de la carte
    const expiry = generateExpiry();
    const pendingCard = {
      ...card,
      number: generateCardNumber(),
      expiry: `${expiry.month}/${expiry.year}`,
      cvv: generateCVV(),
      status: "En cours",
      dateDemande: new Date().toLocaleDateString()
    };

    // Stockage pour le Dashboard
    localStorage.setItem("pending_card_request", JSON.stringify(pendingCard));
    setIsSuccess(true);
  };

  if (!card) return null;
  if (loading) return <div className="bper-loading-state">Chargement sécurisé...</div>;

  // Écran de succès professionnel
  if (isSuccess) {
    return (
      <div className="bper-confirmation-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="info-group" style={{ textAlign: 'center', maxWidth: '450px', padding: '40px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
          <div style={{ background: '#ecfdf5', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={48} color="#059669" />
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Demande envoyée avec succès !</h2>
          <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '30px' }}>
            Vous recevrez un message de validation après l'investigation des conditions et des règles de sécurité BPER Banca.
          </p>
          <button className="btn-submit-order" onClick={() => navigate("/dashboard")}>
            <span>OK</span>
          </button>
        </div>
      </div>
    );
  }

  const { user, account } = dbData;

  return (
    <div className="bper-confirmation-screen">
      <nav className="bper-top-nav">
        <div className="nav-container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Retour</span>
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
            <h1>Validation de commande</h1>
            <p>Vérifiez vos informations pour votre carte <strong>{card.name}</strong>.</p>
          </header>

          <div className="main-grid">
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

                <div className="card-meta">
                  <h2>{card.name}</h2>
                  <p className="price">{card.price} <span>/ mois</span></p>
                </div>

                <div className="summary-card-account" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                  <div className="summary-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: '#005a64', marginBottom: '15px' }}>
                    <Landmark size={16}/> Compte de débit
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span>Compte N°</span>
                    <span style={{ fontWeight: '700' }}>{account.accountNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>IBAN</span>
                    <span style={{ fontWeight: '700', fontFamily: 'monospace', color: '#005a64' }}>{account.iban}</span>
                  </div>
                </div>
              </div>
            </aside>

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
                  <p className="main-address" style={{ fontSize: '16px', fontWeight: '700' }}>{user.adresse}</p>
                  <p className="sub-address" style={{ color: '#64748b' }}>{user.codePostal}, {user.ville} - {user.pays}</p>
                </div>
              </div>

              <div className="info-group">
                <div className="group-header">
                  <MessageSquare size={18} />
                  <h3>Note ou demande particulière</h3>
                </div>
                <textarea 
                  className="bper-input-text"
                  placeholder="Ex: Livraison en agence souhaitée..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                />
              </div>

              <div className="confirmation-footer">
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
        .bper-confirmation-screen { background-color: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .layout-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .bper-top-nav { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 15px 0; position: sticky; top: 0; z-index: 100; }
        .nav-container { display: flex; justify-content: space-between; align-items: center; }
        .btn-back { background: none; border: none; color: #005a64; display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer; }
        .security-badge { display: flex; align-items: center; gap: 6px; color: #059669; background: #f0fdf4; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; border: 1px solid #dcfce7; }
        .content-header { padding: 30px 0; }
        .content-header h1 { font-size: 28px; color: #0f172a; font-weight: 800; }
        .main-grid { display: grid; grid-template-columns: 400px 1fr; gap: 40px; padding-bottom: 60px; }
        .sticky-wrapper { position: sticky; top: 100px; }
        
        /* CARD CSS STRICT */
        .card-perspective-wrapper { perspective: 1000px; }
        .card-floating-animation { animation: cardFloat 5s ease-in-out infinite; transform-style: preserve-3d; }
        @keyframes cardFloat { 0%, 100% { transform: rotateY(-5deg) rotateX(4deg) translateY(0); } 50% { transform: rotateY(5deg) rotateX(-4deg) translateY(-8px); } }
        .card-physical-container { padding: 30px; background: #f8fafc; border-radius: 24px; display: flex; justify-content: center; }
        .card-body { width: 280px; aspect-ratio: 1.58 / 1; border-radius: 14px; position: relative; padding: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25); display: flex; flex-direction: column; justify-content: space-between; }
        .card-gloss { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(110deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0) 52%); }
        .card-top-row { display: flex; justify-content: space-between; align-items: center; z-index: 2; }
        .bper-logo { font-weight: 900; font-size: 20px; }
        .bper-logo span { color: #a3e635; }
        .nfc-icon { transform: rotate(90deg); color: white; }
        .emv-chip { width: 42px; height: 32px; background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%); border-radius: 6px; position: relative; z-index: 2; border: 1px solid rgba(0,0,0,0.15); }
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

        .card-meta { text-align: center; margin: 20px 0; }
        .card-meta h2 { font-size: 22px; font-weight: 800; }
        .price { font-size: 24px; font-weight: 800; color: #005a64; }

        .info-group { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; margin-bottom: 20px; }
        .group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #005a64; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
        .group-header h3 { font-size: 13px; font-weight: 800; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .info-item label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .info-item p { font-size: 14px; font-weight: 700; color: #1e293b; }
        .bper-input-text { width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 12px; font-size: 14px; }
        .btn-submit-order { width: 100%; background: #005a64; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; }

        @media (max-width: 1000px) {
          .main-grid { grid-template-columns: 1fr; }
          .visual-sidebar { order: -1; }
          .sticky-wrapper { position: static; }
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}