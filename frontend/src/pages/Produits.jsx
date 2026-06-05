import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom"; 
import "../styles/produits.css";

// ==========================================
// 1. COMPOSANT DE SIGNATURE ÉLECTRONIQUE (BIC)
// ==========================================
function BperSignaturePad({ onSave, onClear, contractRead, onAttemptWithoutReading }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penPos, setPenPos] = useState({ x: 0, y: 0 });
  const [showPen, setShowPen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Configuration encre bleue Bic Réelle
    ctx.strokeStyle = "#002f34"; 
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const preventScroll = (e) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };

    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    canvas.addEventListener("touchend", preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
      canvas.removeEventListener("touchend", preventScroll);
    };
  }, []);

  const updatePenPosition = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setPenPos({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return { 
        x: e.touches[0].clientX - rect.left, 
        y: e.touches[0].clientY - rect.top 
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (!contractRead) {
      e.preventDefault();
      onAttemptWithoutReading();
      return;
    }
    const { x, y } = getCanvasCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    
    updatePenPosition(e);
    setShowPen(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
    
    updatePenPosition(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setShowPen(false);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  const clearCanvas = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div style={{ marginTop: "15px" }}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "bold", color: "#004f52", marginBottom: "5px" }}>
        Signature Électronique Obligatoire (Écran tactile ou Souris) :
      </label>
      <div 
        ref={containerRef}
        onClick={() => { if(!contractRead) onAttemptWithoutReading(); }}
        style={{ 
          border: contractRead ? "2px dashed #004f52" : "2px dashed #dc2626", 
          borderRadius: "8px", 
          background: contractRead ? "#f8fafc" : "#fef2f2", 
          overflow: "hidden", 
          position: "relative",
          touchAction: "none"
        }}
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={130}
          style={{ width: "100%", height: "130px", display: "block", cursor: "none", touchAction: "none" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {showPen && (
          <div
            style={{
              position: "absolute",
              left: `${penPos.x}px`,
              top: `${penPos.y}px`,
              transform: "translate(-4px, -36px) rotate(-15deg)", 
              pointerEvents: "none",
              zIndex: 999
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3L21 5L10 16L7 17L8 14L19 3Z" fill="#1e40af" stroke="#ffffff" strokeWidth="1" />
              <path d="M7 17L4 20L3 21L4 19L7 17Z" fill="#002f34" />
              <circle cx="3" cy="21" r="1.5" fill="#002f34" />
            </svg>
          </div>
        )}

        {!contractRead && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(254, 242, 242, 0.85)", color: "#b91c1c", fontSize: "0.75rem", fontWeight: "bold", padding: "10px", textAlign: "center" }}>
            ⚠️ Signature bloquée : Veuillez d'abord lire le contrat ci-dessus
          </div>
        )}
      </div>
      <button 
        onClick={clearCanvas}
        disabled={!contractRead}
        style={{ marginTop: "5px", background: contractRead ? "#ef4444" : "#cbd5e1", color: "#fff", border: "none", padding: "4px 10px", fontSize: "0.7rem", borderRadius: "4px", cursor: contractRead ? "pointer" : "not-allowed" }}
      >
        Effacer la signature
      </button>
    </div>
  );
}

// ==========================================
// 2. COMPOSANT PRINCIPAL : PRODUITS
// ==========================================
export default function Produits({ isDesktop = false }) {
  const { setForceHideNav } = useOutletContext() || {};

  const [currentView, setCurrentView] = useState("offres"); 
  const [loanStep, setLoanStep] = useState(1);
  const [signatureBase64, setSignatureBase64] = useState("");
  
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [showSignatureAlert, setShowSignatureAlert] = useState(false);

  // Initialisation par défaut propre de la structure de données
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

  // États pour la grille de simulation interactive complète
  const [interactiveAmount, setInteractiveAmount] = useState(200000);
  const [interactiveYears, setInteractiveYears] = useState(20);
  const [interactiveRateType, setInteractiveRateType] = useState("FIXE");
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({ monthlyBox: 0, totalInterest: 0, insuranceBox: 0, totalInsurance: 0 });

  const [hypoRateType, setHypoRateType] = useState("FIXE"); 
  const [hypoContribution, setHypoContribution] = useState(0); 

  // Algorithme complet de calcul du tableau d'amortissement réglementaire (A à Z)
  useEffect(() => {
    const principal = parseFloat(interactiveAmount) || 0;
    const months = (parseInt(interactiveYears) || 1) * 12;
    const annualRate = interactiveRateType === "FIXE" ? 0.0425 : 0.0455;
    const monthlyRate = annualRate / 12;
    
    let monthlyPAndI = 0;
    if (principal > 0 && months > 0) {
      monthlyPAndI = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    }

    const annualInsuranceCost = principal * 0.0060;
    const insuranceM = Math.round(annualInsuranceCost / 12); 
    const totalInsuranceCost = insuranceM * months;

    let remainingPrincipal = principal;
    const schedule = [];
    let accumulatedInterest = 0;
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

  // Logique de simulation des formulaires de tunnel
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

  // =========================================================================
  // CORRECTION DIRECTE DU BUG : FILTRAGE STRICT DE LA BDD (ANTI-"CÉLIBATAIRE")
  // =========================================================================
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
          
          // On vérifie si la base de données renvoie par erreur un état civil au lieu d'un emploi
          const incomingProf = dbUser.situationProfessionnelle || "";
          const isInvalidProf = ["célibataire", "marié", "mariée", "divorcé", "divorcée", "veuf", "veuve"]
            .some(status => incomingProf.toLowerCase().includes(status));

          setLoanData(prev => ({
            ...prev,
            lastName: dbUser.nom || "",
            firstName: dbUser.prenom || "",
            email: dbUser.email || "",        
            telephone: dbUser.telephone || "", 
            // SI LA BDD CRASHE AVEC "CÉLIBATAIRE", ON CONSERVE LA PROFESSION SÉLECTIONNÉE PAR LE CLIENT
            profession: (incomingProf && !isInvalidProf) ? incomingProf : prev.profession
          }));
        }
      } catch (error) {
        console.error("Erreur de récupération Atlas :", error);
      }
    };
    loadRealUserData();
  }, []);

  useEffect(() => {
    if (setForceHideNav) {
      setForceHideNav(currentView === "avantages" || currentView === "simulateur" || isContractModalOpen);
    }
  }, [currentView, setForceHideNav, isContractModalOpen]);

  const navigateToView = (viewName) => {
    setCurrentView(viewName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const triggerSignatureAlert = () => {
    setShowSignatureAlert(true);
    window.scrollTo({ top: 100, behavior: "smooth" });
    setTimeout(() => setShowSignatureAlert(false), 5000);
  };

  const responsiveInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    fontSize: isDesktop ? "0.9rem" : "0.85rem",
    lineHeight: "1.4",
    height: "auto", 
    minHeight: "42px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#fff"
  };

  return (
    <div className={isDesktop ? "bper-page-container" : "page-contente bper-page-container"} style={{ padding: isDesktop ? "30px" : "10px", width: "100%", boxSizing: "border-box" }}>
      
      {/* ==========================================
          VUE 1 : GRILLE DES OFFRES & ACCUEIL
          ========================================== */}
      {currentView === "offres" && (
        <>
          <h2 className="cards-title" style={{ color: "#004f52", fontSize: isDesktop ? "2rem" : "1.4rem", marginBottom: "20px", paddingLeft: isDesktop ? "0" : "5px" }}>
            Nos Solutions de Financement & Épargne
          </h2>

          <div className="bper-promo-card-grid" style={{ gap: isDesktop ? "20px" : "12px", marginBottom: "20px" }}>
            <div className="promo-image-wrapper" style={{ height: isDesktop ? "auto" : "180px" }}>
              <img src="pret-velo.png" alt="BPER Crédits et Assurances" className="promo-image" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div className="promo-badge" style={{ transform: isDesktop ? "scale(1)" : "scale(0.85)", originX: "right", right: isDesktop ? "20px" : "10px" }}>
                <span className="badge-small">TAEG FIXE</span>
                <span className="badge-big">4.90%</span>
                <span className="badge-old">5.85%</span>
                <span className="badge-label">Exclusivité BPER</span>
              </div>
            </div>

            <div className="promo-card-visual dark">
              <div className="promo-text-dark" style={{ padding: isDesktop ? "20px" : "15px" }}>
                <div className="promo-tag" style={{ fontSize: isDesktop ? "0.9rem" : "0.75rem" }}>
                  <span className="promo-icon"><i className="fas fa-percentage" style={{ color: "#fff" }}></i></span>
                  <span>CRÉDIT PARTICULIER ET AUTO</span>
                </div>
                <h2 style={{ fontSize: isDesktop ? "1.6rem" : "1.15rem", lineHeight: "1.3", margin: "10px 0" }}>Financez vos ambitions au meilleur taux du marché.</h2>
                <p style={{ fontSize: isDesktop ? "1rem" : "0.8rem", lineHeight: "1.4" }}>Découvrez pourquoi BPER Banca reste le choix n°1 des emprunteurs cette année avec une gestion 100% flexible et transparente.</p>
                <button onClick={() => navigateToView("avantages")} className="btn-white" style={{ border: "none", cursor: "pointer", fontWeight: "bold", padding: "10px 24px", fontSize: "0.85rem", width: isDesktop ? "auto" : "100%" }}>
                  En savoir plus
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATEUR TABLEAU D'AMORTISSEMENT ACCUEIL */}
          <div style={{ background: "#fff", padding: isDesktop ? "30px" : "12px", borderRadius: "18px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
              <div style={{ background: "#004f52", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className="fas fa-calculator" style={{ fontSize: "1rem" }}></i>
              </div>
              <div>
                <h3 style={{ color: "#004f52", margin: 0, fontSize: isDesktop ? "1.3rem" : "1rem", fontWeight: "700" }}>Tableau d'Amortissement Réglementaire</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.75rem" }}>Outil de simulation d'encours mis à jour avec la tarification Décès/Incapacité de 0,60%.</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "15px", background: "#f8fafc", padding: isDesktop ? "20px" : "12px", borderRadius: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Capital Emprunté (€)</label>
                <input 
                  type="number" 
                  style={responsiveInputStyle}
                  value={interactiveAmount === 0 ? "" : interactiveAmount} 
                  placeholder="Ex: 200000"
                  onChange={(e) => {
                    const v = e.target.value;
                    setInteractiveAmount(v === "" ? "" : parseFloat(v));
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Durée de l'amortissement (Années)</label>
                <input 
                  type="number" 
                  style={responsiveInputStyle}
                  value={interactiveYears === 0 ? "" : interactiveYears} 
                  placeholder="Ex: 20"
                  onChange={(e) => {
                    const y = e.target.value;
                    setInteractiveYears(y === "" ? "" : parseInt(y));
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Grille de Taux BPER Banca</label>
                <select 
                  style={responsiveInputStyle}
                  value={interactiveRateType} 
                  onChange={(e) => setInteractiveRateType(e.target.value)}
                >
                  <option value="FIXE">Taux Fixe Référentiel (4.25%)</option>
                  <option value="VARIABLE">Taux Variable Euribor (4.55%)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: "8px", marginBottom: "20px" }}>
              <div style={{ padding: "10px 8px", background: "#f0f7f7", borderRadius: "10px", borderLeft: "3px solid #004f52" }}>
                <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Mensualité (Hors Ass.)</span>
                <strong style={{ color: "#004f52", fontSize: isDesktop ? "1.2rem" : "0.95rem", fontWeight: "700" }}>{summaryMetrics.monthlyBox} €</strong>
              </div>
              <div style={{ padding: "10px 8px", background: "#fbf7f0", borderRadius: "10px", borderLeft: "3px solid #d97706" }}>
                <span style={{ fontSize: "0.65rem", color: "#64748b", display: "block" }}>Assurance (0.60% an)</span>
                <strong style={{ color: "#b45309", fontSize: isDesktop ? "1.2rem" : "0.95rem", fontWeight: "700" }}>+{summaryMetrics.insuranceBox} €/m</strong>
              </div>
              <div style={{ padding: "10px 8px", background: "#fef2f2", borderRadius: "10px", borderLeft: "3px solid #dc2626" }}>
                <span style={{ fontSize: "0.65rem", color: "#b91c1c", display: "block" }}>Total Intérêts Dus</span>
                <strong style={{ color: "#dc2626", fontSize: isDesktop ? "1.2rem" : "0.95rem", fontWeight: "700" }}>{summaryMetrics.totalInterest} €</strong>
              </div>
              <div style={{ padding: "10px 8px", background: "#f8fafc", borderRadius: "10px", borderLeft: "3px solid #64748b" }}>
                <span style={{ fontSize: "0.65rem", color: "#475569", display: "block" }}>Total Assurances</span>
                <strong style={{ color: "#334155", fontSize: isDesktop ? "1.2rem" : "0.95rem", fontWeight: "700" }}>{summaryMetrics.totalInsurance} €</strong>
              </div>
            </div>

            <div style={{ overflowX: "auto", width: "100%", maxHeight: "300px", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem", minWidth: "580px" }}>
                <thead style={{ position: "sticky", top: 0, background: "#f8fafc", zIndex: 1 }}>
                  <tr style={{ borderBottom: "2px solid #cbd5e1", color: "#475569" }}>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Échéance</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Prélèvement Total</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Amortissement Capital</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Intérêts Élus</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Ass. Décès/Incap (0.60%)</th>
                    <th style={{ padding: "10px 8px", fontWeight: "600" }}>Capital Restant Dû</th>
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

            <div style={{ display: "flex", flexDirection: "column", marginTop: "12px", gap: "12px" }}>
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
        </>
      )}

      {/* ==========================================
          VUE 2 : LES AVANTAGES PRODUITS
          ========================================== */}
      {currentView === "avantages" && (
        <div style={{ padding: isDesktop ? "20px" : "5px" }}>
          <button onClick={() => navigateToView("offres")} className="btn-bper-back-top" style={{ fontSize: "0.85rem", marginBottom: "15px", background: "none", border: "none", color: "#004f52", cursor: "pointer" }}>
            <i className="fas fa-arrow-left"></i> Retour aux offres de crédit
          </button>
          
          <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <h2 style={{ color: "#004f52", marginTop: 0 }}>Pourquoi choisir l'offre de financement BPER Banca ?</h2>
            <p style={{ color: "#475569", fontSize: "0.9rem" }}>
              BPER Banca vous offre l'un des parcours numériques les plus fluides et sécurisés d'Europe pour la réalisation de vos projets.
            </p>
            
            <ul style={{ paddingLeft: "20px", color: "#334155", fontSize: "0.85rem", lineHeight: "1.8" }}>
              <li><strong>Modularité :</strong> Possibilité de suspendre ou modifier vos échéances deux fois par an sans frais supplémentaires.</li>
              <li><strong>Zéro frais de dossier :</strong> Pour toute demande de prêt personnel réalisée en ligne depuis votre espace sécurisé.</li>
              <li><strong>Assurance intégrée :</strong> Couverture maximale à taux préférentiel de 0.60% annuel protégeant vos proches.</li>
              <li><strong>Déblocage Express :</strong> Les fonds sont mis à votre disposition sous 48 heures ouvrées après acceptation finale de votre dossier.</li>
            </ul>

            <button 
              onClick={() => navigateToView("simulateur")} 
              style={{ marginTop: "20px", padding: "12px", width: "100%", background: "#004f52", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
            >
              Démarrer ma demande de prêt immédiate
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          VUE 3 : TUNNEL DE CONFIGURATION DE DOSSIER
          ========================================== */}
      {currentView === "simulateur" && (
        <div className="bper-loan-container" style={{ padding: 0 }}>
          <div className="bper-loan-steps" style={{ display: "flex", justifyItems: "center", justifyAll: "space-between", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
            <div style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", fontWeight: "700", paddingBottom: "6px", color: loanStep === 1 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #004f52" : "none" }}>1. CONFIGURATION</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", fontWeight: "700", paddingBottom: "6px", color: loanStep === 2 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #004f52" : "none" }}>2. INFORMATIONS</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", fontWeight: "700", paddingBottom: "6px", color: loanStep === 3 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #004f52" : "none" }}>3. CONTRAT & SIGNATURE</div>
          </div>

          <div style={{ background: "#fff", padding: "15px 12px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            
            {/* TUNNEL ÉTAPE 1 : PROJET */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>Nature de votre projet</label>
                  <select style={responsiveInputStyle} value={loanData.loanType} onChange={(e) => handleSimulation(loanData.amount, loanData.duration, e.target.value, hypoRateType, hypoContribution)}>
                    <option value="Prêt Personnel Multi-Projets">Prêt Personnel Multi-Projets</option>
                    <option value="Prêt Automobile (Véhicule Neuf / Hybride)">Prêt Automobile (Véhicule Neuf / Hybride)</option>
                    <option value="Prêt Travaux & Éco-Rénovation">Prêt Travaux & Éco-Rénovation</option>
                    <option value="Crédit Immobilier BPER (Achat Résidence)">Crédit Immobilier BPER (Achat Résidence)</option>
                  </select>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>Montant recherché (€)</label>
                  <input type="number" style={responsiveInputStyle} value={loanData.amount || ""} onChange={(e) => handleSimulation(e.target.value, loanData.duration, loanData.loanType, hypoRateType, hypoContribution)} />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>Période de remboursement (mois)</label>
                  <select style={responsiveInputStyle} value={loanData.duration} onChange={(e) => handleSimulation(loanData.amount, e.target.value, loanData.loanType, hypoRateType, hypoContribution)}>
                    <option value="12">12 mois</option>
                    <option value="24">24 mois</option>
                    <option value="36">36 mois</option>
                    <option value="48">48 mois</option>
                    <option value="60">60 mois</option>
                  </select>
                </div>

                <div style={{ background: "#f0f7f7", padding: "15px", borderRadius: "10px", margin: "20px 0" }}>
                  <h4 style={{ margin: 0, color: "#004f52", fontSize: "0.85rem" }}>Engagement Mensuel Estimé</h4>
                  <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: "bold", color: "#004f52" }}>{loanData.monthlyPayment} € / mois</p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => navigateToView("offres")} style={{ flex: 1, height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Retour</button>
                  <button onClick={() => { setLoanStep(2); window.scrollTo({top:0}); }} style={{ flex: 1, height: "42px", background: "#004f52", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Suivant</button>
                </div>
              </div>
            )}

            {/* TUNNEL ÉTAPE 2 : INFORMATIONS ET PROFESSION */}
            {loanStep === 2 && (
              <div>
                <h4 style={{ color: "#004f52", marginBottom: "12px" }}>Situation Personnelle & Financière</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>Civilité</label>
                    <select style={responsiveInputStyle} value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </select>
                  </div>
                  
                  {/* SELECTEUR CRUCIAL : CHOIX DE LA PROFESSION PAR LE CLIENT */}
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem", fontWeight: "bold", color: "#004f52" }}>Profession du client</label>
                    <select 
                      style={{ ...responsiveInputStyle, border: "2px solid #004f52", fontWeight: "600" }} 
                      value={loanData.profession} 
                      onChange={(e) => setLoanData({...loanData, profession: e.target.value})}
                    >
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
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>Nom</label>
                    <input type="text" style={{ ...responsiveInputStyle, background: "#f1f5f9" }} value={loanData.lastName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>Prénom</label>
                    <input type="text" style={{ ...responsiveInputStyle, background: "#f1f5f9" }} value={loanData.firstName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>Revenus nets par mois (€)</label>
                    <input type="number" style={responsiveInputStyle} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button onClick={() => { setLoanStep(1); window.scrollTo({top:0}); }} style={{ flex: 1, height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Retour</button>
                  <button onClick={() => { setLoanStep(3); window.scrollTo({top:0}); }} style={{ flex: 1, height: "42px", background: "#004f52", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Suivant</button>
                </div>
              </div>
            )}

            {/* TUNNEL ÉTAPE 3 : VERIFICATION, LECTURE CONTRAT & SIGNATURE */}
            {loanStep === 3 && (
              <div>
                {showSignatureAlert && (
                  <div style={{ background: "#fecaca", color: "#991b1b", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "15px", fontWeight: "bold" }}>
                    ❌ Action Interdite : Vous devez impérativement cliquer sur le bouton "Lire le contrat avant de signer".
                  </div>
                )}

                <div style={{ padding: "12px", borderRadius: "10px", background: "#f0fdf4", marginBottom: "15px", border: "1px solid #bbf7d0" }}>
                  <p style={{ margin: "4px 0", fontSize: "0.8rem" }}><strong>Nature du projet sélectionné :</strong> {loanData.loanType}</p>
                  <p style={{ margin: "4px 0", fontSize: "0.8rem" }}><strong>Titulaire du compte :</strong> {loanData.civility} {loanData.lastName} {loanData.firstName}</p>
                  <p style={{ margin: "4px 0", fontSize: "0.8rem" }}><strong>Profession à insérer au contrat :</strong> <span style={{ color: "#004f52", fontWeight: "bold", background: "#ccfbf1", padding: "2px 6px", borderRadius: "4px" }}>{loanData.profession}</span></p>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  {hasReadContract ? (
                    <button type="button" disabled style={{ width: "100%", padding: "14px", borderRadius: "8px", background: "#ecfdf5", color: "#059669", fontWeight: "bold", border: "1px solid #059669" }}>
                      ✔️ Document Contractuel Lu et Accepté
                    </button>
                  ) : (
                    <button type="button" onClick={() => setIsContractModalOpen(true)} style={{ width: "100%", padding: "14px", borderRadius: "8px", background: "#d97706", color: "#fff", fontWeight: "bold", border: "none", cursor: "pointer" }}>
                      📑 Lire le contrat avant de signer
                    </button>
                  )}
                </div>

                <BperSignaturePad 
                  contractRead={hasReadContract}
                  onAttemptWithoutReading={triggerSignatureAlert}
                  onSave={(base64) => setSignatureBase64(base64)} 
                  onClear={() => setSignatureBase64("")} 
                />

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button onClick={() => { setLoanStep(2); setSignatureBase64(""); setHasReadContract(false); }} style={{ flex: 1, height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Modifier</button>
                  <button 
                    style={{ flex: 1, height: "42px", background: (signatureBase64 && hasReadContract) ? "#059669" : "#94a3b8", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: (signatureBase64 && hasReadContract) ? "pointer" : "not-allowed" }}
                    disabled={!signatureBase64 || !hasReadContract}
                    onClick={async () => {
                      const finalPayload = { ...loanData, signatureData: signatureBase64 };
                      const response = await fetch("/api/auth/apply-loan", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                        body: JSON.stringify(finalPayload)
                      });
                      if (response.ok) {
                        alert("Contrat signé et envoyé avec succès !");
                        navigateToView("offres");
                        setLoanStep(1);
                        setSignatureBase64("");
                        setHasReadContract(false);
                      }
                    }}
                  >
                    Valider & Signer le Contrat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          4. MODALE COMPLÈTE DU CONTRAT JURIDIQUE
          ========================================== */}
      {isContractModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "#f1f5f9", zIndex: 9999, display: "flex", flexDirection: "column", fontFamily: "'Times New Roman', Times, serif" }}>
          <div style={{ background: "#004f52", padding: "15px 20px", display: "flex", justifyContent: "space-between", color: "#fff", alignItems: "center" }}>
            <span style={{ fontSize: "1.4rem", fontWeight: "bold", letterSpacing: "1px" }}>BPER: Banca</span>
            <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px" }}>RÉFÉRENCE UNIQUE : BPER-CONTRACT-2026</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "15px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: "800px", padding: "35px 25px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", color: "#000", fontSize: "0.95rem", lineHeight: "1.6", textAlign: "justify" }}>
              
              <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #004f52", paddingBottom: "15px" }}>
                <h1 style={{ fontSize: "1.6rem", color: "#004f52", margin: "0", textTransform: "uppercase" }}>Offre Préalable de Crédit</h1>
                <small style={{ color: "#475569", fontFamily: "sans-serif" }}>Contrat d'engagement établi selon la réglementation bancaire européenne</small>
              </div>

              {/* SECTION DES COORDONNÉES DU BÉNÉFICIAIRE - SANS ERREUR */}
              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", marginBottom: "25px", border: "1px solid #cbd5e1", fontFamily: "sans-serif", fontSize: "0.85rem" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#004f52", textTransform: "uppercase", fontSize: "0.8rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>Parties Contractantes</h4>
                <p style={{ margin: "4px 0" }}><strong>Organisme Prêteur :</strong> BPER Banca S.p.A., Siège social à Modène, Italie.</p>
                <p style={{ margin: "4px 0" }}><strong>Bénéficiaire (L'Emprunteur) :</strong> {loanData.civility} {loanData.lastName.toUpperCase()} {loanData.firstName}</p>
                
                {/* L'AFFICHAGE CI-DESSOUS LIT DIRECTEMENT LA VARIABLE SÉCURISÉE SANS LIEN AVEC LE STATUT MARITAL */}
                <p style={{ margin: "4px 0" }}><strong>Profession de l'emprunteur :</strong> <span style={{ color: "#004f52", fontWeight: "bold", fontSize: "1rem", background: "#e0f2f1", padding: "2px 6px", borderRadius: "4px" }}>{loanData.profession}</span></p>
                
                <p style={{ margin: "4px 0" }}><strong>Capacité Financière Déclarée :</strong> {loanData.income || "0"} EUR / mois</p>
              </div>

              {/* ENSEMBLE DES ARTICLES COMPLETS DU CONTRAT */}
              <h3 style={{ color: "#004f52", fontSize: "1.05rem", textTransform: "uppercase", marginTop: "20px" }}>ARTICLE 1 : OBJET DU FINANCEMENT & CLAUSES GÉNÉRALES</h3>
              <p>Le présent engagement stipule que l'organisme prêteur BPER Banca consent à l'emprunteur mentionné ci-dessus, qui l'accepte, un crédit d'un montant en capital total de <strong>{loanData.amount} EUR</strong> au titre de l'offre réglementée numérique dénommée "{loanData.loanType}". Le bénéficiaire s'engage à utiliser ces fonds conformément aux règles en vigueur.</p>

              <h3 style={{ color: "#004f52", fontSize: "1.05rem", textTransform: "uppercase", marginTop: "20px" }}>ARTICLE 2 : CONDITIONS DE REMBOURSEMENT & INTÉRÊTS</h3>
              <p>L'emprunteur s'engage formellement à rembourser l'intégralité du capital prêté sur une période d'amortissement globale fixée à <strong>{loanData.duration} mois</strong>. Les prélèvements s'effectueront automatiquement chaque mois sur les comptes référencés. La mensualité fixe et constante due est valorisée à <strong>{loanData.monthlyPayment} EUR par mois</strong>, comprenant le coût des assurances obligatoires de couverture d'encours.</p>

              <h3 style={{ color: "#004f52", fontSize: "1.05rem", textTransform: "uppercase", marginTop: "20px" }}>ARTICLE 3 : ASSURANCES & GARANTIES OBLIGATOIRES</h3>
              <p>Le contrat de financement est adossé à un contrat d'assurance collective Décès, Perte Totale et Irréversible d'Autonomie (PTIA), et Incapacité de Travail. Le taux annuel de l'assurance est calculé à hauteur de 0,60% sur le capital initial. L'emprunteur est couvert à hauteur de 100% de ses engagements financiers dès la validation définitive des pièces justificatives.</p>

              <h3 style={{ color: "#004f52", fontSize: "1.05rem", textTransform: "uppercase", marginTop: "20px" }}>ARTICLE 4 : DROIT DE RÉTRACTATION RÉGLEMENTAIRE</h3>
              <p>Conformément au code de la consommation en vigueur, l'emprunteur dispose d'un délai légal de rétractation de 14 jours calendaires révolus à compter du jour de l'acceptation de la présente offre. Pour exercer ce droit, l'emprunteur doit renvoyer le bordereau de rétractation dûment complété et signé au service client BPER Banca par lettre recommandée avec accusé de réception.</p>

              <h3 style={{ color: "#004f52", fontSize: "1.05rem", textTransform: "uppercase", marginTop: "20px" }}>ARTICLE 5 : CONSENTEMENT ÉLECTRONIQUE ET VALIDATION</h3>
              <p>En cochant la case finale de validation et en apposant sa signature sur l'interface sécurisée dédiée, l'emprunteur reconnaît avoir pris connaissance de l'ensemble des conditions générales et particulières de l'offre préalable de crédit. Le clic final de clôture vaut consentement exprès, irrévocable et signature électronique du contrat d'engagement.</p>
              
              <div style={{ marginTop: "40px", borderTop: "1px dashed #cbd5e1", paddingTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#475569", fontFamily: "sans-serif" }}>
                <span>Fait par voie numérique sécurisée</span>
                <span>BPER Banca S.p.A.</span>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", padding: "15px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "center", boxShadow: "0 -4px 10px rgba(0,0,0,0.05)" }}>
            <button
              type="button"
              onClick={() => {
                setHasReadContract(true);
                setIsContractModalOpen(false);
              }}
              style={{ width: "100%", maxWidth: "600px", padding: "14px", backgroundColor: "#004f52", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "0.95rem", cursor: "pointer", transition: "background 0.2s" }}
            >
              ✔️ J'ai lu le contrat en intégralité - Cliquer ici pour Valider
            </button>
          </div>
        </div>
      )}
    </div>
  );
}