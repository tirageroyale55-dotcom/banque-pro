import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import "../styles/produits.css";

export default function Produits({ isDesktop = false }) {
  const { setForceHideNav } = useOutletContext() || {};

  const [currentView, setCurrentView] = useState("offres"); 
  const [loanStep, setLoanStep] = useState(1);

  // État de configuration pour le simulateur de prêt standard (Vue 3)
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

  // NOUVEL ÉTAT : Configuration exclusive pour la simulation Hypothécaire / Immobilière
  const [hypothequeData, setHypothequeData] = useState({
    propertyValue: 250000,
    apport: 50000,
    durationYears: 20,
    rateType: "FIXE", // "FIXE" ou "VARIABLE"
    monthlyPayment: 1125,
    totalInterest: 70000,
    taeg: 3.15
  });

  // Chargement de la logique utilisateur complète depuis Atlas
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

  // Gestion de la visibilité de la navigation globale
  useEffect(() => {
    if (setForceHideNav) {
      if (currentView === "avantages" || currentView === "simulateur" || currentView === "hypotheque") {
        setForceHideNav(true);
      } else {
        setForceHideNav(false);
      }
    }
  }, [currentView, setForceHideNav]);

  // Logique de calcul des mensualités du simulateur de prêt standard
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

  // NOUVELLE LOGIQUE : Calcul financier avancé pour prêts hypothécaires (Formule d'amortissement de crédit)
  const recalculateHypotheque = (updatedFields) => {
    const current = { ...hypothequeData, ...updatedFields };
    
    const principal = Math.max(0, (parseFloat(current.propertyValue) || 0) - (parseFloat(current.apport) || 0));
    const totalMonths = (parseInt(current.durationYears) || 1) * 12;
    
    // Taux nominal annuel BPER : Fixe institutionnel = 3.15% | Variable indexé Euribor = 2.80%
    const annualRate = current.rateType === "FIXE" ? 0.0315 : 0.0280;
    const monthlyRate = annualRate / 12;
    
    let monthly = 0;
    if (principal > 0 && monthlyRate > 0) {
      monthly = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
    } else if (principal > 0) {
      monthly = principal / totalMonths;
    }
    
    const totalRepaid = monthly * totalMonths;
    const interest = Math.max(0, totalRepaid - principal);

    setHypothequeData({
      ...current,
      monthlyPayment: Math.round(monthly),
      totalInterest: Math.round(interest),
      taeg: current.rateType === "FIXE" ? 3.15 : 2.80
    });
  };

  // Fonction de navigation interne avec reset automatique du scroll vers le haut
  const navigateToView = (viewName) => {
    setCurrentView(viewName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={isDesktop ? "bper-page-container" : "page-contente bper-page-container"}>
      
      {/* VUE 1 : OFFRES ACCUEIL */}
      {currentView === "offres" && (
        <>
          <h2 className="cards-title" style={{ color: "#004f52", fontSize: "2rem", marginBottom: "25px" }}>
            Nos Solutions de Financement & Épargne
          </h2>

          <div className="bper-promo-card-grid" style={{ marginBottom: "25px" }}>
            <div className="promo-image-wrapper">
              <img src="pret-velo.png" alt="BPER Crédits et Assurances" className="promo-image" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div className="promo-badge">
                <span className="badge-small">TAEG FIXE</span>
                <span className="badge-big">4.90%</span>
                <span className="badge-old">5.85%</span>
                <span className="badge-label">Exclusivité BPER</span>
              </div>
            </div>

            <div className="promo-card-visual dark">
              <div className="promo-text-dark" style={{ padding: "20px" }}>
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

          {/* NOUVELLE ENCADRÉ D'ACCÈS AU SIMULATEUR HYPOTHÉCAIRE BPER */}
          <div className="bper-promo-card-grid" style={{ gridTemplateColumns: "1fr", marginBottom: "25px" }}>
            <div style={{ background: "linear-gradient(135deg, #004f52 0%, #002c2e 100%)", padding: "30px 25px", borderRadius: "24px", color: "white" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ background: "#eab308", color: "#004f52", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold" }}>OFFRE IMMOBILIÈRE</span>
                <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>Prêts Hypothécaires Réglementés</span>
              </div>
              <h3 style={{ color: "#fff", margin: "0 0 10px 0", fontSize: "1.5rem", fontWeight: "600" }}>Simulateur de Financement Immobilier & Hypothécaire</h3>
              <p style={{ opacity: 0.85, fontSize: "0.95rem", margin: "0 0 20px 0", lineHeight: "1.5", maxWidth: "800px" }}>
                Calculez vos mensualités d'acquisition de résidence principale ou d'investissement locatif. Comparez instantanément nos formules d'amortissement à taux fixe sécurisé ou à taux variable indexé sur l'Euribor monétaire.
              </p>
              <button 
                onClick={() => { recalculateHypotheque({}); navigateToView("hypotheque"); }} 
                className="btn-white" 
                style={{ border: "none", cursor: "pointer", fontWeight: "700", padding: "12px 24px", borderRadius: "8px", background: "#ffffff", color: "#004f52" }}
              >
                <i className="fas fa-calculator" style={{ marginRight: "8px" }}></i> Accéder au simulateur d'hypothèque
              </button>
            </div>
          </div>

          <div className="account-card" style={{ background: "#fff", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
              <div>
                <h3 style={{ color: "#004f52", margin: "0 0 8px 0", fontSize: "1.3rem" }}>Livret d'Épargne BPER Privilège</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>Optimisez et sécurisez vos économies avec un taux d'intérêt annuel brut de 3,50% garanti.</p>
              </div>
              <span style={{ background: "#f0fdf4", color: "#166534", padding: "8px 16px", borderRadius: "30px", fontWeight: "bold", fontSize: "0.9rem" }}>Rendement : 3.50%</span>
            </div>
          </div>
        </>
      )}

      {/* VUE 2 : AVANTAGES */}
      {currentView === "avantages" && (
        <div className="bper-advantages-view">
          
          <button onClick={() => navigateToView("offres")} className="btn-bper-back-top">
            <i className="fas fa-arrow-left"></i> Retour aux produits
          </button>

          <h2 style={{ color: "#004f52", fontSize: "2.2rem", marginTop: 0, marginBottom: "15px" }}>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
          <p style={{ color: "#64748b", fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "40px" }}>
            Nous réinventons le crédit à la consommation. Pas de frais cachés, une flexibilité absolue sur vos mensualités et un taux d'intérêt hautement compétitif face aux banques traditionnelles.
          </p>

          <div className="bper-advantages-grid">
            <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "16px", borderTop: "4px solid #004f52" }}>
              <div style={{ background: "#004f52", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}><i className="fas fa-sliders-h"></i></div>
              <h4 style={{ color: "#004f52", fontSize: "1.15rem", margin: "0 0 10px 0" }}>Mensualités Modulables</h4>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Augmentez ou diminuez le montant de vos remboursements mensuels gratuitement, deux fois par an, selon vos revenus.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "16px", borderTop: "4px solid #059669" }}>
              <div style={{ background: "#059669", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}><i className="fas fa-hand-holding-usd"></i></div>
              <h4 style={{ color: "#059669", fontSize: "1.15rem", margin: "0 0 10px 0" }}>Zéro Frais de Dossier</h4>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Aucuns frais administratifs ne vous seront facturés pour l'étude, l'ouverture ou la mise en place de votre dossier bancaire.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "16px", borderTop: "4px solid #eab308" }}>
              <div style={{ background: "#eab308", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}><i className="fas fa-bolt"></i></div>
              <h4 style={{ color: "#eab308", fontSize: "1.15rem", margin: "0 0 10px 0" }}>Déblocage sous 48h</h4>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Après validation finale par notre comité des engagements, les fonds sont immédiatement versés sur votre compte courant.</p>
            </div>
          </div>

          <div className="bper-cta-box">
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem" }}>Prêt à concrétiser votre projet ?</h3>
            <p style={{ margin: "0 0 25px 0", opacity: 0.8, fontSize: "0.95rem" }}> Le formulaire prend moins de 3 minutes. Obtenez une pré-acceptation immédiate.</p>
            <button onClick={() => navigateToView("simulateur")}>
              Démarrer ma demande de prêt en ligne
            </button>
          </div>
        </div>
      )}

      {/* NOUVELLE VUE EXCLUSIVE : SIMULATEUR HYPOTHÉCAIRE PRO */}
      {currentView === "hypotheque" && (
        <div className="bper-loan-container" style={{ width: "100%", boxSizing: "border-box" }}>
          <button onClick={() => navigateToView("offres")} className="btn-bper-back-top" style={{ marginBottom: "20px" }}>
            <i className="fas fa-arrow-left"></i> Retourner aux solutions de financement
          </button>

          <div style={{ background: "#fff", padding: "30px 20px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
            <h2 style={{ color: "#004f52", marginBottom: "5px", fontSize: "1.6rem", fontWeight: "700" }}>
              Planification Établissement de Crédit Hypothécaire
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "30px", lineHeight: "1.4" }}>
              Modélisation financière conforme aux instructions réglementaires d'octroi de crédits immobiliers BPER Banca.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              
              {/* Type de Structure de Taux */}
              <div>
                <label style={{ display: "block", marginBottom: "10px", fontWeight: "700", color: "#334155", fontSize: "0.9rem" }}>Structure contractuelle du taux d'intérêt</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button 
                    type="button"
                    onClick={() => recalculateHypotheque({ rateType: "FIXE" })}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      border: hypothequeData.rateType === "FIXE" ? "2px solid #004f52" : "1px solid #cbd5e1",
                      background: hypothequeData.rateType === "FIXE" ? "#f0f7f7" : "#fff",
                      color: "#004f52"
                    }}
                  >
                    <i className="fas fa-lock" style={{ marginRight: "6px" }}></i> Taux Fixe Institutionnel (3.15%)
                  </button>
                  <button 
                    type="button"
                    onClick={() => recalculateHypotheque({ rateType: "VARIABLE" })}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      border: hypothequeData.rateType === "VARIABLE" ? "2px solid #004f52" : "1px solid #cbd5e1",
                      background: hypothequeData.rateType === "VARIABLE" ? "#f0f7f7" : "#fff",
                      color: "#004f52"
                    }}
                  >
                    <i className="fas fa-chart-line" style={{ marginRight: "6px" }}></i> Taux Variable Révisable (2.80% Euribor)
                  </button>
                </div>
              </div>

              {/* Saisie des données financières */}
              <div className="bper-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Valeur estimée du bien immobilier (€)</label>
                  <input 
                    type="number" 
                    className="bper-full-input"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    value={hypothequeData.propertyValue}
                    onChange={(e) => recalculateHypotheque({ propertyValue: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>Apport Personnel Initial (€)</label>
                  <input 
                    type="number" 
                    className="bper-full-input"
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    value={hypothequeData.apport}
                    onChange={(e) => recalculateHypotheque({ apport: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: "600", fontSize: "0.85rem", color: "#475569" }}>
                    <span>Durée de l'amortissement du prêt</span>
                    <strong style={{ color: "#004f52" }}>{hypothequeData.durationYears} ans ({hypothequeData.durationYears * 12} échéances)</strong>
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    step="1"
                    style={{ width: "100%", accentColor: "#004f52", cursor: "pointer" }}
                    value={hypothequeData.durationYears}
                    onChange={(e) => recalculateHypotheque({ durationYears: e.target.value })}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
                    <span>5 ans</span>
                    <span>15 ans</span>
                    <span>25 ans</span>
                    <span>30 ans Max</span>
                  </div>
                </div>
              </div>

              {/* Bloc de Synthèse d'Amortissement Bancaire */}
              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginTop: "10px" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#004f52", fontSize: "1rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Rapport Analytique de l'Engagement
                </h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                  <div style={{ background: "#fff", padding: "15px", borderRadius: "12px", borderLeft: "4px solid #004f52" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "2px" }}>Mensualité Hors Assurance</span>
                    <strong style={{ color: "#004f52", fontSize: "1.5rem", fontWeight: "700" }}>{hypothequeData.monthlyPayment} €</strong>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", display: "block" }}>Échéance constante</span>
                  </div>

                  <div style={{ background: "#fff", padding: "15px", borderRadius: "12px", borderLeft: "4px solid #059669" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Capital Net Emprunté</span>
                    <strong style={{ color: "#334155", fontSize: "1.2rem" }}>{Math.max(0, hypothequeData.propertyValue - hypothequeData.apport)} €</strong>
                  </div>

                  <div style={{ background: "#fff", padding: "15px", borderRadius: "12px", borderLeft: "4px solid #eab308" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Coût Total des Intérêts</span>
                    <strong style={{ color: "#334155", fontSize: "1.2rem" }}>{hypothequeData.totalInterest} €</strong>
                  </div>

                  <div style={{ background: "#fff", padding: "15px", borderRadius: "12px", borderLeft: "4px solid #38bdf8" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px" }}>TAEG Prévisionnel</span>
                    <strong style={{ color: "#059669", fontSize: "1.2rem" }}>{hypothequeData.taeg}%</strong>
                  </div>
                </div>

                {hypothequeData.rateType === "VARIABLE" && (
                  <p style={{ margin: "12px 0 0 0", fontSize: "0.8rem", color: "#b45309", backgroundColor: "#fffbeb", padding: "10px", borderRadius: "8px", border: "1px solid #fde68a" }}>
                    <i className="fas fa-exclamation-triangle"></i> <strong>Avis réglementaire :</strong> Le taux d'intérêt de ce contrat de crédit est révisable. Le montant de vos mensualités est indexé sur l'évolution du taux Euribor 3 mois et peut fluctuer à la hausse comme à la baisse.
                  </p>
                )}
              </div>

              {/* Mentions Légales Obligatoires & Bouton de contact */}
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0, lineHeight: "1.5", textAlign: "justify" }}>
                Un crédit immobilier vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager. L'octroi d'un prêt hypothécaire définitif reste soumis à l'évaluation finale de solvabilité par notre commission des risques BPER Banca et à la constitution de garanties réelles adéquates.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button 
                  onClick={() => navigateToView("offres")}
                  style={{ background: "#cbd5e1", color: "#334155", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                >
                  Fermer
                </button>
                <button 
                  onClick={() => {
                    alert("Simulation enregistrée. Un conseiller de l'agence commerciale BPER prendra contact avec vous sous 24h ouvrées.");
                    navigateToView("offres");
                  }}
                  style={{ background: "#004f52", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                >
                  Déposer une intention de dossier immo
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VUE 3 : TUNNEL SIMULATEUR STANDARD */}
      {currentView === "simulateur" && (
        <div className="bper-loan-container">
          
          <div className="bper-loan-steps">
            <div className="bper-step-item" style={{ color: loanStep === 1 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #004f52" : "none" }}>1. CONFIGURATION</div>
            <div className="bper-step-item" style={{ color: loanStep === 2 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #004f52" : "none" }}>2. INFORMATIONS</div>
            <div className="bper-step-item" style={{ color: loanStep === 3 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #004f52" : "none" }}>3. VÉRIFICATION</div>
          </div>

          <div className="bper-loan-card" style={{ background: "#fff", padding: "30px 20px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
            <h2 className="bper-loan-title" style={{ color: "#004f52", marginBottom: "5px", fontSize: "1.6rem" }}>Demande de Financement en Ligne</h2>
            <p className="bper-loan-subtitle" style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "30px" }}>BPER Banca — Service d'octroi des crédits aux particuliers.</p>

            {/* ÉTAPE 1 */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Nature de votre projet</label>
                  <select 
                    className="bper-full-input"
                    value={loanData.loanType}
                    onChange={(e) => setLoanData({...loanData, loanType: e.target.value})}
                  >
                    <option value="Prêt Personnel Multi-Projets">Prêt Personnel Multi-Projets</option>
                    <option value="Prêt Automobile (Véhicule Neuf / Hybride)">Prêt Automobile (Véhicule Neuf / Hybride)</option>
                    <option value="Prêt Automobile (Véhicule d'Occasion)">Prêt Automobile (Véhicule d'Occasion)</option>
                    <option value="Prêt Travaux & Éco-Rénovation">Prêt Travaux & Éco-Rénovation</option>
                    <option value="Crédit Immobilier BPER (Achat Résidence)">Crédit Immobilier BPER (Achat Résidence)</option>
                    <option value="Rachat et Regroupement de Crédits">Rachat et Regroupement de Crédits</option>
                    <option value="Prêt Études & Financement Formation">Prêt Études & Financement Formation</option>
                    <option value="Financement Trésorerie & Ligne Professionnelle">Financement Trésorerie & Ligne Professionnelle</option>
                  </select>
                </div>

                <div className="bper-grid-2">
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Montant recherché (€)</label>
                    <input 
                      type="number" 
                      className="bper-full-input"
                      value={loanData.amount}
                      onChange={(e) => handleSimulation(e.target.value, loanData.duration)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Période de remboursement (mois)</label>
                    <select 
                      className="bper-full-input"
                      value={loanData.duration}
                      onChange={(e) => handleSimulation(loanData.amount, e.target.value)}
                    >
                      <option value="12">12 mois (1 an)</option>
                      <option value="24">24 mois (2 ans)</option>
                      <option value="36">36 mois (3 ans)</option>
                      <option value="48">48 mois (4 ans)</option>
                      <option value="60">60 mois (5 ans)</option>
                      <option value="72">72 mois (6 ans)</option>
                      <option value="84">84 mois (7 ans)</option>
                      <option value="120">120 mois (10 ans)</option>
                    </select>
                  </div>
                </div>

                <div className="bper-estimation-box" style={{ background: "#f0f7f7", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #004f52", marginBottom: "25px", marginTop: "25px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#004f52" }}>Engagement Mensuel Estimé</h4>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#004f52" }}>
                    {loanData.monthlyPayment} € <span className="bper-rate-text" style={{ fontSize: "0.9rem", fontWeight: "normal", color: "#64748b" }}>/ mois (TAEG contractuel : 4,90%)</span>
                  </p>
                </div>

                <div className="bper-actions-wrapper">
                  <button className="btn-bper-back" onClick={() => navigateToView("avantages")}>
                    <i className="fas fa-chevron-left"></i> Retour
                  </button>
                  <button className="btn-bper-submit" style={{ background: "#004f52", color: "#fff" }} onClick={() => { setLoanStep(2); window.scrollTo({top: 0}); }}>
                    Constituer 
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {loanStep === 2 && (
              <div>
                <h4 className="bper-step-title" style={{ color: "#004f52", marginBottom: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Situation Personnelle & Financière</h4>
                <div className="bper-grid-2">
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Civilité</label>
                    <select className="bper-full-input" value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Profession du client</label>
                    <select className="bper-full-input" value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
                      <option value="Salarié secteur privé (CDI)">Salarié secteur privé (CDI)</option>
                      <option value="Fonctionnaire / Service Public">Fonctionnaire / Service Public</option>
                      <option value="Profession Libérale / Indépendant">Profession Libérale / Indépendant</option>
                      <option value="Commerçant / Artisan">Commerçant / Artisan</option>
                      <option value="Chef d'entreprise / Cadre Dirigeant">Chef d'entreprise / Cadre Dirigeant</option>
                      <option value="Retraité / Pensionné">Retraité / Pensionné</option>
                      <option value="Salarié secteur privé (CDD)">Salarié secteur privé (CDD)</option>
                      <option value="Agriculteur exploitant">Agriculteur exploitant</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Nom</label>
                    <input type="text" className="bper-full-input" value={loanData.lastName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Prénom</label>
                    <input type="text" className="bper-full-input" value={loanData.firstName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Revenus nets par mois (€)</label>
                    <input type="number" placeholder="Ex: 3100" className="bper-full-input" value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Co-emprunteur</label>
                    <select className="bper-full-input" value={loanData.hasCoBorrower} onChange={(e) => setLoanData({...loanData, hasCoBorrower: e.target.value})}>
                      <option value="Non">Non</option>
                      <option value="Oui">Oui</option>
                    </select>
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
                <div className="bper-summary-box">
                  <h4 style={{ margin: "0 0 15px 0", color: "#004f52" }}>Validation contractuelle du dossier</h4>
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>Nature du projet :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.loanType}</span>
                  </p>

                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>Titulaire :</strong> {loanData.civility} {loanData.lastName} {loanData.firstName} {loanData.profession ? `(${loanData.profession})` : ""}
                  </p>
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>E-mail :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.email}</span>
                  </p>
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>Téléphone :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.telephone}</span>
                  </p>
                  
                  <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "15px 0" }} />
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Capital emprunté :</strong> {loanData.amount} € sur {loanData.duration} mois</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Charge mensuelle calculée :</strong> {loanData.monthlyPayment} € / mois</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Capacité déclarée :</strong> {loanData.income} € net / mois</p>
                </div>

                <p className="bper-legal-text" style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "25px", lineHeight: "1.5" }}>
                  En transmettant ce dossier, vous soumettez formellement votre demande de crédit au service d'analyse des risques et de conformité monétique de <strong>BPER Banca</strong>. Les fonds seront débloqués après validation administrative sous un délai réglementaire de 48h. Une notification de décision sera envoyée à l'adresse e-mail ci-dessus.
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
                          alert(resData.message || "Une erreur est survenue lors de l'envoi.");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Impossible de joindre le serveur.");
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