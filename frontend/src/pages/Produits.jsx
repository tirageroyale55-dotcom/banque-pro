import React, { useState } from "react";
import "../styles/produits.css";

export default function Produits({ isDesktop = false }) {
  // États pour la navigation et le processus de prêt
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [loanStep, setLoanStep] = useState(1);
  const [loanData, setLoanData] = useState({
    loanType: "Prêt Personnel",
    amount: 10000,
    duration: 36,
    monthlyPayment: 290,
    civility: "M.",
    lastName: "",
    firstName: "",
    income: "",
    profession: "",
    hasCoBorrower: "Non"
  });

  // Calcul basique d'une mensualité indicative (Style simulateur bancaire)
  const handleSimulation = (amount, duration) => {
    const rate = 0.049; // Taux indicatif BPER 4.9%
    const monthly = (amount * (rate / 12)) / (1 - Math.pow(1 + rate / 12, -duration));
    setLoanData({
      ...loanData,
      amount: parseInt(amount) || 0,
      duration: parseInt(duration) || 12,
      monthlyPayment: Math.round(monthly)
    });
  };

  // Si l'admin/user clique sur "En savoir plus", on affiche le process de demande
  if (showLoanForm) {
    return (
      <div className={isDesktop ? "" : "page-content"} style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Fil d'Ariane / Processus Étapes */}
        <div className="bper-process-steps" style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", background: "#fff", padding: "15px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ fontWeight: "bold", color: loanStep === 1 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 1 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>1. CONFIGURATION</div>
          <div style={{ fontWeight: "bold", color: loanStep === 2 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 2 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>2. VOS INFORMATIONS</div>
          <div style={{ fontWeight: "bold", color: loanStep === 3 ? "#004f52" : "#94a3b8", borderBottom: loanStep === 3 ? "3px solid #e6ff6a" : "none", paddingBottom: "5px", flex: 1, textAlign: "center", fontSize: "0.85rem" }}>3. VÉRIFICATION & ENVOI</div>
        </div>

        <div className="account-card" style={{ background: "#fff", padding: "25px", borderRadius: "16px" }}>
          <h2 style={{ color: "#004f52", marginBottom: "5px", fontSize: "1.6rem" }}>Demande de Financement en Ligne</h2>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "25px" }}>BPER Banca — Service des engagements de crédits particuliers.</p>

          {/* ÉTAPE 1 : LE SIMULATEUR */}
          {loanStep === 1 && (
            <div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#1e293b" }}>Nature de votre projet</label>
                <select 
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  value={loanData.loanType}
                  onChange={(e) => setLoanData({...loanData, loanType: e.target.value})}
                >
                  <option value="Prêt Personnel">Prêt Personnel (Consommation)</option>
                  <option value="Prêt Automobile">Financement Véhicule Neuf / Occasion</option>
                  <option value="Prêt Travaux">Prêt Travaux & Rénovation</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Montant souhaité (€)</label>
                  <input 
                    type="number" 
                    style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    value={loanData.amount}
                    onChange={(e) => handleSimulation(e.target.value, loanData.duration)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Durée de remboursement (mois)</label>
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

              {/* Récapitulatif de l'offre */}
              <div style={{ background: "#f0f7f7", padding: "20px", borderRadius: "12px", borderLeft: "5px solid #004f52", marginBottom: "25px" }}>
                <h4 style={{ margin: "0 0 10px 0", color: "#004f52" }}>Estimation de votre mensualité indicative</h4>
                <p style={{ margin: 0, fontSize: "1.4rem", fontWeight: "bold", color: "#004f52" }}>
                  {loanData.monthlyPayment} € <span style={{ fontSize: "0.9rem", fontWeight: "normal", color: "#64748b" }}>/ mois (TégéG fixe : 4,90%)</span>
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button className="btn-light" onClick={() => setShowLoanForm(false)}>Annuler</button>
                <button className="btn-white" style={{ background: "#004f52", color: "#fff", marginTop: 0 }} onClick={() => setLoanStep(2)}>Continuer la demande</button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : INFORMATIONS EMPRUNTEUR */}
          {loanStep === 2 && (
            <div>
              <h4 style={{ color: "#004f52", marginBottom: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Situation Personnelle & Professionnelle</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Civilité</label>
                  <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.civility} onChange={(e) => setLoanData({...loanData, civility: e.target.value})}>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Situation Professionnelle</label>
                  <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.profession} onChange={(e) => setLoanData({...loanData, profession: e.target.value})}>
                    <option value="">Sélectionnez...</option>
                    <option value="CDI">Salarié en CDI</option>
                    <option value="CDD">Salarié en CDD</option>
                    <option value="Indépendant">Indépendant / Libéral</option>
                    <option value="Retraité">Retraité</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Nom de famille</label>
                  <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.lastName} onChange={(e) => setLoanData({...loanData, lastName: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Prénom</label>
                  <input type="text" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.firstName} onChange={(e) => setLoanData({...loanData, firstName: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Revenus nets mensuels (€)</label>
                  <input type="number" placeholder="Ex: 2500" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.income} onChange={(e) => setLoanData({...loanData, income: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem" }}>Présence d'un co-emprunteur</label>
                  <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} value={loanData.hasCoBorrower} onChange={(e) => setLoanData({...loanData, hasCoBorrower: e.target.value})}>
                    <option value="Non">Non</option>
                    <option value="Oui">Oui</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button className="btn-light" onClick={() => setLoanStep(1)}>Retour</button>
                <button className="btn-white" style={{ background: "#004f52", color: "#fff", marginTop: 0 }} disabled={!loanData.lastName || !loanData.income} onClick={() => setLoanStep(3)}>Analyser le dossier</button>
              </div>
            </div>
          )}

          {/* ÉTAPE 3 : CONFIRMATION & ANALYSE DE CONFORMITÉ */}
          {loanStep === 3 && (
            <div style={{ textAlignment: "center" }}>
              <div style={{ padding: "20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#004f52" }}>Récapitulatif de votre demande contractuelle</h4>
                <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Demandeur :</strong> {loanData.civility} {loanData.firstName} {loanData.lastName} ({loanData.profession})</p>
                <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Financement demandé :</strong> {loanData.amount} € sur {loanData.duration} mois</p>
                <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Charge mensuelle estimée :</strong> {loanData.monthlyPayment} € / mois</p>
                <p style={{ margin: "5px 0", fontSize: "0.9rem" }}><strong>Revenus déclarés :</strong> {loanData.income} € net / mois</p>
              </div>

              <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "25px", lineHeight: "1.5" }}>
                En cliquant sur "Transmettre le dossier", votre demande sera instantanément poussée vers le tableau de bord d'analyse de conformité des risques de notre direction des engagements BPER Banca. Une réponse définitive vous sera adressée par notification.
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button className="btn-light" onClick={() => setLoanStep(2)}>Modifier</button>
                <button 
                  className="btn-white" 
                  style={{ background: "#059669", color: "#fff", marginTop: 0 }}
                  onClick={() => {
                    alert("Votre demande de prêt a été transmise avec succès au service d'analyse des risques BPER Banca.");
                    setShowLoanForm(false);
                    setLoanStep(1);
                  }}
                >
                  Transmettre le dossier à l'administration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // AFFICHAGE PAR DÉFAUT DE LA SECTION PRODUITS (Avec le design promo demandé)
  return (
    <div className={isDesktop ? "" : "page-content"}>
      <h2 className="cards-title">Nos Produits Financiers</h2>

      {/* BLOC GRAPHIQUE HAUT DE GAMME REVERSE */}
      <div className="promo-card-inner reverse" style={{ display: "grid", background: "white", borderRadius: "32px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
        
        {/* BLOC GAUCHE VISUEL AVEC L'IMAGE DE L'HOMME ASSURÉ AU VÉHICULE */}
        <div className="promo-image-wrapper">
          <img 
            src="watermarked_img_11865039945951112084.png" 
            alt="BPER Crédits et Assurances" 
            className="promo-image"
          />
          {/* BADGE DE TAUX ATTRACTIF BPER */}
          <div className="promo-badge">
            <span className="badge-small">TAEG FIXE</span>
            <span className="badge-big">4.90%</span>
            <span className="badge-old">5.85%</span>
            <span className="badge-label">Exclusivité Web</span>
          </div>
        </div>

        {/* BLOC DROIT SOMBRE AUX COULEURS DE BPER BANCA */}
        <div className="promo-card-visual dark">
          <div className="promo-text-dark">
            <div className="promo-tag">
              <span className="promo-icon"><i className="fas fa-shield-alt" style={{ color: "#fff" }}></i></span>
              <span>FINANCEMENTS & ASSURANCES AUTOMOBILES</span>
            </div>
            <h2>Donnez vie à vos projets sans attendre.</h2>
            <p>Profitez de nos offres de crédit à la consommation et prêts auto modulables. Ajustez vos mensualités en toute simplicité selon votre situation financière.</p>
            <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>Un crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.</p>
            <button 
              onClick={() => setShowLoanForm(true)} 
              className="btn-white" 
              style={{ border: "none", cursor: "pointer" }}
            >
              En savoir plus
            </button>
          </div>
        </div>
      </div>

      {/* AUTRE PRODUIT : CARTE ÉPARGNE EXISTANTE */}
      <div className="account-card" style={{ marginTop: "15px", background: "#fff", padding: "20px", borderRadius: "16px" }}>
        <h3 style={{ color: "#004f52", margin: "0 0 5px 0" }}>Épargne</h3>
        <p style={{ color: "#64748b", margin: 0 }}>Optimisez vos économies avec nos livrets de placement à taux préférentiels bonifiés.</p>
      </div>
    </div>
  );
}