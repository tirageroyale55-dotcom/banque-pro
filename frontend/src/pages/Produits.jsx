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

  // --- PARAMÈTRES DU TABLEAU D'AMORTISSEMENT PROFESSIONNEL INTERACTIF (VUE 1) ---
  const [interactiveAmount, setInteractiveAmount] = useState(200000);
  const [interactiveYears, setInteractiveYears] = useState(20);
  const [interactiveRateType, setInteractiveRateType] = useState("FIXE"); // FIXE ou VARIABLE
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({ monthlyBox: 0, totalInterest: 0, insuranceBox: 0 });

  // --- LOGIQUE INTERNE POUR LE TUNNEL DE DEMANDE (VUE 3) ---
  const [hypoRateType, setHypoRateType] = useState("FIXE"); 
  const [hypoContribution, setHypoContribution] = useState(0); 

  // Moteur de calcul financier pour le Tableau d'Amortissement Interactif (Vue 1)
  useEffect(() => {
    const principal = parseFloat(interactiveAmount) || 0;
    const months = (parseInt(interactiveYears) || 1) * 12;
    const annualRate = interactiveRateType === "FIXE" ? 0.0425 : 0.0455; // Grille BPER Banca
    const monthlyRate = annualRate / 12;
    
    let monthlyPAndI = 0;
    if (principal > 0 && months > 0) {
      monthlyPAndI = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    }

    const insuranceM = Math.round((principal * 0.0021) / 12); // Taux d'assurance standardisé 0.21%
    let remainingPrincipal = principal;
    const schedule = [];
    let accumulatedInterest = 0;

    // Génération des lignes d'échéances (limitée aux 12 premiers mois pour la lisibilité)
    const limitDisplay = Math.min(months, 12);

    for (let i = 1; i <= months; i++) {
      const interestFactor = remainingPrincipal * monthlyRate;
      const principalFactor = Math.max(0, monthlyPAndI - interestFactor);
      accumulatedInterest += interestFactor;
      remainingPrincipal = Math.max(0, remainingPrincipal - principalFactor);

      if (i <= limitDisplay) {
        schedule.push({
          month: i,
          totalMonthly: Math.round(monthlyPAndI + insuranceM),
          principalPaid: Math.round(principalFactor),
          interestPaid: Math.round(interestFactor),
          insurance: insuranceM,
          remaining: Math.round(remainingPrincipal)
        });
      }
    }

    setAmortizationSchedule(schedule);
    setSummaryMetrics({
      monthlyBox: Math.round(monthlyPAndI),
      totalInterest: Math.round(accumulatedInterest),
      insuranceBox: insuranceM
    });
  }, [interactiveAmount, interactiveYears, interactiveRateType]);

  // Logique de calcul unifiée pour le tunnel de demande (Vue 3)
  const handleSimulation = (amount, duration, typeOfLoan = loanData.loanType, rateType = hypoRateType, contribution = hypoContribution) => {
    const parsedAmount = parseFloat(amount) || 0;
    const parsedDuration = parseInt(duration) || 12;
    const parsedContribution = parseFloat(contribution) || 0;

    let rate = 0.049; 

    if (typeOfLoan.includes("Immobilier") || typeOfLoan.includes("Hypothécaire")) {
      rate = rateType === "FIXE" ? 0.0425 : 0.0455; 
    }
    
    let monthly = 0;
    const principalToBorrow = (typeOfLoan.includes("Immobilier") || typeOfLoan.includes("Hypothécaire")) 
      ? Math.max(0, parsedAmount - parsedContribution)
      : parsedAmount;

    if (principalToBorrow > 0 && parsedDuration > 0) {
      monthly = (principalToBorrow * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -parsedDuration));
    }

    setLoanData(prev => ({
      ...prev,
      loanType: typeOfLoan,
      amount: parsedAmount, 
      duration: parsedDuration,
      monthlyPayment: Math.round(monthly) || 0
    }));
  };

  useEffect(() => {
    if (loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) {
      handleSimulation(loanData.amount, loanData.duration, loanData.loanType, hypoRateType, hypoContribution);
    }
  }, [hypoRateType, hypoContribution]);

  // Chargement des données de l'utilisateur depuis Atlas
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

          <div className="bper-promo-card-grid">
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

          {/* --- NOUVELLE SECTION COMPLÈTE : VRAIS TABLEAU D'AMORTISSEMENT PROFESSIONNEL INTERACTIF BPER BANCA --- */}
          <div style={{ background: "#fff", padding: "25px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "#004f52", color: "#fff", width: "35px", height: "35px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fas fa-calculator"></i>
              </div>
              <div>
                <h3 style={{ color: "#004f52", margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>Générateur de Tableau d'Amortissement Bancaire</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem" }}>Simulez vos remboursements réels selon les taux directeurs officiels de BPER Banca.</p>
              </div>
            </div>

            {/* Inputs de contrôle du Tableau */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "20px", background: "#f8fafc", padding: "15px", borderRadius: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Capital souhaité (€)</label>
                <input 
                  type="number" 
                  className="bper-full-input" 
                  value={interactiveAmount === 0 ? "" : interactiveAmount} 
                  placeholder="Ex: 150000"
                  onChange={(e) => {
                    const v = e.target.value;
                    setInteractiveAmount(v === "" ? "" : parseFloat(v));
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Durée de l'encours (Années)</label>
                <input 
                  type="number" 
                  className="bper-full-input" 
                  value={interactiveYears === 0 ? "" : interactiveYears} 
                  placeholder="Ex: 15"
                  onChange={(e) => {
                    const y = e.target.value;
                    setInteractiveYears(y === "" ? "" : parseInt(y));
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Structure de Taux BPER</label>
                <select 
                  className="bper-full-input" 
                  value={interactiveRateType} 
                  onChange={(e) => setInteractiveRateType(e.target.value)}
                >
                  <option value="FIXE">Taux Fixe Référentiel (4.25%)</option>
                  <option value="VARIABLE">Taux Variable Euribor (4.55%)</option>
                </select>
              </div>
            </div>

            {/* Fiche de Synthèse d'Amortissement */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "20px", textAlign: "center" }}>
              <div style={{ padding: "10px", background: "#f0f7f7", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Mensualité (Hors Ass.)</span>
                <strong style={{ color: "#004f52", fontSize: "1.1rem" }}>{summaryMetrics.monthlyBox} €</strong>
              </div>
              <div style={{ padding: "10px", background: "#f0f7f7", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Assurance /mois</span>
                <strong style={{ color: "#004f52", fontSize: "1.1rem" }}>+{summaryMetrics.insuranceBox} €</strong>
              </div>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Taux Nominal Applique</span>
                <strong style={{ color: "#059669", fontSize: "1.1rem" }}>{interactiveRateType === "FIXE" ? "4.25 %" : "4.55 %"}</strong>
              </div>
              <div style={{ padding: "10px", background: "#fef2f2", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "#dc2626", display: "block" }}>Coût total Intérêts</span>
                <strong style={{ color: "#dc2626", fontSize: "1.1rem" }}>{summaryMetrics.totalInterest} €</strong>
              </div>
            </div>

            {/* Structure du Vrais Tableau */}
            <div style={{ overflowX: "auto", width: "100%", maxHeight: "320px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                  <tr style={{ borderBottom: "2px solid #cbd5e1", color: "#475569" }}>
                    <th style={{ padding: "10px 8px" }}>Échéance</th>
                    <th style={{ padding: "10px 8px" }}>Prélèvement Mensuel</th>
                    <th style={{ padding: "10px 8px" }}>Part Capital Remboursé</th>
                    <th style={{ padding: "10px 8px" }}>Part Intérêts Payés</th>
                    <th style={{ padding: "10px 8px" }}>Assurance Décès/Incap.</th>
                    <th style={{ padding: "10px 8px" }}>Capital Restant Dû</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.length > 0 ? (
                    amortizationSchedule.map((row) => (
                      <tr key={row.month} style={{ borderBottom: "1px solid #f1f5f9", color: "#334155" }}>
                        <td style={{ padding: "10px 8px", fontWeight: "600" }}>Mois {row.month}</td>
                        <td style={{ padding: "10px 8px", color: "#004f52", fontWeight: "700" }}>{row.totalMonthly} €</td>
                        <td style={{ padding: "10px 8px", color: "#0f766e" }}>{row.principalPaid} €</td>
                        <td style={{ padding: "10px 8px", color: "#b91c1c" }}>{row.interestPaid} €</td>
                        <td style={{ padding: "10px 8px", color: "#64748b" }}>{row.insurance} €</td>
                        <td style={{ padding: "10px 8px", fontWeight: "600", background: "#f8fafc" }}>{row.remaining} €</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: "20px", textCenter: "center", color: "#94a3b8" }}>Veuillez renseigner un montant et une durée valides pour éditer le tableau.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", marginTop: "15px", gap: "10px" }}>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic", maxWidth: "70%" }}>
                * Affichage réglementaire : Ce tableau présente les 12 premières échéances périodiques du crédit. L'indexation Euribor pour le taux variable est mise à jour mensuellement selon les taux officiels de la Banque Centrale Européenne.
              </p>
              <button 
                onClick={() => {
                  setLoanData({
                    ...loanData,
                    loanType: interactiveAmount > 75000 ? "Crédit Immobilier BPER (Achat Résidence)" : "Prêt Personnel Multi-Projets",
                    amount: interactiveAmount,
                    duration: interactiveYears * 12,
                    monthlyPayment: summaryMetrics.monthlyBox
                  });
                  navigateToView("simulateur");
                }}
                style={{ background: "#004f52", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "600", fontSize: "0.8rem", cursor: "pointer" }}
              >
                Appliquer cette structure au dossier
              </button>
            </div>
          </div>
          {/* --------------------------------------------------------------------------------------------------------- */}

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
            <p style={{ margin: "0 0 25px 0", opacity: 0.8, fontSize: "0.95rem" }}>Le formulaire prend moins de 3 minutes. Obtenez une pré-acceptation immédiate.</p>
            <button onClick={() => navigateToView("simulateur")}>
              Démarrer ma demande de prêt en ligne
            </button>
          </div>
        </div>
      )}

      {/* VUE 3 : TUNNEL SIMULATEUR */}
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
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      handleSimulation(loanData.amount, loanData.duration, selectedType, hypoRateType, hypoContribution);
                    }}
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

                {/* LOGIQUE D'OPTIONS HYPOTHÉCAIRES */}
                {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) && (
                  <div className="bper-grid-2" style={{ marginBottom: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Type de taux hypothécaire</label>
                      <select 
                        className="bper-full-input"
                        value={hypoRateType}
                        onChange={(e) => setHypoRateType(e.target.value)}
                      >
                        <option value="FIXE">Taux Fixe Institutionnel (4.25%)</option>
                        <option value="VARIABLE">Taux Variable Indexé Euribor (4.55%)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Apport personnel disponible (€)</label>
                      <input 
                        type="number" 
                        className="bper-full-input"
                        value={hypoContribution}
                        onChange={(e) => setHypoContribution(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}

                <div className="bper-grid-2">
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>
                      {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? "Valeur du bien immobilier (€)" : "Montant recherché (€)"}
                    </label>
                    <input 
                      type="number" 
                      className="bper-full-input"
                      value={loanData.amount === 0 ? "" : loanData.amount}
                      placeholder="Ex: 25000"
                      onChange={(e) => {
                        const val = e.target.value;
                        handleSimulation(val === "" ? "" : parseFloat(val), loanData.duration, loanData.loanType, hypoRateType, hypoContribution);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Période de remboursement (mois)</label>
                    <select 
                      className="bper-full-input"
                      value={loanData.duration}
                      onChange={(e) => handleSimulation(loanData.amount, e.target.value, loanData.loanType, hypoRateType, hypoContribution)}
                    >
                      <option value="12">12 mois (1 an)</option>
                      <option value="24">24 mois (2 ans)</option>
                      <option value="36">36 mois (3 ans)</option>
                      <option value="48">48 mois (4 ans)</option>
                      <option value="60">60 mois (5 ans)</option>
                      <option value="72">72 mois (6 ans)</option>
                      <option value="84">84 mois (7 ans)</option>
                      <option value="120">120 mois (10 ans)</option>
                      {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) && (
                        <>
                          <option value="180">180 mois (15 ans)</option>
                          <option value="240">240 mois (20 ans)</option>
                          <option value="300">300 mois (25 ans)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="bper-estimation-box" style={{ background: "#f0f7f7", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #004f52", marginBottom: "25px", marginTop: "25px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#004f52" }}>Engagement Mensuel Estimé</h4>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#004f52" }}>
                    {loanData.monthlyPayment} € <span className="bper-rate-text" style={{ fontSize: "0.9rem", fontWeight: "normal", color: "#64748b" }}>
                      / mois (TAEG contractuel : {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? (hypoRateType === "FIXE" ? "4.25% Fixe" : "4.55% Variable Indexé") : "4,90%"})
                    </span>
                  </p>
                  {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) && (
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Capital Principal Net Emprunté : {Math.max(0, loanData.amount - hypoContribution)} € (après déduction de l'apport)
                    </p>
                  )}
                </div>

                <div className="bper-actions-wrapper">
                  <button className="btn-bper-back" onClick={() => navigateToView("offres")}>
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
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Capital emprunté :</strong> {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? Math.max(0, loanData.amount - hypoContribution) : loanData.amount} € sur {loanData.duration} mois</p>
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
                        const finalPayload = {
                          ...loanData,
                          amount: (loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? Math.max(0, loanData.amount - hypoContribution) : loanData.amount
                        };

                        const response = await fetch("/api/auth/apply-loan", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                          },
                          body: JSON.stringify(finalPayload)
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