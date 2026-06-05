import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom"; 
import "../styles/produits.css";

// --- COMPOSANT DE SIGNATURE RESPONSIVE (AVEC CURSEUR STYLO BIC RÉEL) ---
function BperSignaturePad({ onSave, onClear, contractRead, onAttemptWithoutReading }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Stockage de la position exacte du stylo Bic
  const [penPos, setPenPos] = useState({ x: 0, y: 0 });
  const [showPen, setShowPen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Configuration du tracé (Encre bleue Bic)
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

  // Calcul exact des coordonnées par rapport au conteneur de la zone de dessin
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
        
        {/* LE STYLO BIC BLEU EN SVG VECTORIEL INDESTRUCTIBLE */}
        {showPen && (
          <div
            style={{
              position: "absolute",
              left: `${penPos.x}px`,
              top: `${penPos.y}px`,
              transform: "translate(-4px, -36px) rotate(-15deg)", // Aligne la pointe du Bic pile sur le tracé
              pointerEvents: "none",
              zIndex: 999
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Corps du stylo Bic Cristal */}
              <path d="M19 3L21 5L10 16L7 17L8 14L19 3Z" fill="#1e40af" stroke="#ffffff" strokeWidth="1" />
              {/* Capuchon ou pointe encre bleue */}
              <path d="M7 17L4 20L3 21L4 19L7 17Z" fill="#002f34" />
              {/* Détail de la mine */}
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

export default function Produits({ isDesktop = false }) {
  const { setForceHideNav } = useOutletContext() || {};

  const [currentView, setCurrentView] = useState("offres"); 
  const [loanStep, setLoanStep] = useState(1);
  const [signatureBase64, setSignatureBase64] = useState("");
  
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [showSignatureAlert, setShowSignatureAlert] = useState(false);

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

  const [interactiveAmount, setInteractiveAmount] = useState(200000);
  const [interactiveYears, setInteractiveYears] = useState(20);
  const [interactiveRateType, setInteractiveRateType] = useState("FIXE");
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({ monthlyBox: 0, totalInterest: 0, insuranceBox: 0, totalInsurance: 0 });

  const [hypoRateType, setHypoRateType] = useState("FIXE"); 
  const [hypoContribution, setHypoContribution] = useState(0); 

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

  // CORRECTION DE L'INJECTION ATLAS POUR ÉVITER D'ÉCRASER LA PROFESSION PAR LE STATUT MARITAL
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
            // Si dbUser.situationProfessionnelle renvoie par erreur la situation familiale, on garde la valeur par défaut ou choisie par l'utilisateur
            profession: (dbUser.situationProfessionnelle && dbUser.situationProfessionnelle !== "Célibataire" && dbUser.situationProfessionnelle !== "Marié(e)") 
              ? dbUser.situationProfessionnelle 
              : prev.profession
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
      
      {/* VUE 1 : OFFRES ACCUEIL */}
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
                <p style={{ fontSize: isDesktop ? "1rem" : "0.8rem", lineHeight: "1.4" }}>Découvrez why BPER Banca reste le choix n°1 des emprunteurs cette année avec une gestion 100% flexible et transparente.</p>
                <button onClick={() => navigateToView("avantages")} className="btn-white" style={{ border: "none", cursor: "pointer", fontWeight: "bold", padding: "10px 16px", fontSize: "0.85rem", width: isDesktop ? "auto" : "100%" }}>
                  En savoir plus
                </button>
              </div>
            </div>
          </div>

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
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", fontStyle: "italic", lineHeight: "1.4" }}>
                * Tableau d'amortissement prévisionnel indicatif présentant les 12 premières échéances mensuelles. L'assurance emprunteur obligatoire (Décès, Perte Totale et Irréversible d'Autonomie, Invalidité Permanente) est calculée au taux annuel fixe de 0,60% sur le capital initial.
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

          <div className="account-card" style={{ background: "#fff", padding: "15px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <h3 style={{ color: "#004f52", margin: "0 0 4px 0", fontSize: "1.1rem" }}>Livret d'Épargne BPER Privilège</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.8rem", lineHeight: "1.3" }}>Optimisez et sécurisez vos économies avec un taux d'intérêt annuel brut de 3,50% garanti.</p>
              </div>
              <span style={{ background: "#f0fdf4", color: "#166534", padding: "6px 12px", borderRadius: "30px", fontWeight: "bold", fontSize: "0.8rem", alignSelf: "flex-start" }}>Rendement : 3.50%</span>
            </div>
          </div>
        </>
      )}

      {/* VUE 2 : AVANTAGES */}
      {currentView === "avantages" && (
        <div className="bper-advantages-view" style={{ padding: isDesktop ? "20px" : "5px" }}>
          <button onClick={() => navigateToView("offres")} className="btn-bper-back-top" style={{ fontSize: "0.85rem", marginBottom: "15px" }}>
            <i className="fas fa-arrow-left"></i> Retour aux produits
          </button>

          <h2 style={{ color: "#004f52", fontSize: isDesktop ? "2.2rem" : "1.35rem", marginTop: 0, marginBottom: "12px", lineHeight: "1.3" }}>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
          <p style={{ color: "#64748b", fontSize: isDesktop ? "1.1rem" : "0.85rem", lineHeight: "1.5", marginBottom: "25px" }}>
            Nous réinventons le crédit à la consommation. Pas de frais cachés, une flexibilité absolue sur vos mensualités et un taux d'intérêt hautement compétitif face aux banques traditionnelles.
          </p>

          <div className="bper-advantages-grid" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px", borderTop: "4px solid #004f52" }}>
              <div style={{ background: "#004f52", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", fontSize: "0.9rem" }}><i className="fas fa-sliders-h"></i></div>
              <h4 style={{ color: "#004f52", fontSize: "1rem", margin: "0 0 6px 0" }}>Mensualités Modulables</h4>
              <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0, lineHeight: "1.4" }}>Augmentez ou diminuez le montant de vos remboursements mensuels gratuitement, deux fois par an, selon vos revenus.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px", borderTop: "4px solid #059669" }}>
              <div style={{ background: "#059669", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", fontSize: "0.9rem" }}><i className="fas fa-hand-holding-usd"></i></div>
              <h4 style={{ color: "#059669", fontSize: "1rem", margin: "0 0 6px 0" }}>Zéro Frais de Dossier</h4>
              <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0, lineHeight: "1.4" }}>Aucuns frais administratifs ne vous seront facturés pour l'étude, l'ouverture ou la mise en place de votre dossier bancaire.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px", borderTop: "4px solid #eab308" }}>
              <div style={{ background: "#eab308", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", fontSize: "0.9rem" }}><i className="fas fa-bolt"></i></div>
              <h4 style={{ color: "#eab308", fontSize: "1rem", margin: "0 0 6px 0" }}>Déblocage sous 48h</h4>
              <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0, lineHeight: "1.4" }}>Après validation finale par notre comité des engagements, les fonds sont immédiatement versés sur votre compte courant.</p>
            </div>
          </div>

          <div className="bper-cta-box" style={{ padding: "20px 15px", marginTop: "25px", borderRadius: "14px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: isDesktop ? "1.5rem" : "1.1rem" }}>Prêt à concrétiser votre projet ?</h3>
            <p style={{ margin: "0 0 18px 0", opacity: 0.8, fontSize: "0.8rem", lineHeight: "1.3" }}>Le formulaire prend moins de 3 minutes. Obtenez une pré-acceptation immédiate.</p>
            <button onClick={() => navigateToView("simulateur")} style={{ padding: "12px", fontSize: "0.85rem", width: "100%" }}>
              Démarrer ma demande de prêt en ligne
            </button>
          </div>
        </div>
      )}

      {/* VUE 3 : TUNNEL SIMULATEUR */}
      {currentView === "simulateur" && (
        <div className="bper-loan-container" style={{ padding: 0 }}>
          <div className="bper-loan-steps" style={{ gap: "4px", marginBottom: "15px" }}>
            <div className="bper-step-item" style={{ fontSize: "0.65rem", paddingBottom: "6px", color: loanStep === 1 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #004f52" : "none" }}>1. CONFIGURATION</div>
            <div className="bper-step-item" style={{ fontSize: "0.65rem", paddingBottom: "6px", color: loanStep === 2 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #004f52" : "none" }}>2. INFORMATIONS</div>
            <div className="bper-step-item" style={{ fontSize: "0.65rem", paddingBottom: "6px", color: loanStep === 3 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #004f52" : "none" }}>3. CONTRAT & SIGNATURE</div>
          </div>

          <div className="bper-loan-card" style={{ background: "#fff", padding: isDesktop ? "30px 20px" : "15px 12px", borderRadius: "16px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
            <h2 className="bper-loan-title" style={{ color: "#004f52", marginBottom: "4px", fontSize: isDesktop ? "1.6rem" : "1.2rem" }}>Demande de Financement en Ligne</h2>
            <p className="bper-loan-subtitle" style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "20px" }}>BPER Banca — Service d'octroi des crédits aux particuliers.</p>

            {/* ÉTAPE 1 */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>Nature de votre projet</label>
                  <select 
                    style={responsiveInputStyle}
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

                {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>Type de taux hypothécaire</label>
                      <select 
                        style={responsiveInputStyle}
                        value={hypoRateType}
                        onChange={(e) => setHypoRateType(e.target.value)}
                      >
                        <option value="FIXE">Taux Fixe Institutionnel (4.25%)</option>
                        <option value="VARIABLE">Taux Variable Indexé Euribor (4.55%)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>Apport personnel disponible (€)</label>
                      <input 
                        type="number" 
                        style={responsiveInputStyle}
                        value={hypoContribution}
                        onChange={(e) => setHypoContribution(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>
                      {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? "Valeur du bien immobilier (€)" : "Montant recherché (€)"}
                    </label>
                    <input 
                      type="number" 
                      style={responsiveInputStyle}
                      value={loanData.amount === 0 ? "" : loanData.amount}
                      placeholder="Ex: 25000"
                      onChange={(e) => {
                        const val = e.target.value;
                        handleSimulation(val === "" ? "" : parseFloat(val), loanData.duration, loanData.loanType, hypoRateType, hypoContribution);
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", fontWeight: "600" }}>Période de remboursement (mois)</label>
                    <select 
                      style={responsiveInputStyle}
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

                <div className="bper-estimation-box" style={{ background: "#f0f7f7", padding: "15px", borderRadius: "10px", borderLeft: "4px solid #004f52", marginBottom: "20px", marginTop: "20px" }}>
                  <h4 style={{ margin: "0 0 4px 0", color: "#004f52", fontSize: "0.85rem" }}>Engagement Mensuel Estimé</h4>
                  <p style={{ margin: 0, fontSize: isDesktop ? "1.5rem" : "1.2rem", fontWeight: "bold", color: "#004f52", lineHeight: "1.3" }}>
                    {loanData.monthlyPayment} € <span className="bper-rate-text" style={{ fontSize: "0.75rem", fontWeight: "normal", color: "#64748b", display: "block", marginTop: "2px" }}>
                      / mois (TAEG contractuel : {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? (hypoRateType === "FIXE" ? "4.25% Fixe" : "4.55% Variable Indexé") : "4,90%"})
                    </span>
                  </p>
                  {(loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) && (
                    <p style={{ margin: "6px 0 0 0", fontSize: "0.7 alum", color: "#64748b" }}>
                      Capital Principal Net Emprunté : {Math.max(0, loanData.amount - hypoContribution)} € (après déduction de l'apport)
                    </p>
                  )}
                </div>

                <div className="bper-actions-wrapper" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button className="btn-bper-back" style={{ flex: 1, height: "42px", fontSize: "0.85rem" }} onClick={() => navigateToView("offres")}>
                    <i className="fas fa-chevron-left"></i> Retour
                  </button>
                  <button className="btn-bper-submit" style={{ flex: 1, height: "42px", fontSize: "0.85rem", background: "#004f52", color: "#fff" }} onClick={() => { setLoanStep(2); window.scrollTo({top: 0}); }}>
                    Constituer 
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {loanStep === 2 && (
              <div>
                <h4 className="bper-step-title" style={{ color: "#004f52", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", fontSize: "0.95rem" }}>Situation Personnelle & Financière</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>Civilité</label>
                    <select style={responsiveInputStyle} value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>Profession du client</label>
                    <select style={responsiveInputStyle} value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
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
                    <input type="number" placeholder="Ex: 3100" style={responsiveInputStyle} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem" }}>Co-emprunteur</label>
                    <select style={responsiveInputStyle} value={loanData.hasCoBorrower} onChange={(e) => setLoanData({...loanData, hasCoBorrower: e.target.value})}>
                      <option value="Non">Non</option>
                      <option value="Oui">Oui</option>
                    </select>
                  </div>
                </div>

                <div className="bper-actions-wrapper" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button className="btn-bper-back" style={{ flex: 1, height: "42px", fontSize: "0.85rem" }} onClick={() => { setLoanStep(1); window.scrollTo({top: 0}); }}>
                    <i className="fas fa-chevron-left"></i> Retour
                  </button>
                  <button className="btn-bper-submit" style={{ flex: 1, height: "42px", fontSize: "0.85rem", background: "#004f52", color: "#fff" }} disabled={!loanData.lastName || !loanData.income} onClick={() => { setLoanStep(3); window.scrollTo({top: 0}); }}>
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 */}
            {loanStep === 3 && (
              <div>
                {showSignatureAlert && (
                  <div style={{ background: "#fecaca", border: "1px solid #dc2626", color: "#991b1b", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold", marginBottom: "15px" }}>
                    ❌ Action Interdite : Vous devez impérativement cliquer sur le bouton "Lire le contrat avant de signer" et le valider pour pouvoir apposer votre signature.
                  </div>
                )}

                <div className="bper-summary-box" style={{ padding: "12px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "15px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#004f52", fontSize: "0.9rem" }}>Validation contractuelle du dossier</h4>
                  <p style={{ margin: "4px 0", fontSize: "0.8rem" }}><strong>Nature du projet :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.loanType}</span></p>
                  <p style={{ margin: "4px 0", fontSize: "0.8rem" }}><strong>Titulaire :</strong> {loanData.civility} {loanData.lastName} {loanData.firstName}</p>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  {hasReadContract ? (
                    <button
                      type="button"
                      disabled={true}
                      style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #059669", background: "#ecfdf5", color: "#059669", fontWeight: "bold", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                    >
                      <i className="fas fa-check-circle"></i> Contrat lu et accepté
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsContractModalOpen(true)}
                      style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "none", background: "#d97706", color: "#fff", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer" }}
                    >
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

                <p className="bper-legal-text" style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "20px", marginTop: "15px", lineHeight: "1.4" }}>
                  En transmettant ce dossier dûment signé, vous soumettez formellement votre demande de crédit au service d'analyse des risques de <strong>BPER Banca</strong>.
                </p>

                <div className="bper-actions-wrapper" style={{ display: "flex", gap: "10px" }}>
                  <button className="btn-bper-back" style={{ flex: 1, height: "42px", fontSize: "0.85rem" }} onClick={() => { setLoanStep(2); setSignatureBase64(""); setHasReadContract(false); window.scrollTo({top: 0}); }}>
                    <i className="fas fa-edit"></i> Modifier
                  </button>
                  <button 
                    className="btn-bper-submit" 
                    style={{ flex: 1, height: "42px", fontSize: "0.85rem", background: (signatureBase64 && hasReadContract) ? "#059669" : "#94a3b8", color: "#fff", cursor: (signatureBase64 && hasReadContract) ? "pointer" : "not-allowed" }}
                    disabled={!signatureBase64 || !hasReadContract}
                    onClick={async () => {
                      try {
                        const finalPayload = {
                          ...loanData,
                          amount: (loanData.loanType.includes("Immobilier") || loanData.loanType.includes("Hypothécaire")) ? Math.max(0, loanData.amount - hypoContribution) : loanData.amount,
                          signatureData: signatureBase64
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
                          alert(resData.message || "Contrat signé et envoyé avec succès !");
                          navigateToView("offres");
                          setLoanStep(1);
                          setSignatureBase64("");
                          setHasReadContract(false);
                        } else {
                          alert(resData.message || "Une erreur est survenue.");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Impossible de joindre le serveur.");
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

      {/* MODALE CONTRAT : SANS AUCUNE COUPURE DE COULEUR BLANCHE SUR TOUT ÉCRAN */}
      {isContractModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "#f1f5f9", zIndex: 9999, display: "flex", flexDirection: "column", boxSizing: "border-box", fontFamily: "'Times New Roman', Times, serif" }}>
          
          {/* En-tête fixe */}
          <div style={{ background: "#004f52", padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: "bold", letterSpacing: "1px" }}>BPER: Banca</span>
            </div>
            <span style={{ fontSize: "0.75rem", opacity: 0.8, fontFamily: "sans-serif" }}>RÉF: BPER-CONTRACT-2026</span>
          </div>

          {/* Zone défilante principale */}
          <div style={{ flex: 1, overflowY: "auto", padding: isDesktop ? "30px 40px" : "10px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", boxSizing: "border-box" }}>
            
            {/* CORRECTION STRUCTURELLE DU FOND BLANC IMMORTEL */}
            <div style={{ 
              backgroundColor: "#fff", 
              width: "100%", 
              maxWidth: "800px", 
              padding: isDesktop ? "50px" : "25px 20px", 
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)", 
              borderRadius: "4px", 
              color: "#000", 
              fontSize: "0.95rem", 
              lineHeight: "1.6", 
              textAlign: "justify",
              boxSizing: "border-box",
              display: "table", 
              minHeight: "100%", 
              height: "auto",
              marginBottom: "20px"
            }}>
              
              <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #004f52", paddingBottom: "15px" }}>
                <h1 style={{ fontSize: "1.5rem", color: "#004f52", margin: "0 0 5px 0", textTransform: "uppercase" }}>Offre Préalable de Crédit</h1>
                <p style={{ margin: 0, fontStyle: "italic", color: "#475569", fontSize: "0.8rem", fontFamily: "sans-serif" }}>Contrat régi conformément aux directives bancaires européennes</p>
              </div>

              {/* AFFICHAGE DE LA PROFESSION STRICTEMENT CORRIGÉ ICI */}
              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", marginBottom: "25px", border: "1px solid #cbd5e1", fontFamily: "sans-serif", fontSize: "0.85rem" }}>
                <p style={{ margin: "3px 0" }}><strong>Organisme Prêteur :</strong> BPER Banca S.p.A. (Banca Popolare dell'Emilia Romagna)</p>
                <p style={{ margin: "3px 0" }}><strong>Bénéficiaire :</strong> {loanData.civility} {loanData.lastName.toUpperCase()} {loanData.firstName}</p>
                <p style={{ margin: "3px 0" }}><strong>Profession du client :</strong> <span style={{ color: "#004f52", fontWeight: "bold" }}>{loanData.profession}</span></p>
                <p style={{ margin: "3px 0" }}><strong>Revenus Mensuels :</strong> {loanData.income} EUR</p>
              </div>

              <h3 style={{ color: "#004f52", borderBottom: "1px solid #cbd5e1", paddingBottom: "3px", fontSize: "1.05rem", marginTop: "20px" }}>ARTICLE 1 : OBJET ET ASSIETTE DU FINANCEMENT</h3>
              <p>Le présent engagement stipule que la <strong>BPER Banca</strong> consent au client mentionné ci-dessus, qui l'accepte formellement, un crédit d'un montant en capital de <strong>{loanData.amount} EUR</strong> au titre de l'offre <em>"{loanData.loanType}"</em>. Ce capital est exclusivement mis à disposition pour la réalisation du projet déclaré ou l'ajustement de trésorerie souscrit.</p>

              <h3 style={{ color: "#004f52", borderBottom: "1px solid #cbd5e1", paddingBottom: "3px", fontSize: "1.05rem", marginTop: "20px" }}>ARTICLE 2 : CONDITIONS DE REMBOURSEMENT ET AMORTISSEMENT</h3>
              <p>L'emprunteur s'engage irrévocablement à rembourser l'intégralité du capital emprunté majoré des intérêts courus sur une durée ferme de <strong>{loanData.duration} mois</strong>. Le prélèvement s'exécutera à échéance constante fixe d'un montant brut de <strong>{loanData.monthlyPayment} EUR par mois</strong>. Le Taux Annuel Effectif Global (TAEG) appliqué est contractuellement fixé à 4,90%.</p>

              <h3 style={{ color: "#004f52", borderBottom: "1px solid #cbd5e1", paddingBottom: "3px", fontSize: "1.05rem", marginTop: "20px" }}>ARTICLE 3 : EXIGIBILITÉ ET DÉCHÉANCE DU TERME</h3>
              <p>Toute fausse déclaration concernant les justificatifs financiers ou tout défaut récurrent de paiement des mensualités dues entraînera de plein droit l'exigibilité immédiate des sommes restant dues. La banque BPER Banca se réservera le droit d'appliquer une indemnité forfaitaire égale à 8% du capital restant dû.</p>

              <h3 style={{ color: "#004f52", borderBottom: "1px solid #cbd5e1", paddingBottom: "3px", fontSize: "1.05rem", marginTop: "20px" }}>ARTICLE 4 : DROIT DE RÉTRACTATION</h3>
              <p>Conformément à la législation sur le crédit, l'emprunteur dispose d'un délai légal de rétractation de 14 jours calendaires révolus à compter de la date de signature de la présente offre en ligne pour renoncer à son engagement par lettre recommandée avec accusé de réception.</p>

              <h3 style={{ color: "#004f52", borderBottom: "1px solid #cbd5e1", paddingBottom: "3px", fontSize: "1.05rem", marginTop: "20px" }}>ARTICLE 5 : CONSENTEMENT ET PREUVE ÉLECTRONIQUE</h3>
              <p>Les parties s'entendent expressément pour conférer au procédé technique de signature électronique utilisé sur la présente plateforme internet la même valeur juridique qu'une signature manuscrite sur support papier. Le clic sur le bouton de clôture vaut validation intégrale de l'ensemble des clauses précitées.</p>

              <div style={{ marginTop: "40px", borderTop: "1px solid #000", paddingTop: "10px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", fontSize: "0.8rem", fontStyle: "italic" }}>
                <span>Mention : "Bon pour acceptation de l'offre de crédit"</span>
                <span>Émis par BPER Banca S.p.A.</span>
              </div>
            </div>
          </div>

          {/* Pied de page fixe */}
          <div style={{ background: "#fff", padding: "15px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "center", flexShrink: 0, width: "100%", boxSizing: "border-box" }}>
            <button
              type="button"
              onClick={() => {
                setHasReadContract(true);
                setIsContractModalOpen(false);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              style={{ width: isDesktop ? "auto" : "100%", padding: "12px 50px", backgroundColor: "#004f52", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 6px rgba(0,80,82,0.2)" }}
            >
              ✔️ J'ai lu le contrat - Cliquer sur OK pour valider
            </button>
          </div>

        </div>
      )}

    </div>
  );
}