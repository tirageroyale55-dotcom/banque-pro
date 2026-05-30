import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom"; 
import "../styles/produits.css";

export default function Produits({ isDesktop = false }) {
  const { setForceHideNav } = useOutletContext() || {};

  const [currentView, setCurrentView] = useState("offres"); 
  const [loanStep, setLoanStep] = useState(1);

  // État initial global du formulaire
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

  // 🔥 CHARGEMENT DIRECT DEPUIS MONGODB ATLAS AU DÉMARRAGE
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

  // Gestion de la navigation basse
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

  return (
    <div className={isDesktop ? "" : "page-contente"} style={{ maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* VUE 1 : OFFRES ACCUEIL */}
      {currentView === "offres" && (
        <>
          <h2 className="cards-title" style={{ color: "#004f52", fontSize: "2rem", marginBottom: "25px" }}>
            Nos Solutions de Financement & Épargne
          </h2>

          <div className="promo-card-inner reverse" style={{ display: "grid", background: "white", borderRadius: "32px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
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
                <button onClick={() => setCurrentView("avantages")} className="btn-white" style={{ border: "none", cursor: "pointer", fontWeight: "bold" }}>
                  En savoir plus
                </button>
              </div>
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
        <div style={{ background: "white", padding: "40px", borderRadius: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
          <button onClick={() => setCurrentView("offres")} style={{ background: "none", border: "none", color: "#004f52", cursor: "pointer", fontWeight: "600", marginBottom: "20px" }}>
            <i className="fas fa-arrow-left"></i> Retour aux produits
          </button>

          <h2 style={{ color: "#004f52", fontSize: "2.2rem", marginTop: 0, marginBottom: "15px" }}>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
          <p style={{ color: "#64748b", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "800px", marginBottom: "40px" }}>
            Nous réinventons le crédit à la consommation. Pas de frais cachés, une flexibilité absolue sur vos mensualités et un taux d'intérêt hautement compétitif face aux banques traditionnelles.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "40px" }}>
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

          <div style={{ textAlign: "center", background: "#004f52", padding: "35px", borderRadius: "20px", color: "white" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem" }}>Prêt à concrétiser votre projet ?</h3>
            <p style={{ margin: "0 0 25px 0", opacity: 0.8, fontSize: "0.95rem" }}>Le formulaire prend moins de 3 minutes. Obtenez une pré-acceptation immédiate.</p>
            <button onClick={() => setCurrentView("simulateur")} style={{ background: "#e6ff6a", color: "#004f52", padding: "14px 35px", border: "none", borderRadius: "30px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}>
              Démarrer ma demande de prêt en ligne
            </button>
          </div>
        </div>
      )}

      {/* VUE 3 : TUNNEL SIMULATEUR */}
      {currentView === "simulateur" && (
        <div className="bper-loan-container">
          <div className="bper-loan-steps" style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: "bold", color: loanStep === 1 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>1. CONFIGURATION</div>
            <div style={{ fontWeight: "bold", color: loanStep === 2 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>2. INFORMATIONS</div>
            <div style={{ fontWeight: "bold", color: loanStep === 3 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>3. VÉRIFICATION</div>
          </div>

          <div className="bper-loan-card" style={{ background: "#fff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            <h2 className="bper-loan-title" style={{ color: "#004f52", marginBottom: "5px", fontSize: "1.6rem" }}>Demande de Financement en Ligne</h2>
            <p className="bper-loan-subtitle" style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "30px" }}>BPER Banca — Service d'octroi des crédits aux particuliers.</p>

            {/* ÉTAPE 1 */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Nature de votre projet</label>
                  <select 
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#333" }}
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

                <div className="bper-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Montant recherché (€)</label>
                    <input 
                      type="number" 
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#333" }}
                      value={loanData.amount}
                      onChange={(e) => handleSimulation(e.target.value, loanData.duration)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Période de remboursement (mois)</label>
                    <select 
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#333" }}
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

                <div className="bper-estimation-box" style={{ background: "#f0f7f7", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #004f52", marginBottom: "25px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: "#004f52" }}>Engagement Mensuel Estimé</h4>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#004f52" }}>
                    {loanData.monthlyPayment} € <span className="bper-rate-text" style={{ fontSize: "0.9rem", fontWeight: "normal", color: "#64748b" }}>/ mois (TAEG contractuel : 4,90%)</span>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="btn-light" onClick={() => setCurrentView("avantages")}>Retour</button>
                  <button className="btn-white" style={{ background: "#004f52", color: "#fff", marginTop: 0 }} onClick={() => setLoanStep(2)}>Constituer mon dossier</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {loanStep === 2 && (
              <div>
                <h4 className="bper-step-title" style={{ color: "#004f52", marginBottom: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Situation Personnelle & Financière</h4>
                <div className="bper-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Civilité</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333" }} value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Profession du client</label>
                    <select 
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333" }} 
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
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Nom</label>
                    <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333" }} value={loanData.lastName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Prénom</label>
                    <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333" }} value={loanData.firstName} readOnly />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Revenus nets par mois (€)</label>
                    <input type="number" placeholder="Ex: 3100" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333" }} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Co-emprunteur</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", color: "#333" }} value={loanData.hasCoBorrower} onChange={(e) => setLoanData({...loanData, hasCoBorrower: e.target.value})}>
                      <option value="Non">Non</option>
                      <option value="Oui">Oui</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="btn-light" onClick={() => setLoanStep(1)}>Retour</button>
                  <button className="btn-white" style={{ background: "#004f52", color: "#fff", marginTop: 0 }} disabled={!loanData.lastName || !loanData.income} onClick={() => setLoanStep(3)}>Suivant</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : CONFIRMATION FINALE */}
            {loanStep === 3 && (
              <div>
                <div className="bper-summary-box" style={{ padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px", color: "#333" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#004f52" }}>Validation contractuelle du dossier</h4>
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>Nature du projet :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.loanType}</span>
                  </p>

                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>Titulaire du compte :</strong> {loanData.civility} {loanData.lastName} {loanData.firstName} {loanData.profession ? `(${loanData.profession})` : ""}
                  </p>
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>E-mail de notification :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.email}</span>
                  </p>
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                    <strong>Téléphone relié :</strong> <span style={{ color: "#004f52", fontWeight: "600" }}>{loanData.telephone}</span>
                  </p>
                  
                  <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "15px 0" }} />
                  
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Capital emprunté :</strong> {loanData.amount} € sur {loanData.duration} mois</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Charge mensuelle calculée :</strong> {loanData.monthlyPayment} € / mois</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Capacité déclarée :</strong> {loanData.income} € net / mois</p>
                </div>

                <p className="bper-legal-text" style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "25px", lineHeight: "1.5" }}>
                  En transmettant ce dossier, vous soumettez formellement votre demande de crédit au service d'analyse des risques et de conformité monétique de <strong>BPER Banca</strong>. Les fonds seront débloqués après validation administrative sous un délai réglementaire de 48h. Une notification de décision sera envoyée à l'adresse e-mail ci-dessus.
                </p>

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

                        // 🔥 AFFICHE LE MESSAGE D'ERREUR DU BACKEND SI UNE DEMANDE EXISTE DÉJÀ
                        if (response.ok) {
                          alert(resData.message || "Demande envoyée avec succès !");
                          setCurrentView("offres");
                          setLoanStep(1);
                        } else {
                          // Affiche l'alerte "Vous avez déjà une demande en cours..." renvoyée par l'API
                          alert(resData.message || "Une erreur est survenue lors de l'envoi.");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Impossible de joindre le serveur.");
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