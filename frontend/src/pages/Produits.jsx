import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import "../styles/produits.css";

export default function Produits({ isDesktop = false }) {
  const { setForceHideNav } = useOutletContext() || {};

  const [currentView, setCurrentView] = useState("offres"); 
  const [loanStep, setLoanStep] = useState(1);

  // Détection dynamique des écrans ultra-compacts (ex: iPhone SE width: 320px)
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 375);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmallMobile = windowWidth <= 360; // Flag spécifique pour iPhone SE

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
  const [interactiveRateType, setInteractiveRateType] = useState("FIXE"); // FIXE = 4.25% | VARIABLE = 4.55%
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({ monthlyBox: 0, totalInterest: 0, insuranceBox: 0, totalInsurance: 0 });

  // --- LOGIQUE INTERNE POUR LE TUNNEL DE DEMANDE (VUE 3) ---
  const [hypoRateType, setHypoRateType] = useState("FIXE"); 
  const [hypoContribution, setHypoContribution] = useState(0); 

  // Moteur de calcul financier réglementaire (Tableau d'Amortissement Interactif - Vue 1)
  useEffect(() => {
    const principal = parseFloat(interactiveAmount) || 0;
    const months = (parseInt(interactiveYears) || 1) * 12;
    const annualRate = interactiveRateType === "FIXE" ? 0.0425 : 0.0455; // Taux BPER Banca
    const monthlyRate = annualRate / 12;
    
    let monthlyPAndI = 0;
    if (principal > 0 && months > 0) {
      monthlyPAndI = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    }

    // Calcul de l'assurance Décès/Incapacité révisé à 0,60% ANNUEL
    const annualInsuranceCost = principal * 0.0060;
    const insuranceM = Math.round(annualInsuranceCost / 12); 
    const totalInsuranceCost = insuranceM * months;

    let remainingPrincipal = principal;
    const schedule = [];
    let accumulatedInterest = 0;

    // Affichage des 12 premières mensualités (Aperçu d'encours standard)
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
      insuranceBox: insuranceM,
      totalInsurance: totalInsuranceCost
    });
  }, [interactiveAmount, interactiveYears, interactiveRateType]);

  // Logique de calcul pour le tunnel de demande (Vue 3)
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

  // Récupération Atlas User Data
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
        console.error("Erreur Atlas :", error);
      }
    };
    loadRealUserData();
  }, []);

  useEffect(() => {
    if (setForceHideNav) {
      setForceHideNav(currentView === "avantages" || currentView === "simulateur");
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
          <h2 className="cards-title" style={{ color: "#004f52", fontSize: isSmallMobile ? "1.5rem" : "2rem", marginBottom: "25px" }}>
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
              <div className="promo-text-dark" style={{ padding: isSmallMobile ? "15px" : "20px" }}>
                <div className="promo-tag">
                  <span className="promo-icon"><i className="fas fa-percentage" style={{ color: "#fff" }}></i></span>
                  <span>CRÉDIT PARTICULIER ET AUTO</span>
                </div>
                <h2 style={{ fontSize: isSmallMobile ? "1.25rem" : "1.6rem" }}>Financez vos ambitions au meilleur taux du marché.</h2>
                <p style={{ fontSize: isSmallMobile ? "0.85rem" : "0.95rem" }}>Découvrez pourquoi BPER Banca reste le choix n°1 des emprunteurs cette année avec une gestion 100% flexible et transparente.</p>
                <button onClick={() => navigateToView("avantages")} className="btn-white" style={{ border: "none", cursor: "pointer", fontWeight: "bold" }}>
                  En savoir plus
                </button>
              </div>
            </div>
          </div>

          {/* --- SECTION TABLEAU D'AMORTISSEMENT ADAPTÉ AUX SMARTPHONES COMPACTS (IPHONE SE) --- */}
          <div style={{ background: "#fff", padding: isDesktop ? "30px" : (isSmallMobile ? "12px" : "15px"), borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ background: "#004f52", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fas fa-calculator" style={{ fontSize: "1rem" }}></i>
              </div>
              <div>
                <h3 style={{ color: "#004f52", margin: 0, fontSize: isSmallMobile ? "1.1rem" : "1.3rem", fontWeight: "700" }}>Tableau d'Amortissement</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.75rem" }}>Tarification Décès/Incapacité calculée à 0,60% du capital.</p>
              </div>
            </div>

            {/* Inputs de contrôle du Tableau : Passage en flex-column sur iPhone SE */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", background: "#f8fafc", padding: isSmallMobile ? "12px" : "20px", borderRadius: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Capital Emprunté (€)</label>
                <input 
                  type="number" 
                  className="bper-full-input" 
                  style={{ fontSize: "0.9rem", padding: "10px" }}
                  value={interactiveAmount === 0 ? "" : interactiveAmount} 
                  placeholder="Ex: 200000"
                  onChange={(e) => {
                    const v = e.target.value;
                    setInteractiveAmount(v === "" ? "" : parseFloat(v));
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Durée de l'amortissement (Années)</label>
                <input 
                  type="number" 
                  className="bper-full-input" 
                  style={{ fontSize: "0.9rem", padding: "10px" }}
                  value={interactiveYears === 0 ? "" : interactiveYears} 
                  placeholder="Ex: 20"
                  onChange={(e) => {
                    const y = e.target.value;
                    setInteractiveYears(y === "" ? "" : parseInt(y));
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Grille de Taux BPER Banca</label>
                <select 
                  className="bper-full-input" 
                  style={{ fontSize: "0.9rem", padding: "10px" }}
                  value={interactiveRateType} 
                  onChange={(e) => setInteractiveRateType(e.target.value)}
                >
                  <option value="FIXE">Taux Fixe Référentiel (4.25%)</option>
                  <option value="VARIABLE">Taux Variable Euribor (4.55%)</option>
                </select>
              </div>
            </div>

            {/* Fiche de Synthèse d'Amortissement : Adaptation Grille 2x2 pour iPhone SE */}
            <div style={{ display: "grid", gridTemplateColumns: isSmallMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "25px" }}>
              <div style={{ padding: "10px", background: "#f0f7f7", borderRadius: "12px", borderLeft: "3px solid #004f52" }}>
                <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block", marginBottom: "2px" }}>Mensualité</span>
                <strong style={{ color: "#004f52", fontSize: isSmallMobile ? "1rem" : "1.2rem", fontWeight: "700" }}>{summaryMetrics.monthlyBox} €</strong>
              </div>
              <div style={{ padding: "10px", background: "#fbf7f0", borderRadius: "12px", borderLeft: "3px solid #d97706" }}>
                <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block", marginBottom: "2px" }}>Ass. (0.60% an)</span>
                <strong style={{ color: "#b45309", fontSize: isSmallMobile ? "1rem" : "1.2rem", fontWeight: "700" }}>+{summaryMetrics.insuranceBox} €</strong>
              </div>
              <div style={{ padding: "10px", background: "#fef2f2", borderRadius: "12px", borderLeft: "3px solid #dc2626" }}>
                <span style={{ fontSize: "0.7rem", color: "#b91c1c", display: "block", marginBottom: "2px" }}>Total Intérêts</span>
                <strong style={{ color: "#dc2626", fontSize: isSmallMobile ? "1rem" : "1.2rem", fontWeight: "700" }}>{summaryMetrics.totalInterest} €</strong>
              </div>
              <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "12px", borderLeft: "3px solid #64748b" }}>
                <span style={{ fontSize: "0.7rem", color: "#475569", display: "block", marginBottom: "2px" }}>Total Assur.</span>
                <strong style={{ color: "#334155", fontSize: isSmallMobile ? "1rem" : "1.2rem", fontWeight: "700" }}>{summaryMetrics.totalInsurance} €</strong>
              </div>
            </div>

            {/* Structure du Tableau - Défilement Horizontal Strict */}
            <div style={{ overflowX: "auto", width: "100%", maxHeight: "350px", border: "1px solid #e2e8f0", borderRadius: "12px", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem", minWidth: "580px" }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 1 }}>
                  <tr style={{ borderBottom: "2px solid #cbd5e1", color: "#475569" }}>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Échéance</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Prélèvement Total</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Amort. Capital</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Intérêts Élus</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Assurance (0.60%)</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Restant Dû</th>
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
                      <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "#94a3b8" }}>Veuillez configurer un capital et une durée valides.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: "15px", gap: "12px" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", fontStyle: "italic", lineHeight: "1.4" }}>
                * Tableau d'amortissement prévisionnel indicatif présentant les 12 premières échéances mensuelles. L'assurance emprunteur obligatoire est calculée au taux annuel fixe de 0,60% sur le capital initial.
              </p>
              <button 
                onClick={() => {
                  setLoanData({
                    ...loanData,
                    loanType: interactiveAmount > 75000 ? "Crédit Immobilier BPER (Achat Résidence)" : "Prêt Personnel Multi-Projets",
                    amount: interactiveAmount,
                    duration: interactiveYears * 12,
                    monthlyPayment: summaryMetrics.monthlyBox + summaryMetrics.insuranceBox
                  });
                  navigateToView("simulateur");
                }}
                style={{ background: "#004f52", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", width: "100%", textAlign: "center" }}
              >
                Injecter dans mon dossier de crédit
              </button>
            </div>
          </div>
          {/* --------------------------------------------------------------------------------------------------------- */}

          <div className="account-card" style={{ background: "#fff", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <h3 style={{ color: "#004f52", margin: "0 0 4px 0", fontSize: "1.15rem" }}>Livret d'Épargne BPER Privilège</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem" }}>Optimisez et sécurisez vos économies avec un taux garanti.</p>
              </div>
              <span style={{ background: "#f0fdf4", color: "#166534", padding: "6px 12px", borderRadius: "30px", fontWeight: "bold", fontSize: "0.8rem", alignSelf: "flex-start" }}>Rendement : 3.50%</span>
            </div>
          </div>
        </>
      )}

      {/* VUE 2 : AVANTAGES */}
      {currentView === "avantages" && (
        <div className="bper-advantages-view" style={{ padding: isSmallMobile ? "10px" : "" }}>
          <button onClick={() => navigateToView("offres")} className="btn-bper-back-top">
            <i className="fas fa-arrow-left"></i> Retour
          </button>

          <h2 style={{ color: "#004f52", fontSize: isSmallMobile ? "1.5rem" : "2.2rem", marginTop: "15px", marginBottom: "15px" }}>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "30px" }}>
            Nous réinventons le crédit à la consommation. Pas de frais cachés, une flexibilité absolue sur vos mensualités et un taux d'intérêt hautement compétitif.
          </p>

          <div className="bper-advantages-grid" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", borderTop: "4px solid #004f52" }}>
              <h4 style={{ color: "#004f52", fontSize: "1.05rem", margin: "0 0 8px 0" }}>Mensualités Modulables</h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Modifiez le montant de vos remboursements gratuitement, deux fois par an.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", borderTop: "4px solid #059669" }}>
              <h4 style={{ color: "#059669", fontSize: "1.05rem", margin: "0 0 8px 0" }}>Zéro Frais de Dossier</h4>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>Aucuns frais administratifs ne vous seront facturés pour l'ouverture.</p>
            </div>
          </div>

          <div className="bper-cta-box" style={{ padding: "20px", marginTop: "25px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "1.25rem" }}>Prêt à démarrer ?</h3>
            <button onClick={() => navigateToView("simulateur")} style={{ fontSize: "0.9rem", padding: "12px" }}>
              Faire ma demande en ligne
            </button>
          </div>
        </div>
      )}

      {/* VUE 3 : TUNNEL SIMULATEUR */}
      {currentView === "simulateur" && (
        <div className="bper-loan-container" style={{ padding: isSmallMobile ? "4px" : "" }}>
          
          <div className="bper-loan-steps" style={{ fontSize: "0.75rem", gap: "5px" }}>
            <div className="bper-step-item" style={{ color: loanStep === 1 ? "#004f52" : "#94a3b8", paddingBottom: "4px" }}>1. CONFIG</div>
            <div className="bper-step-item" style={{ color: loanStep === 2 ? "#004f52" : "#94a3b8", paddingBottom: "4px" }}>2. INFOS</div>
            <div className="bper-step-item" style={{ color: loanStep === 3 ? "#004f52" : "#94a3b8", paddingBottom: "4px" }}>3. CONFIRM</div>
          </div>

          <div className="bper-loan-card" style={{ background: "#fff", padding: "20px 15px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            <h2 style={{ color: "#004f52", marginBottom: "4px", fontSize: "1.35rem" }}>Demande de Financement</h2>
            <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "20px" }}>BPER Banca — Traitement Numérique</p>

            {/* ÉTAPE 1 */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem" }}>Nature du projet</label>
                  <select 
                    className="bper-full-input"
                    style={{ fontSize: "0.85rem" }}
                    value={loanData.loanType}
                    onChange={(e) => {
                      const selectedType = e.target.value;
                      handleSimulation(loanData.amount, loanData.duration, selectedType, hypoRateType, hypoContribution);
                    }}
                  >
                    <option value="Prêt Personnel Multi-Projets">Prêt Personnel Multi-Projets</option>
                    <option value="Prêt Automobile (Véhicule Neuf / Hybride)">Prêt Automobile</option>
                    <option value="Crédit Immobilier BPER (Achat Résidence)">Crédit Immobilier BPER</option>
                    <option value="Financement Trésorerie & Ligne Pro">Ligne Professionnelle</option>
                  </select>
                </div>

                {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem" }}>Type de taux</label>
                      <select className="bper-full-input" value={hypoRateType} onChange={(e) => setHypoRateType(e.target.value)}>
                        <option value="FIXE">Taux Fixe (4.25%)</option>
                        <option value="VARIABLE">Taux Variable (4.55%)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem" }}>Apport personnel (€)</label>
                      <input type="number" className="bper-full-input" value={hypoContribution} onChange={(e) => setHypoContribution(parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem" }}>Montant (€)</label>
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
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.85rem" }}>Durée (mois)</label>
                    <select 
                      className="bper-full-input"
                      value={loanData.duration}
                      onChange={(e) => handleSimulation(loanData.amount, e.target.value, loanData.loanType, hypoRateType, hypoContribution)}
                    >
                      <option value="12">12 mois</option>
                      <option value="24">24 mois</option>
                      <option value="36">36 mois</option>
                      <option value="48">48 mois</option>
                      <option value="60">60 mois</option>
                      {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) && (
                        <option value="240">240 mois (20 ans)</option>
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ background: "#f0f7f7", padding: "15px", borderRadius: "12px", borderLeft: "4px solid #004f52", marginTop: "20px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Mensualité Estimée</span>
                  <p style={{ margin: 0, fontSize: "1.35rem", fontWeight: "bold", color: "#004f52" }}>
                    {loanData.monthlyPayment} €
                  </p>
                </div>

                <div className="bper-actions-wrapper" style={{ gap: "10px" }}>
                  <button className="btn-bper-back" onClick={() => navigateToView("offres")}>Retour</button>
                  <button className="btn-bper-submit" style={{ background: "#004f52", color: "#fff" }} onClick={() => { setLoanStep(2); window.scrollTo({top: 0}); }}>Constituer</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {loanStep === 2 && (
              <div>
                <h4 style={{ color: "#004f52", marginBottom: "12px", fontSize: "1rem" }}>Situation Personnelle</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>Profession</label>
                    <select className="bper-full-input" value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
                      <option value="Salarié secteur privé (CDI)">Salarié CDI</option>
                      <option value="Profession Libérale / Indépendant">Indépendant</option>
                      <option value="Chef d'entreprise / Cadre">Chef d'entreprise</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>Nom du demandeur</label>
                    <input type="text" className="bper-full-input" value={loanData.lastName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.8rem" }}>Revenus nets mensuels (€)</label>
                    <input type="number" placeholder="Ex: 3100" className="bper-full-input" value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>
                </div>

                <div className="bper-actions-wrapper" style={{ marginTop: "20px", gap: "10px" }}>
                  <button className="btn-bper-back" onClick={() => { setLoanStep(1); window.scrollTo({top: 0}); }}>Retour</button>
                  <button className="btn-bper-submit" style={{ background: "#004f52", color: "#fff" }} disabled={!loanData.lastName || !loanData.income} onClick={() => { setLoanStep(3); window.scrollTo({top: 0}); }}>Suivant</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 */}
            {loanStep === 3 && (
              <div>
                <div className="bper-summary-box" style={{ padding: "12px", fontSize: "0.85rem" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#004f52" }}>Récapitulatif contractuel</h4>
                  <p style={{ margin: "4px 0" }}><strong>Projet :</strong> {loanData.loanType}</p>
                  <p style={{ margin: "4px 0" }}><strong>Titulaire :</strong> {loanData.lastName} {loanData.firstName}</p>
                  <p style={{ margin: "4px 0" }}><strong>Montant Net :</strong> {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? Math.max(0, loanData.amount - hypoContribution) : loanData.amount} €</p>
                  <p style={{ margin: "4px 0" }}><strong>Mensualité :</strong> {loanData.monthlyPayment} €</p>
                </div>

                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "15px 0", lineHeight: "1.4" }}>
                  Soumission réglementaire à <strong>BPER Banca</strong>. Analyse de conformité sous 48h.
                </p>

                <div className="bper-actions-wrapper" style={{ gap: "10px" }}>
                  <button className="btn-bper-back" onClick={() => { setLoanStep(2); window.scrollTo({top: 0}); }}>Éditer</button>
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
                          alert(resData.message || "Demande transmise !");
                          navigateToView("offres");
                          setLoanStep(1);
                        } else {
                          alert(resData.message || "Erreur lors du traitement.");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Impossible de contacter le serveur distant.");
                      }
                    }}
                  >
                    Confirmer
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