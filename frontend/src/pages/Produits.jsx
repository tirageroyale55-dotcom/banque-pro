import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import "../styles/produits.css";

export default function Produits({ isDesktop = false }) {
  const { setForceHideNav } = useOutletContext() || {};

  const [currentView, setCurrentView] = useState("offres"); 
  const [loanStep, setLoanStep] = useState(1);

  const [loanData, setLoanData] = useState({
    loanType: "Prêt Personnel Multi-Projets",
    amount: 15000,
    duration: 48,
    monthlyPayment: 345,
    civility: "M.",
    lastName: "",
    firstName: "",
    email: "",         
    telephone: "",     
    income: "",
    profession: "Salarié secteur privé (CDI)", 
    hasCoBorrower: "Non"
  });

  useEffect(() => {
    const loadRealUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/auth/me", { 
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const dbUser = await response.json();
          
          setLoanData(prev => ({
            ...prev,
            lastName: dbUser.nom || "",
            firstName: dbUser.prenom || "",
            email: dbUser.email || "",        
            telephone: dbUser.telephone || "", 
            profession: dbUser.situationProfessionnelle || "Salarié secteur privé (CDI)"
          }));
        }
      } catch (error) {
        console.error("Impossible de charger les données depuis Atlas :", error);
      }
    };

    loadRealUserData();
  }, []);

  useEffect(() => {
    if (setForceHideNav) {
      if (currentView === "avantages" || currentView === "simulateur") {
        setForceHideNav(true);
      } else {
        setForceHideNav(false);
      }
    }
  }, [currentView, setForceHideNav]);

  const handleSimulation = (amount, duration) => {
    const parsedAmount = parseFloat(amount) || 0;
    const parsedDuration = parseInt(duration) || 12;
    const rate = 0.049; 
    
    let monthly = 0;
    if (parsedAmount > 0 && parsedDuration > 0) {
      monthly = (parsedAmount * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -parsedDuration));
    }

    setLoanData(prev => ({
      ...prev,
      amount: amount, 
      duration: parsedDuration,
      monthlyPayment: Math.round(monthly) || 0
    }));
  };

  // Fonction pour basculer de vue et forcer l'écran à remonter proprement
  const navigateToView = (viewName) => {
    setCurrentView(viewName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={isDesktop ? "" : "page-contente"} style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 10px", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box" }}>
      
      {/* VUE 1 : OFFRES ACCUEIL */}
      {currentView === "offres" && (
        <>
          <h2 className="cards-title" style={{ color: "#004f52", fontSize: "1.8rem", marginBottom: "20px" }}>
            Nos Solutions de Financement & Épargne
          </h2>

          <div className="promo-card-inner reverse" style={{ display: "grid", background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", marginBottom: "25px" }}>
            <div className="promo-image-wrapper">
              <img src="pret-velo.png" alt="BPER Crédits et Assurances" className="promo-image" />
              <div className="promo-badge">
                <span className="badge-small">TAEG FIXE</span>
                <span className="badge-big">4.90%</span>
                <span className="badge-old">5.85%</span>
                <span className="badge-label">Exclusivité BPER</span>
              </div>
            </div>

            <div className="promo-card-visual dark">
              <div className="promo-text-dark">
                <div className="promo-tag">
                  <span className="promo-icon"><i className="fas fa-percentage" style={{ color: "#fff" }}></i></span>
                  <span>CRÉDIT PARTICULIER ET AUTO</span>
                </div>
                <h2>Financez vos ambitions au meilleur taux du marché.</h2>
                <p>Découvrez pourquoi BPER Banca reste le choix n°1 des emprunteurs cette année avec une gestion 100% flexible et transparente.</p>
                <button onClick={() => navigateToView("avantages")} className="btn-white" style={{ border: "none", cursor: "pointer", fontWeight: "bold" }}>
                  En savoir plus
                </button>
              </div>
            </div>
          </div>

          <div className="account-card" style={{ background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
              <div>
                <h3 style={{ color: "#004f52", margin: "0 0 6px 0", fontSize: "1.2rem" }}>Livret d'Épargne BPER Privilège</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>Optimisez et sécurisez vos économies avec un taux d'intérêt annuel brut de 3,50% garanti.</p>
              </div>
              <span style={{ background: "#f0fdf4", color: "#166534", padding: "6px 14px", borderRadius: "30px", fontWeight: "bold", fontSize: "0.85rem" }}>Rendement : 3.50%</span>
            </div>
          </div>
        </>
      )}

      {/* VUE 2 : AVANTAGES */}
      {currentView === "avantages" && (
        <div style={{ background: "white", padding: "25px 15px", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
          
          {/* BOUTON RETOUR PRODUITS AVEC FLÈCHE */}
          <button onClick={() => navigateToView("offres")} className="btn-bper-back-top">
            <i className="fas fa-arrow-left"></i> Retour aux produits
          </button>

          <h2 style={{ color: "#004f52", fontSize: "1.8rem", marginTop: 0, marginBottom: "15px" }}>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
          <p style={{ color: "#64748b", fontSize: "1rem", lineHeight: "1.5", marginBottom: "30px" }}>
            Nous réinventons le crédit à la consommation. Pas de frais cachés, une flexibilité absolue sur vos mensualités et un taux d'intérêt hautement compétitif.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "35px" }}>
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", borderTop: "4px solid #004f52" }}>
              <div style={{ background: "#004f52", color: "white", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><i className="fas fa-sliders-h"></i></div>
              <h4 style={{ color: "#004f52", fontSize: "1.1rem", margin: "0 0 8px 0" }}>Mensualités Modulables</h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, lineHeight: "1.4" }}>Augmentez ou diminuez le montant de vos remboursements mensuels gratuitement.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", borderTop: "4px solid #059669" }}>
              <div style={{ background: "#059669", color: "white", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><i className="fas fa-hand-holding-usd"></i></div>
              <h4 style={{ color: "#059669", fontSize: "1.1rem", margin: "0 0 8px 0" }}>Zéro Frais de Dossier</h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, lineHeight: "1.4" }}>Aucuns frais administratifs ne vous seront facturés pour la mise en place de votre dossier bancaire.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", borderTop: "4px solid #eab308" }}>
              <div style={{ background: "#eab308", color: "white", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}><i className="fas fa-bolt"></i></div>
              <h4 style={{ color: "#eab308", fontSize: "1.1rem", margin: "0 0 8px 0" }}>Déblocage sous 48h</h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, lineHeight: "1.4" }}>Après validation finale, les fonds sont immédiatement versés sur votre compte courant.</p>
            </div>
          </div>

          <div style={{ textAlign: "center", background: "#004f52", padding: "25px 15px", borderRadius: "16px", color: "white" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem" }}>Prêt à concrétiser votre projet ?</h3>
            <p style={{ margin: "0 0 20px 0", opacity: 0.8, fontSize: "0.85rem" }}>Le formulaire prend moins de 3 minutes. Obtenez une pré-acceptation immédiate.</p>
            <button onClick={() => navigateToView("simulateur")} style={{ background: "#e6ff6a", color: "#004f52", padding: "12px 24px", border: "none", borderRadius: "30px", fontWeight: "bold", fontSize: "0.95rem", width: "100%", maxWidth: "320px", cursor: "pointer" }}>
              Démarrer ma demande de prêt en ligne
            </button>
          </div>
        </div>
      )}

      {/* VUE 3 : TUNNEL SIMULATEUR */}
      {currentView === "simulateur" && (
        <div className="bper-loan-container">
          
          {/* BARRE DE PROGRESSION COLLANTE ET PARFAITEMENT RESPONSIVE */}
          <div className="bper-loan-steps">
            <div className="bper-step-item" style={{ color: loanStep === 1 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #004f52" : "none" }}>1. CONFIGURATION</div>
            <div className="bper-step-item" style={{ color: loanStep === 2 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #004f52" : "none" }}>2. INFORMATIONS</div>
            <div className="bper-step-item" style={{ color: loanStep === 3 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #004f52" : "none" }}>3. VÉRIFICATION</div>
          </div>

          <div className="bper-loan-card" style={{ background: "#fff", padding: "20px 15px", borderRadius: "20px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            <h2 className="bper-loan-title" style={{ color: "#004f52", marginBottom: "5px", fontSize: "1.4rem" }}>Demande de Financement</h2>
            <p className="bper-loan-subtitle" style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "25px" }}>BPER Banca — Service d'octroi des crédits aux particuliers.</p>

            {/* ÉTAPE 1 */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>Nature de votre projet</label>
                  <select 
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.9rem", boxSizing: "border-box" }}
                    value={loanData.loanType}
                    onChange={(e) => setLoanData({...loanData, loanType: e.target.value})}
                  >
                    <option value="Prêt Personnel Multi-Projets">Prêt Personnel Multi-Projets</option>
                    <option value="Prêt Automobile (Véhicule Neuf / Hybride)">Prêt Automobile (Véhicule Neuf / Hybride)</option>
                    <option value="Prêt Automobile (Véhicule d'Occasion)">Prêt Automobile (Véhicule d'Occasion)</option>
                    <option value="Prêt Travaux & Éco-Rénovation">Prêt Travaux & Éco-Rénovation</option>
                    <option value="Crédit Immobilier BPER (Achat Résidence)">Crédit Immobilier BPER (Achat Résidence)</option>
                    <option value="Rachat et Regroupement de Crédits">Rachat et Regroupement de Crédits</option>
                  </select>
                </div>

                <div className="bper-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>Montant recherché (€)</label>
                    <input 
                      type="number" 
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.9rem", boxSizing: "border-box" }}
                      value={loanData.amount}
                      onChange={(e) => handleSimulation(e.target.value, loanData.duration)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>Remboursement (mois)</label>
                    <select 
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.9rem", boxSizing: "border-box" }}
                      value={loanData.duration}
                      onChange={(e) => handleSimulation(loanData.amount, e.target.value)}
                    >
                      <option value="12">12 mois (1 an)</option>
                      <option value="24">24 mois (2 ans)</option>
                      <option value="36">36 mois (3 ans)</option>
                      <option value="48">48 mois (4 ans)</option>
                      <option value="60">60 mois (5 ans)</option>
                    </select>
                  </div>
                </div>

                <div className="bper-estimation-box" style={{ background: "#f0f7f7", padding: "15px", borderRadius: "10px", borderLeft: "5px solid #004f52", marginBottom: "25px" }}>
                  <h4 style={{ margin: "0 0 4px 0", color: "#004f52", fontSize: "0.9rem" }}>Mensualité Estimée</h4>
                  <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: "bold", color: "#004f52" }}>
                    {loanData.monthlyPayment} € <span style={{ fontSize: "0.8rem", fontWeight: "normal", color: "#64748b" }}>/ mois (TAEG : 4,90%)</span>
                  </p>
                </div>

                <div className="bper-actions-wrapper">
                  {/* Renvoie à la vue Avantages où se trouve le bouton d'accès direct "Retour aux produits" */}
                  <button className="btn-bper-back" onClick={() => navigateToView("avantages")}>
                    <i className="fas fa-chevron-left"></i> Retour
                  </button>
                  <button className="btn-bper-submit" style={{ background: "#004f52", color: "#fff" }} onClick={() => { setLoanStep(2); window.scrollTo({top: 0}); }}>
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {loanStep === 2 && (
              <div>
                <h4 style={{ color: "#004f52", marginBottom: "15px", fontSize: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Vos Informations</h4>
                <div className="bper-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>Civilité</label>
                    <select style={{ width: "100%", padding: "11px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.85rem" }} value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>Profession</label>
                    <select style={{ width: "100%", padding: "11px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.85rem" }} value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
                      <option value="Salarié secteur privé (CDI)">Salarié (CDI)</option>
                      <option value="Fonctionnaire / Service Public">Fonctionnaire</option>
                      <option value="Profession Libérale / Indépendant">Indépendant</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>Nom</label>
                    <input type="text" style={{ width: "100%", padding: "11px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.85rem" }} value={loanData.lastName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>Prénom</label>
                    <input type="text" style={{ width: "100%", padding: "11px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.85rem" }} value={loanData.firstName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.8rem" }}>Revenus mensuels (€)</label>
                    <input type="number" placeholder="Ex: 2500" style={{ width: "100%", padding: "11px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333", fontSize: "0.85rem" }} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>
                </div>

                <div className="bper-actions-wrapper">
                  <button className="btn-bper-back" onClick={() => { setLoanStep(1); window.scrollTo({top: 0}); }}>
                    <i className="fas fa-chevron-left"></i> Retour
                  </button>
                  <button className="btn-bper-submit" style={{ background: "#004f52", color: "#fff" }} disabled={!loanData.lastName || !loanData.income} onClick={() => { setLoanStep(3); window.scrollTo({top: 0}); }}>
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 */}
            {loanStep === 3 && (
              <div>
                <div className="bper-summary-box" style={{ padding: "15px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px", color: "#333", fontSize: "0.85rem" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#004f52", fontSize: "0.95rem" }}>Récapitulatif</h4>
                  <p style={{ margin: "4px 0" }}><strong>Projet :</strong> {loanData.loanType}</p>
                  <p style={{ margin: "4px 0" }}><strong>Client :</strong> {loanData.civility} {loanData.lastName} {loanData.firstName}</p>
                  <p style={{ margin: "4px 0" }}><strong>Financement :</strong> {loanData.amount} € sur {loanData.duration} mois</p>
                  <p style={{ margin: "4px 0" }}><strong>Mensualité :</strong> {loanData.monthlyPayment} € / mois</p>
                </div>

                <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "20px", lineHeight: "1.4" }}>
                  En transmettant ce dossier, vous soumettez votre demande au service d'analyse de <strong>BPER Banca</strong>.
                </p>

                <div className="bper-actions-wrapper">
                  <button className="btn-bper-back" onClick={() => { setLoanStep(2); window.scrollTo({top: 0}); }}>
                    <i className="fas fa-edit"></i> Modifier
                  </button>
                  
                  <button 
                    className="btn-bper-submit" 
                    style={{ background: "#059669", color: "#fff" }}
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/auth/apply-loan", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                          },
                          body: JSON.stringify(loanData)
                        });

                        const resData = await response.json();

                        if (response.ok) {
                          alert(resData.message || "Demande envoyée avec succès !");
                          navigateToView("offres");
                          setLoanStep(1);
                        } else {
                          alert(resData.message || "Une erreur est survenue.");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Erreur de connexion au serveur.");
                      }
                    }}
                  >
                    Valider
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}