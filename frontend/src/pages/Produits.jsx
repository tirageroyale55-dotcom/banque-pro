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
    <div className={isDesktop ? "" : "page-content"} style={{ minHeight: "100vh", background: "#ffffff", padding: "40px 20px", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* =========================================================================
            VUE 1 : ACCUEIL DES PRODUITS FINANCIERS (PROMO CARD + ÉPARGNE)
            ========================================================================= */}
        {currentView === "offres" && (
          <>
            <h2 className="cards-title" style={{ color: "#003133", fontSize: "2.2rem", fontWeight: "700", marginBottom: "30px", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px" }}>
              Solutions de Financement & Épargne
            </h2>

            {/* Bloc Graphique Réutilisant le CSS exact fourni */}
            <div className="promo-card-inner reverse" style={{ display: "grid", background: "#ffffff", borderRadius: "32px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0, 49, 51, 0.06)", marginBottom: "40px", border: "1px solid #e2e8f0" }}>
              <div className="promo-image-wrapper">
                <img 
                  src="pret-velo.png" 
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

              {/* Application du Vert Nuit #003133 demandé */}
              <div className="promo-card-visual dark" style={{ background: "#003133" }}>
                <div className="promo-text-dark" style={{ padding: "50px" }}>
                  <div className="promo-tag" style={{ color: "#e6ff6a" }}>
                    <span className="promo-icon" style={{ background: "rgba(255,255,255,0.1)" }}><i className="fas fa-percentage"></i></span>
                    <span style={{ letterSpacing: "1px", fontSize: "0.85rem" }}>CRÉDIT PARTICULIER ET AUTO</span>
                  </div>
                  <h2 style={{ color: "#ffffff", fontSize: "2.2rem", fontWeight: "600" }}>Financez vos ambitions au meilleur taux du marché.</h2>
                  <p style={{ color: "#cbd5e1" }}>Découvrez pourquoi BPER Banca reste le choix n°1 des emprunteurs cette année avec une gestion 100% flexible, transparente et sans frais cachés.</p>
                  <button 
                    onClick={() => setCurrentView("avantages")} 
                    className="btn-white" 
                    style={{ border: "none", cursor: "pointer", fontWeight: "700", background: "#ffffff", color: "#003133", transition: "all 0.3s" }}
                  >
                    En savoir plus
                  </button>
                </div>
              </div>
            </div>

            {/* Bloc Épargne Haut de Gamme sur Fond Blanc / Bordure Vert Nuit */}
            <div className="account-card" style={{ background: "#ffffff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0, 49, 51, 0.04)", borderLeft: "6px solid #003133", borderTop: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                <div>
                  <h3 style={{ color: "#003133", margin: "0 0 8px 0", fontSize: "1.4rem", fontWeight: "600" }}>Livret d'Épargne BPER Privilège</h3>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>Optimisez et sécurisez vos économies avec un taux d'intérêt annuel brut de 3,50% garanti.</p>
                </div>
                <span style={{ background: "#003133", color: "#e6ff6a", padding: "10px 20px", borderRadius: "30px", fontWeight: "700", fontSize: "0.95rem" }}>Rendement : 3.50%</span>
              </div>
            </div>
          </>
        )}

        {/* =========================================================================
            VUE 2 : PAGE DES AVANTAGES COMPÉTITIFS (FOND BLANC & VERT NUIT)
            ========================================================================= */}
        {currentView === "avantages" && (
          <div style={{ background: "#ffffff", padding: "20px 0" }}>
            <button onClick={() => setCurrentView("offres")} style={{ background: "none", border: "none", color: "#003133", cursor: "pointer", fontWeight: "600", marginBottom: "25px", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              ← Retour aux produits
            </button>

            <h2 style={{ color: "#003133", fontSize: "2.4rem", fontWeight: "700", marginTop: 0, marginBottom: "15px" }}>Pourquoi choisir le Prêt Personnel BPER Banca ?</h2>
            <p style={{ color: "#64748b", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "850px", marginBottom: "45px" }}>
              Nous réinventons le crédit à la consommation. Pas de frais cachés, une flexibilité absolue sur vos mensualités et un taux d'intérêt hautement compétitif face aux banques traditionnelles.
            </p>

            {/* Grille des Avantages */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "50px" }}>
              <div style={{ background: "#ffffff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", borderTop: "5px solid #003133" }}>
                <div style={{ background: "#003133", color: "#e6ff6a", width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "1.2rem" }}><i className="fas fa-sliders-h"></i></div>
                <h4 style={{ color: "#003133", fontSize: "1.25rem", margin: "0 0 12px 0", fontWeight: "600" }}>Mensualités Modulables</h4>
                <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>Augmentez ou diminuez le montant de vos remboursements mensuels gratuitement, deux fois par an, selon l'évolution de vos revenus.</p>
              </div>

              <div style={{ background: "#ffffff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", borderTop: "5px solid #003133" }}>
                <div style={{ background: "#003133", color: "#e6ff6a", width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "1.2rem" }}><i className="fas fa-hand-holding-usd"></i></div>
                <h4 style={{ color: "#003133", fontSize: "1.25rem", margin: "0 0 12px 0", fontWeight: "600" }}>Zéro Frais de Dossier</h4>
                <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>Aucuns frais administratifs ne vous seront facturés pour l'étude, l'ouverture ou la mise en place technique de votre dossier bancaire.</p>
              </div>

              <div style={{ background: "#ffffff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: "0 10px 20px rgba(0,0,0,0.02)", borderTop: "5px solid #003133" }}>
                <div style={{ background: "#003133", color: "#e6ff6a", width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", fontSize: "1.2rem" }}><i className="fas fa-bolt"></i></div>
                <h4 style={{ color: "#003133", fontSize: "1.25rem", margin: "0 0 12px 0", fontWeight: "600" }}>Déblocage Rapide sous 48h</h4>
                <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0, lineHeight: "1.6" }}>Après validation finale par notre comité des engagements, les capitaux sont immédiatement crédités sur votre compte courant.</p>
              </div>
            </div>

            {/* TABLEAU COMPARATIF BANCAIRE AVEC LIGNES VERT NUIT */}
            <div style={{ marginBottom: "50px" }}>
              <h3 style={{ color: "#003133", fontSize: "1.5rem", fontWeight: "600", marginBottom: "20px" }}>BPER face aux autres institutions financières</h3>
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem", background: "#ffffff" }}>
                  <thead>
                    <tr style={{ background: "#003133", color: "white" }}>
                      <th style={{ padding: "18px" }}>Critères d'évaluation</th>
                      <th style={{ padding: "18px", background: "#001f21", textAlign: "center", color: "#e6ff6a" }}>BPER Banca</th>
                      <th style={{ padding: "18px" }}>Banques Traditionnelles</th>
                      <th style={{ padding: "18px" }}>Organismes en Ligne</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "18px", fontWeight: "600", color: "#003133" }}>TAEG Moyen Appliqué</td>
                      <td style={{ padding: "18px", textAlign: "center", color: "#003133", fontWeight: "bold", background: "#f0fdf4" }}>4.90% fixe</td>
                      <td style={{ padding: "18px", color: "#64748b" }}>5.95% à 6.80%</td>
                      <td style={{ padding: "18px", color: "#64748b" }}>6.10% à 7.45%</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "18px", fontWeight: "600", color: "#003133" }}>Frais de dossier contractuels</td>
                      <td style={{ padding: "18px", textAlign: "center", color: "#003133", fontWeight: "bold", background: "#f0fdf4" }}>0 € (Gratuit)</td>
                      <td style={{ padding: "18px", color: "#64748b" }}>En moyenne 150 €</td>
                      <td style={{ padding: "18px", color: "#64748b" }}>Inclus d'office</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "18px", fontWeight: "600", color: "#003133" }}>Pénalités de remboursement</td>
                      <td style={{ padding: "18px", textAlign: "center", color: "#003133", fontWeight: "bold", background: "#f0fdf4" }}>Aucune (0%)</td>
                      <td style={{ padding: "18px", color: "#64748b" }}>Jusqu'à 1% du capital</td>
                      <td style={{ padding: "18px", color: "#64748b" }}>Frais réglementaires</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CTA CENTRAL FOND VERT NUIT ET BOUTON BLANC */}
            <div style={{ textAlign: "center", background: "#003133", padding: "45px", borderRadius: "24px", color: "white", boxShadow: "0 20px 30px rgba(0, 49, 51, 0.1)" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "1.7rem", fontWeight: "600" }}>Prêt à concrétiser votre projet ?</h3>
              <p style={{ margin: "0 0 30px 0", color: "#cbd5e1", fontSize: "1rem" }}>Le formulaire prend moins de 3 minutes. Obtenez une pré-acceptation immédiate.</p>
              <button 
                onClick={() => setCurrentView("simulateur")} 
                style={{ background: "#ffffff", color: "#003133", padding: "15px 40px", border: "none", borderRadius: "30px", fontWeight: "700", fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              >
                Démarrer ma demande de prêt en ligne
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            VUE 3 : TUNNEL DE DEMANDE DE PRÊT ÉTAPE PAR ÉTAPE
            ========================================================================= */}
        {currentView === "simulateur" && (
          <div>
            {/* Fil d'Ariane Blanc & Vert Nuit */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "35px", background: "#ffffff", padding: "15px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ fontWeight: "700", color: loanStep === 1 ? "#003133" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #003133" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>1. CONFIGURATION</div>
              <div style={{ fontWeight: "700", color: loanStep === 2 ? "#003133" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #003133" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>2. VOS INFORMATIONS</div>
              <div style={{ fontWeight: "700", color: loanStep === 3 ? "#003133" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #003133" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>3. ENVOI DU DOSSIER</div>
            </div>

            <div style={{ background: "#ffffff", padding: "40px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 15px 35px rgba(0, 49, 51, 0.04)" }}>
              <h2 style={{ color: "#003133", marginBottom: "5px", fontSize: "1.8rem", fontWeight: "700" }}>Demande de Financement en Ligne</h2>
              <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "35px" }}>BPER Banca — Service d'octroi des crédits aux particuliers.</p>

              {/* ÉTAPE 1 : SIMULATEUR */}
              {loanStep === 1 && (
                <div>
                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#003133" }}>Nature de votre projet</label>
                    <select 
                      style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                      value={loanData.loanType}
                      onChange={(e) => setLoanData({...loanData, loanType: e.target.value})}
                    >
                      <option value="Prêt Personnel">Prêt Personnel (Projets Divers)</option>
                      <option value="Prêt Automobile">Financement Véhicule Neuf / Occasion</option>
                      <option value="Prêt Travaux">Rénovation & Aménagement Habitat</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "30px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#003133" }}>Montant recherché (€)</label>
                      <input 
                        type="number" 
                        style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                        value={loanData.amount}
                        onChange={(e) => handleSimulation(e.target.value, loanData.duration)}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#003133" }}>Période de remboursement (mois)</label>
                      <select 
                        style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
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

                  <div style={{ background: "#f0f7f7", padding: "25px", borderRadius: "16px", borderLeft: "6px solid #003133", marginBottom: "35px" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#003133", fontWeight: "600" }}>Engagement Mensuel Estimé</h4>
                    <p style={{ margin: 0, fontSize: "1.7rem", fontWeight: "700", color: "#003133" }}>
                      {loanData.monthlyPayment} € <span style={{ fontSize: "0.95rem", fontWeight: "400", color: "#64748b" }}>/ mois (TAEG contractuel fixe : 4,90%)</span>
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                    <button className="btn-light" style={{ padding: "12px 25px", borderRadius: "30px", border: "1px solid #cbd5e1", background: "none", cursor: "pointer" }} onClick={() => setCurrentView("avantages")}>Retour</button>
                    <button className="btn-white" style={{ background: "#003133", color: "#fff", marginTop: 0, padding: "12px 30px", borderRadius: "30px", border: "none", cursor: "pointer", fontWeight: "600" }} onClick={() => setLoanStep(2)}>Constituer mon dossier</button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : INFORMATIONS EMPRUNTEUR */}
              {loanStep === 2 && (
                <div>
                  <h4 style={{ color: "#003133", marginBottom: "20px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px", fontWeight: "600" }}>Situation Personnelle & Financière</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "#003133", fontWeight: "600" }}>Civilité</label>
                      <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                        <option value="M.">M.</option>
                        <option value="Mme">Mme</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "#003133", fontWeight: "600" }}>Statut Professionnel</label>
                      <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
                        <option value="">Sélectionnez...</option>
                        <option value="CDI">Salarié (CDI)</option>
                        <option value="Indépendant">Entrepreneur / Profession Libérale</option>
                        <option value="Retraité">Cadre Retraité</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "#003133", fontWeight: "600" }}>Nom</label>
                      <input type="text" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.lastName} onChange={(e) => setLoanData({...loanData, lastName: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "#003133", fontWeight: "600" }}>Prénom</label>
                      <input type="text" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.firstName} onChange={(e) => setLoanData({...loanData, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "#003133", fontWeight: "600" }}>Revenus nets par mois (€)</label>
                      <input type="number" placeholder="Ex: 3100" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "#003133", fontWeight: "600" }}>Co-emprunteur</label>
                      <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }} value={loanData.hasCoBorrower} onChange={(e) => setLoanData({...loanData, hasCoBorrower: e.target.value})}>
                        <option value="Non">Non</option>
                        <option value="Oui">Oui</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                    <button className="btn-light" style={{ padding: "12px 25px", borderRadius: "30px", border: "1px solid #cbd5e1", background: "none", cursor: "pointer" }} onClick={() => setLoanStep(1)}>Retour</button>
                    <button className="btn-white" style={{ background: "#003133", color: "#fff", marginTop: 0, padding: "12px 30px", borderRadius: "30px", border: "none", cursor: "pointer", fontWeight: "600" }} disabled={!loanData.lastName || !loanData.income} onClick={() => setLoanStep(3)}>Suivant</button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : CONFIRMATION FINALE */}
              {loanStep === 3 && (
                <div>
                  <div style={{ padding: "25px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
                    <h4 style={{ margin: "0 0 15px 0", color: "#003133", fontWeight: "600" }}>Validation contractuelle du dossier</h4>
                    <p style={{ margin: "6px 0", fontSize: "0.95rem" }}><strong>Titulaire du compte :</strong> {loanData.civility} {loanData.firstName} {loanData.lastName} ({loanData.profession})</p>
                    <p style={{ margin: "6px 0", fontSize: "0.95rem" }}><strong>Capital emprunté :</strong> {loanData.amount} € sur {loanData.duration} mois</p>
                    <p style={{ margin: "6px 0", fontSize: "0.95rem" }}><strong>Charge mensuelle calculée :</strong> {loanData.monthlyPayment} € / mois</p>
                    <p style={{ margin: "6px 0", fontSize: "0.95rem" }}><strong>Capacité déclarée :</strong> {loanData.income} € net / mois</p>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "30px", lineHeight: "1.6" }}>
                    En transmettant ce dossier, vous soumettez formellement votre demande de crédit au service d'analyse des risques et de conformité de <strong>BPER Banca</strong>. Les fonds seront débloqués après validation administrative sous un délai réglementaire de 48h.
                  </p>

                  <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                    <button className="btn-light" style={{ padding: "12px 25px", borderRadius: "30px", border: "1px solid #cbd5e1", background: "none", cursor: "pointer" }} onClick={() => setLoanStep(2)}>Modifier</button>
                    <button 
                      className="btn-white" 
                      style={{ background: "#059669", color: "#fff", marginTop: 0, padding: "12px 30px", borderRadius: "30px", border: "none", cursor: "pointer", fontWeight: "600" }}
                      onClick={() => {
                        alert("Félicitations, votre dossier d'emprunt a été transmis avec succès aux analystes BPER Banca.");
                        setCurrentView("offres");
                        setLoanStep(1);
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
    </div>
  );
}