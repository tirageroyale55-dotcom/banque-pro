import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import "../styles/produits.css";

export default function Produits({ isDesktop = false }) {
  const { setForceHideNav } = useOutletContext() || {};

  const [currentView, setCurrentView] = useState("offres"); 
  const [loanStep, setLoanStep] = useState(1);

  // Valeurs par défaut solides pour éviter que Mongoose rejette à cause de chaînes vides
  const [loanData, setLoanData] = useState({
    loanType: "Prêt Personnel",
    amount: 15000,
    duration: 48,
    monthlyPayment: 345,
    civility: "M.",
    lastName: "BEN",
    firstName: "Luc",
    email: "", 
    telephone: "", 
    income: "",
    profession: "Salarié", // Valeur par défaut pour éviter l'erreur de validation
    hasCoBorrower: "Non"
  });

  // Récupération automatique avec fallback
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setLoanData(prev => ({
          ...prev,
          lastName: parsed.nom || parsed.lastName || parsed.username || prev.lastName,
          firstName: parsed.prenom || parsed.firstName || prev.firstName,
          email: parsed.email || parsed.mail || parsed.login || prev.email,
          telephone: parsed.telephone || parsed.phone || parsed.tel || parsed.mobile || prev.telephone,
          profession: parsed.profession || parsed.job || "Salarié"
        }));
      } else {
        // Fallback si clés plates
        setLoanData(prev => ({
          ...prev,
          lastName: localStorage.getItem("nom") || localStorage.getItem("lastName") || prev.lastName,
          firstName: localStorage.getItem("prenom") || localStorage.getItem("firstName") || prev.firstName,
          email: localStorage.getItem("email") || localStorage.getItem("mail") || prev.email,
          telephone: localStorage.getItem("telephone") || localStorage.getItem("phone") || prev.telephone,
          profession: localStorage.getItem("profession") || "Salarié"
        }));
      }
    } catch (e) {
      console.error("Erreur de lecture du localStorage:", e);
    }
  }, []);

  useEffect(() => {
    if (setForceHideNav) {
      setForceHideNav(currentView === "avantages" || currentView === "simulateur");
    }
  }, [currentView, setForceHideNav]);

  const handleSimulation = (amount, duration) => {
    const rate = 0.049; 
    const monthly = (amount * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -duration));
    setLoanData({
      ...loanData,
      amount: parseInt(amount) || 0,
      duration: parseInt(duration) || 12,
      monthlyPayment: Math.round(monthly)
    });
  };

  return (
    <div className={isDesktop ? "" : "page-contente"} style={{ maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* VUE 1 : OFFRES */}
      {currentView === "offres" && (
        <>
          <h2 className="cards-title" style={{ color: "#004f52", fontSize: "2rem", marginBottom: "25px" }}>
            Nos Solutions de Financement & Épargne
          </h2>
          <div className="promo-card-inner reverse" style={{ display: "grid", background: "white", borderRadius: "32px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
            <div className="promo-image-wrapper">
              <img src="pret-velo.png" alt="BPER Crédits" className="promo-image" />
              <div className="promo-badge">
                <span className="badge-small">TAEG FIXE</span>
                <span className="badge-big">4.90%</span>
                <span className="badge-old">5.85%</span>
                <span className="badge-label">Exclusivité BPER</span>
              </div>
            </div>
            <div className="promo-card-visual dark">
              <div className="promo-text-dark">
                <h2>Financez vos ambitions au meilleur taux du marché.</h2>
                <button onClick={() => setCurrentView("avantages")} className="btn-white" style={{ border: "none", cursor: "pointer", fontWeight: "bold" }}>En savoir plus</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VUE 2 : AVANTAGES */}
      {currentView === "avantages" && (
        <div style={{ background: "white", padding: "40px", borderRadius: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
          <button onClick={() => setCurrentView("offres")} style={{ background: "none", border: "none", color: "#004f52", cursor: "pointer", fontWeight: "600", marginBottom: "20px" }}>
            <i className="fas fa-arrow-left"></i> Retour
          </button>
          <h2>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
          <button onClick={() => setCurrentView("simulateur")} style={{ background: "#e6ff6a", color: "#004f52", padding: "14px 35px", border: "none", borderRadius: "30px", fontWeight: "bold", cursor: "pointer" }}>
            Démarrer ma demande de prêt en ligne
          </button>
        </div>
      )}

      {/* VUE 3 : SIMULATEUR */}
      {currentView === "simulateur" && (
        <div className="bper-loan-container">
          <div className="bper-loan-steps" style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", background: "#fff", padding: "15px", borderRadius: "12px" }}>
            <div style={{ fontWeight: "bold", color: loanStep === 1 ? "#004f52" : "#94a3b8", flex: 1, textAlign: "center" }}>1. CONFIGURATION</div>
            <div style={{ fontWeight: "bold", color: loanStep === 2 ? "#004f52" : "#94a3b8", flex: 1, textAlign: "center" }}>2. INFORMATIONS</div>
            <div style={{ fontWeight: "bold", color: loanStep === 3 ? "#004f52" : "#94a3b8", flex: 1, textAlign: "center" }}>3. VÉRIFICATION</div>
          </div>

          <div className="bper-loan-card" style={{ background: "#fff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            
            {/* ÉTAPE 1 */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Nature du projet</label>
                  <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.loanType} onChange={(e) => setLoanData({...loanData, loanType: e.target.value})}>
                    <option value="Prêt Personnel">Prêt Personnel</option>
                    <option value="Prêt Automobile">Prêt Automobile</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                  <input type="number" style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.amount} onChange={(e) => handleSimulation(e.target.value, loanData.duration)} />
                </div>
                <button className="btn-white" style={{ background: "#004f52", color: "#fff" }} onClick={() => setLoanStep(2)}>Constituer mon dossier</button>
              </div>
            )}

            {/* ÉTAPE 2 : ICI ON QUITTE LE MODE AVEUGLE, ON SUTRE TOUS LES CHAMPS POUR COMPLÉTER SI LE LOCALSTORAGE EST VIDE */}
            {loanStep === 2 && (
              <div>
                <h4 style={{ color: "#004f52", marginBottom: "15px" }}>Veuillez confirmer ou compléter vos informations :</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "bold" }}>Nom</label>
                    <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.lastName} onChange={(e) => setLoanData({...loanData, lastName: e.target.value})} />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "bold" }}>Prénom</label>
                    <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.firstName} onChange={(e) => setLoanData({...loanData, firstName: e.target.value})} />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "bold", color: "#ef4444" }}>Adresse E-mail (Requis) *</label>
                    <input type="email" placeholder="Entrez votre email si vide" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "2px solid #ef4444" }} value={loanData.email} onChange={(e) => setLoanData({...loanData, email: e.target.value})} />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "bold", color: "#ef4444" }}>Numéro de Téléphone (Requis) *</label>
                    <input type="text" placeholder="Entrez votre numéro si vide" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "2px solid #ef4444" }} value={loanData.telephone} onChange={(e) => setLoanData({...loanData, telephone: e.target.value})} />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "bold" }}>Profession (Requis) *</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
                      <option value="Salarié">Salarié</option>
                      <option value="CDI">CDI</option>
                      <option value="Indépendant">Indépendant</option>
                      <option value="Retraité">Retraité</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: "bold" }}>Revenus nets mensuels (€)</label>
                    <input type="number" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>

                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="btn-light" onClick={() => setLoanStep(1)}>Retour</button>
                  {/* Le bouton suivant reste bloqué tant que les trois champs obligatoires pour Mongoose ne sont pas remplis */}
                  <button 
                    className="btn-white" 
                    style={{ background: "#004f52", color: "#fff", marginTop: 0 }} 
                    disabled={!loanData.email || !loanData.telephone || !loanData.profession} 
                    onClick={() => setLoanStep(3)}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 */}
            {loanStep === 3 && (
              <div>
                <div className="bper-summary-box" style={{ padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#004f52" }}>Validation contractuelle du dossier</h4>
                  <p><strong>Titulaire :</strong> {loanData.civility} {loanData.lastName} {loanData.firstName} ({loanData.profession})</p>
                  <p><strong>E-mail de notification :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.email}</span></p>
                  <p><strong>Téléphone relié :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.telephone}</span></p>
                  <hr style={{ margin: "15px 0", border: "none", borderTop: "1px solid #e2e8f0" }} />
                  <p><strong>Montant :</strong> {loanData.amount} € sur {loanData.duration} mois</p>
                  <p><strong>Mensualité :</strong> {loanData.monthlyPayment} € / mois</p>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="btn-light" onClick={() => setLoanStep(2)}>Modifier</button>
                  <button 
                    className="btn-white" 
                    style={{ background: "#059669", color: "#fff", marginTop: 0 }}
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
                          setCurrentView("offres");
                          setLoanStep(1);
                        } else {
                          alert(resData.message || "Erreur de validation");
                        }
                      } catch (err) {
                        alert("Erreur de connexion avec Vercel.");
                      }
                    }}
                  >
                    Soumettre la demande à la banque
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