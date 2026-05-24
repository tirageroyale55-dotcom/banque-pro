import React, { useState } from "react";
import "../styles/produits.css";

export default function Produits({ isDesktop = false }) {
  // États pour la navigation interne du produit
  const [currentView, setCurrentView] = useState("offres"); // 'offres' | 'avantages' | 'simulateur'
  const [loanStep, setLoanStep] = useState(1);
  
  const [loanData, setLoanData] = useState({
    loanType: "Prêt Personnel",
    amount: 15000,
    duration: 48,
    monthlyPayment: 345,
    civility: "M.",
    lastName: "",
    firstName: "",
    income: "",
    profession: "",
    hasCoBorrower: "Non"
  });

  // Calcul dynamique des mensualités (Simulation Taux BPER : 4.90%)
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
    <div className={isDesktop ? "bper-produits-container" : "bper-produits-container page-content"} style={{ maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" }}>
      
      {/* STYLE ISOLÉ : S'applique uniquement sur mobile pour cette page sans casser le reste du site */}
      <style>{`
        @media (max-width: 900px) {
          .bper-produits-container {
            background-color: #003638 !important; /* Vert nuit BPER Banca */
            color: #ffffff !important;
            min-height: 100vh;
            padding: 20px 15px !important;
          }
          .bper-produits-container .cards-title,
          .bper-produits-container h2,
          .bper-produits-container h3,
          .bper-produits-container h4,
          .bper-produits-container label,
          .bper-produits-container p {
            color: #ffffff !important;
          }
          .bper-produits-container .account-card,
          .bper-produits-container td,
          .bper-produits-container th {
            background-color: #004f52 !important; /* Vert légèrement plus clair pour les cartes */
            color: #ffffff !important;
            border-color: #005c5f !important;
          }
          .bper-produits-container input,
          .bper-produits-container select {
            background-color: #004f52 !important;
            color: #ffffff !important;
            border: 1px solid #007a5e !important;
          }
          .bper-produits-container .btn-light {
            background-color: #007a5e !important;
            color: #ffffff !important;
            border: none !important;
          }
          .bper-produits-container table {
            background-color: #004f52 !important;
          }
        }
      `}</style>

      {/* =========================================================================
          VUE 1 : ACCUEIL DES PRODUITS FINANCIERS (PROMO CARD + ÉPARGNE)
          ========================================================================= */}
      {currentView === "offres" && (
        <>
          <h2 className="cards-title" style={{ color: "#004f52", fontSize: "2rem", marginBottom: "25px" }}>
            Nos Solutions de Financement & Épargne
          </h2>

          {/* Ton Bloc Graphique Réutilisant le CSS exact fourni */}
          <div className="promo-card-inner reverse" style={{ display: "grid", background: "white", borderRadius: "32px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
            <div className="promo-image-wrapper">
              <img 
                src="watermarked_img_11865039945951112084.png" 
                alt="BPER Crédits et Assurances" 
                className="promo-image"
              />
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
                <button 
                  onClick={() => setCurrentView("avantages")} 
                  className="btn-white" 
                  style={{ border: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  En savoir plus
                </button>
              </div>
            </div>
          </div>

          {/* Bloc Épargne Standardisé Professionnel */}
          <div className="account-card" style={{ background: "#fff", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
              <div>
                <h3 style={{ color: "#004f52", margin: "0 0 8px 0", fontSize: "1.3rem" }}>Livret d'Épargne BPER Privilège</h3>
                <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>Optimisez et sécurisez vos économies avec un taux d'intérêt annuel brut de 3,50% garanti.</p>
              </div>
              <span style={{ background: "#f0fdf4", color: "#166534", padding: "8px 16px", borderRadius: "30px", fontWeight: "bold", fontSize: "0.9rem" }} className="badge-saving">Rendement : 3.50%</span>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          VUE 2 : PAGE DES AVANTAGES COMPÉTITIFS & COMPARATIF BANCAIRE
          ========================================================================= */}
      {currentView === "avantages" && (
        <div style={{ background: "white", padding: "40px", borderRadius: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }} className="account-card">
          <button onClick={() => setCurrentView("offres")} style={{ background: "none", border: "none", color: "#004f52", cursor: "pointer", fontWeight: "600", marginBottom: "20px" }}>
            <i className="fas fa-arrow-left"></i> Retour aux produits
          </button>

          <h2 style={{ color: "#004f52", fontSize: "2.2rem", marginTop: 0, marginBottom: "15px" }}>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
          <p style={{ color: "#64748b", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "800px", marginBottom: "40px" }}>
            Nous réinventons le crédit à la consommation. Pas de frais cachés, une flexibilité absolue sur vos mensualités et un taux d'intérêt hautement compétitif face aux banques traditionnelles.
          </p>

          {/* Grille des 3 Grands Avantages */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "5px" }}>
            <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "16px", borderTop: "4px solid #004f52" }} className="account-card">
              <div style={{ background: "#004f52", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}><i className="fas fa-sliders-h"></i></div>
              <h4 style={{ color: "#004f52", fontSize: "1.15rem", margin: "0 0 10px 0" }}>Mensualités Modulables</h4>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Augmentez ou diminuez le montant de vos remboursements mensuels gratuitement, deux fois par an, selon vos revenus.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "16px", borderTop: "4px solid #059669" }} className="account-card">
              <div style={{ background: "#059669", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}><i className="fas fa-hand-holding-usd"></i></div>
              <h4 style={{ color: "#059669", fontSize: "1.15rem", margin: "0 0 10px 0" }}>Zéro Frais de Dossier</h4>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Aucuns frais administratifs ne vous seront facturés pour l'étude, l'ouverture ou la mise en place de votre dossier bancaire.</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "25px", borderRadius: "16px", borderTop: "4px solid #eab308" }} className="account-card">
              <div style={{ background: "#eab308", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "15px" }}><i className="fas fa-bolt"></i></div>
              <h4 style={{ color: "#eab308", fontSize: "1.15rem", margin: "0 0 10px 0" }}>Déblocage sous 48h</h4>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0, lineHeight: "1.5" }}>Après validation finale par notre comité des engagements, les fonds sont immédiatement versés sur votre compte courant.</p>
            </div>
          </div>

          {/* TABLEAU COMPARATIF BANCAIRE INTERGÉNÉRATIONNEL */}
          <div style={{ marginTop: "50px", marginBottom: "40px" }}>
            <h3 style={{ color: "#004f52", marginBottom: "20px" }}>BPER face aux autres institutions financières</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                <thead>
                  <tr style={{ background: "#004f52", color: "white" }}>
                    <th style={{ padding: "15px" }}>Critères d'évaluation</th>
                    <th style={{ padding: "15px", background: "#003638", textAlign: "center" }}>BPER Banca</th>
                    <th style={{ padding: "15px" }}>Banques Traditionnelles</th>
                    <th style={{ padding: "15px" }}>Organismes en Ligne</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "15px", fontWeight: "600" }}>TAEG Moyen Appliqué</td>
                    <td style={{ padding: "15px", textAlign: "center", color: "#059669", fontWeight: "bold", background: "#f0fdf4" }} className="bper-highlight">4.90% fixe</td>
                    <td style={{ padding: "15px" }}>5.95% à 6.80%</td>
                    <td style={{ padding: "15px" }}>6.10% à 7.45%</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "15px", fontWeight: "600" }}>Frais de dossier contractuels</td>
                    <td style={{ padding: "15px", textAlign: "center", color: "#059669", fontWeight: "bold", background: "#f0fdf4" }} className="bper-highlight">0 € (Gratuit)</td>
                    <td style={{ padding: "15px" }}>En moyenne 150 €</td>
                    <td style={{ padding: "15px" }}>Inclus</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "15px", fontWeight: "600" }}>Pénalités anticipées</td>
                    <td style={{ padding: "15px", textAlign: "center", color: "#059669", fontWeight: "bold", background: "#f0fdf4" }} className="bper-highlight">Aucune (0%)</td>
                    <td style={{ padding: "15px" }}>Jusqu'à 1%</td>
                    <td style={{ padding: "15px" }}>Réglementaires</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA FINAL DE LA PAGE AVANTAGE */}
          <div style={{ textAlign: "center", background: "#004f52", padding: "35px", borderRadius: "20px", color: "white" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.5rem", color: "#fff" }}>Prêt à concrétiser votre projet ?</h3>
            <p style={{ margin: "0 0 25px 0", opacity: 0.8, fontSize: "0.95rem", color: "#fff" }}>Le formulaire prend moins de 3 minutes. Obtenez une pré-acceptation immédiate.</p>
            <button 
              onClick={() => setCurrentView("simulateur")} 
              style={{ background: "#e6ff6a", color: "#004f52", padding: "14px 35px", border: "none", borderRadius: "30px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}
            >
              Démarrer ma demande de prêt en ligne
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VUE 3 : TUNNEL DE DEMANDE DE PRÊT (ÉTAPES INTERNES DE A À Z)
          ========================================================================= */}
      {currentView === "simulateur" && (
        <div>
          {/* Fil d'Ariane de Progression */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }} className="account-card">
            <div style={{ fontWeight: "bold", color: loanStep === 1 ? "#e6ff6a" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>1. CONFIGURATION</div>
            <div style={{ fontWeight: "bold", color: loanStep === 2 ? "#e6ff6a" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>2. VOS INFORMATIONS</div>
            <div style={{ fontWeight: "bold", color: loanStep === 3 ? "#e6ff6a" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>3. VÉRIFICATION & ENVOI</div>
          </div>

          <div className="account-card" style={{ background: "#fff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
            <h2 style={{ color: "#004f52", marginBottom: "5px", fontSize: "1.6rem" }}>Demande de Financement en Ligne</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "30px" }}>BPER Banca — Service d'octroi des crédits aux particuliers.</p>

            {/* ÉTAPE 1 : SIMULATEUR */}
            {loanStep === 1 && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Nature de votre projet</label>
                  <select 
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    value={loanData.loanType}
                    onChange={(e) => setLoanData({...loanData, loanType: e.target.value})}
                  >
                    <option value="Prêt Personnel">Prêt Personnel (Projets Divers)</option>
                    <option value="Prêt Automobile">Financement Véhicule Neuf / Occasion</option>
                    <option value="Prêt Travaux">Rénovation & Aménagement Habitat</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Montant recherché (€)</label>
                    <input 
                      type="number" 
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      value={loanData.amount}
                      onChange={(e) => handleSimulation(e.target.value, loanData.duration)}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Période de remboursement (mois)</label>
                    <select 
                      style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
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

                <div style={{ background: "#f0f7f7", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #004f52", marginBottom: "25px" }} className="account-card">
                  <h4 style={{ margin: "0 0 8px 0", color: "#004f52" }}>Engagement Mensuel Estimé</h4>
                  <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#004f52" }}>
                    {loanData.monthlyPayment} € <span style={{ fontSize: "0.9rem", fontWeight: "normal", color: "#64748b" }}>/ mois (TAEG : 4,90%)</span>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="btn-light" onClick={() => setCurrentView("avantages")}>Retour</button>
                  <button className="btn-white" style={{ background: "#004f52", color: "#fff", marginTop: 0 }} onClick={() => setLoanStep(2)}>Constituer mon dossier</button>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : FORMULAIRE */}
            {loanStep === 2 && (
              <div>
                <h4 style={{ color: "#004f52", marginBottom: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Situation Personnelle & Financière</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Civilité</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Statut Professionnel</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
                      <option value="">Sélectionnez...</option>
                      <option value="CDI">Salarié (CDI)</option>
                      <option value="Indépendant">Entrepreneur / Libérale</option>
                      <option value="Retraité">Cadre Retraité</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Nom</label>
                    <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.lastName} onChange={(e) => setLoanData({...loanData, lastName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Prénom</label>
                    <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.firstName} onChange={(e) => setLoanData({...loanData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Revenus mensuels (€)</label>
                    <input type="number" placeholder="Ex: 3100" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Co-emprunteur</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.hasCoBorrower} onChange={(e) => setLoanData({...loanData, hasCoBorrower: e.target.value})}>
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

            {/* ÉTAPE 3 : CONFIRMATION */}
            {loanStep === 3 && (
              <div>
                <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }} className="account-card">
                  <h4 style={{ margin: "0 0 15px 0", color: "#004f52" }}>Validation contractuelle du dossier</h4>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Titulaire :</strong> {loanData.civility} {loanData.firstName} {loanData.lastName} ({loanData.profession})</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Capital :</strong> {loanData.amount} € sur {loanData.duration} mois</p>
                  <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Charge :</strong> {loanData.monthlyPayment} € / mois</p>
                </div>

                <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "25px", lineHeight: "1.5" }}>
                  En transmettant ce dossier, vous soumettez votre demande au service d'analyse de <strong>BPER Banca</strong>. Les fonds seront débloqués après validation sous 48h.
                </p>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="btn-light" onClick={() => setLoanStep(2)}>Modifier</button>
                  <button 
                    className="btn-white" 
                    style={{ background: "#059669", color: "#fff", marginTop: 0 }}
                    onClick={() => {
                      alert("Félicitations, votre dossier a été transmis avec succès à BPER Banca.");
                      setCurrentView("offres");
                      setLoanStep(1);
                    }}
                  >
                    Soumettre la demande
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