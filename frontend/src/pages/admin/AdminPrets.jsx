import React, { useState, useEffect } from "react";

export default function AdminPrets() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [activeLoanId, setActiveLoanId] = useState(null);
  const [expandedLoanId, setExpandedLoanId] = useState(null);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const fetchPendingLoans = async () => {
    try {
      setDebugError(null);
      const res = await fetch("/api/admin/loans/pending", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (!res.ok) {
        throw new Error(`Le serveur a répondu avec un statut ${res.status}. Vérifiez le préfixe de votre route dans server.js ou le token admin.`);
      }

      const data = await res.json();
      
      // Diagnostic si le tableau arrive vide du serveur
      if (Array.isArray(data) && data.length === 0) {
        console.warn("L'API fonctionne mais la base de données ne contient aucun prêt avec le statut 'PENDING'.");
      }

      setLoans(data);
    } catch (err) {
      console.error("Erreur de récupération des prêts:", err);
      setDebugError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (loanId, decision) => {
    if (decision === "REJECTED" && !rejectionMessage) {
      alert("Veuillez saisir un motif de rejet pour le client.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/loan-decision/${loanId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          decision,
          message: decision === "REJECTED" ? rejectionMessage : ""
        })
      });

      const data = await res.json();
      alert(data.message);
      
      setRejectionMessage("");
      setActiveLoanId(null);
      fetchPendingLoans();
    } catch (err) {
      console.error("Erreur décision:", err);
      alert("Erreur lors de l'envoi de la décision");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif", color: "#004f52", fontWeight: "bold" }}>
        Chargement de l'espace d'arbitrage sécurisé BPER Banca...
      </div>
    );
  }

  return (
    <div style={{ padding: "30px", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Vos Styles de l'En-tête d'Origine */}
        <div style={{ borderBottom: "3px solid #004f52", paddingBottom: "20px", marginBottom: "35px" }}>
          <h1 style={{ color: "#004f52", margin: 0, fontSize: "2.2rem", fontWeight: "700", letterSpacing: "-0.5px" }}>
            BPER: <span style={{ fontWeight: "300" }}>Banca</span>
          </h1>
          <p style={{ color: "#475569", margin: "8px 0 0 0", fontSize: "1rem", fontWeight: "500" }}>
            Direction Générale des Engagements — Validation des Offres Préalables de Crédit
          </p>
        </div>

        {/* BLOC DE DIAGNOSTIC (S'affiche uniquement en cas de problème de communication avec l'API) */}
        {debugError && (
          <div style={{ background: "#fff1f1", border: "1px solid #fca5a5", color: "#991b1b", padding: "15px", borderRadius: "8px", marginBottom: "25px", fontSize: "0.9rem" }}>
            <strong>🚨 Problème technique détecté :</strong> {debugError}
            <br />
            <span style={{ fontSize: "0.8rem", color: "#555" }}>
              Assurez-vous que votre fichier <code>server.js</code> utilise bien le bon préfixe (ex: <code>app.use('/api/admin', adminRoutes)</code>) et que vous êtes connecté avec un compte Admin valide.
            </span>
          </div>
        )}

        {loans.length === 0 ? (
          /* Votre Design de carte d'origine pour l'état vide */
          <div style={{ background: "#ffffff", padding: "50px 30px", borderRadius: "12px", textAlign: "center", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📁</div>
            <p style={{ color: "#64748b", margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>
              Aucun dossier de crédit n'est actuellement en attente d'émission contractuelle.
            </p>
            <p style={{ color: "#94a3b8", margin: "5px 0 0 0", fontSize: "0.9rem" }}>
              Toutes les signatures électroniques soumises par les clients ont été traitées.
            </p>
            <button 
              onClick={fetchPendingLoans} 
              style={{ marginTop: "20px", padding: "8px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}
            >
              🔄 Actualiser la liste
            </button>
          </div>
        ) : (
          /* Votre Design de grille et de cartes d'origine */
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {loans.map((loan) => (
              <div 
                key={loan._id} 
                style={{ 
                  background: "#ffffff", 
                  borderRadius: "12px", 
                  padding: "25px", 
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", 
                  borderLeft: "6px solid #004f52",
                  borderTop: "1px solid #e2e8f0",
                  borderRight: "1px solid #e2e8f0",
                  borderBottom: "1px solid #e2e8f0"
                }}
              >
                
                {/* Ligne principale d'informations d'origine */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "20px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ background: "#ccfbf1", color: "#115e59", padding: "4px 12px", borderRadius: "50px", fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase" }}>
                      {loan.loanType}
                    </span>
                    <h3 style={{ margin: "10px 0 5px 0", color: "#0f172a", fontSize: "1.4rem", fontWeight: "700" }}>
                      {loan.civility} {loan.lastName?.toUpperCase()} {loan.firstName}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                      Référence Dossier : <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{loan._id}</code> | Email : <strong>{loan.user?.email || loan.email}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#004f52", letterSpacing: "-0.5px" }}>
                      {loan.amount?.toLocaleString()} EUR
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#475569", fontWeight: "500", marginTop: "2px" }}>
                      {loan.duration} mois — {loan.monthlyPayment?.toLocaleString()} € / mois
                    </div>
                  </div>
                </div>

                {/* Grille des caractéristiques financières d'origine */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", background: "#f8fafc", padding: "15px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block", marginBottom: "2px" }}>Profession du client</span>
                    <strong style={{ color: "#334155" }}>{loan.profession || "Non renseignée"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block", marginBottom: "2px" }}>Revenus nets mensuels</span>
                    <strong style={{ color: "#16a34a" }}>{loan.income?.toLocaleString()} € / mois</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block", marginBottom: "2px" }}>Date de la demande</span>
                    <strong style={{ color: "#334155" }}>{new Date(loan.createdAt).toLocaleDateString("fr-FR")}</strong>
                  </div>
                </div>

                {/* Bouton d'inspection pour dérouler la copie conforme avant génération */}
                <div style={{ marginBottom: "20px" }}>
                  <button 
                    onClick={() => setExpandedLoanId(expandedLoanId === loan._id ? null : loan._id)}
                    style={{ 
                      padding: "10px 16px", 
                      background: "#fff", 
                      border: "1px solid #cbd5e1", 
                      borderRadius: "6px", 
                      fontSize: "0.85rem", 
                      fontWeight: "600", 
                      cursor: "pointer", 
                      color: "#004f52",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                  >
                    {expandedLoanId === loan._id ? "🔼 Masquer la matrice d'audit du contrat" : "👁️ Inspecter la copie conforme exacte du Contrat PDF avant envoi"}
                  </button>
                </div>

                {/* REPRODUCTION VISUELLE FIDÈLE DU CONTRAT EXTRACTIBLE */}
                {expandedLoanId === loan._id && (
                  <div style={{ border: "2px solid #cbd5e1", padding: "30px", background: "#ffffff", borderRadius: "6px", marginBottom: "25px", fontFamily: "'Times New Roman', Times, serif", color: "#000", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)" }}>
                    
                    <div style={{ backgroundColor: "#004f52", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff", marginBottom: "25px" }}>
                      <span style={{ fontSize: "1.2rem", fontWith: "bold", fontFamily: "sans-serif" }}>BPER: Banca</span>
                      <span style={{ fontSize: "0.75rem", fontFamily: "sans-serif", opacity: 0.9 }}>RÉFÉRENCE CONTRAT ELECTRIQUE : BPER-CONTRACT-{loan._id}</span>
                    </div>
                    
                    <div style={{ textAlign: "center", marginBottom: "25px", borderBottom: "2px solid #004f52", paddingBottom: "15px" }}>
                      <h2 style={{ margin: "0 0 5px 0", fontSize: "1.6rem", color: "#004f52", textTransform: "uppercase", letterSpacing: "0.5px" }}>Offre Préalable de Crédit</h2>
                      <p style={{ margin: 0, fontStyle: "italic", color: "#475569", fontSize: "0.85rem", fontFamily: "sans-serif" }}>Contrat régi conformément aux directives bancaires européennes</p>
                    </div>

                    <div style={{ fontSize: "1rem", lineHeight: "1.6", textAlign: "justify" }}>
                      <p><strong>Organisme Prêteur :</strong> BPER Banca S.p.A.</p>
                      <p><strong>Bénéficiaire :</strong> {loan.civility} {loan.lastName?.toUpperCase()} {loan.firstName}</p>
                      <p><strong>Montant validé :</strong> {loan.amount?.toLocaleString()} EUR</p>
                      
                      <h4 style={{ color: "#004f52", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginTop: "20px" }}>ARTICLE 1 : OBJET ET ASSIETTE DU FINANCEMENT</h4>
                      <p>La BPER Banca consent au client, qui l'accepte, un crédit d'un montant de {loan.amount?.toLocaleString()} EUR au titre de l'offre {loan.loanType}...</p>
                      
                      <h4 style={{ color: "#004f52", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginTop: "20px" }}>ARTICLE 2 : CONDITIONS DE REMBOURSEMENT</h4>
                      <p>Remboursement sur une durée ferme de {loan.duration} mois avec une mensualité fixe de {loan.monthlyPayment?.toLocaleString()} EUR par mois au TAEG contractuel de 4,90%.</p>
                    </div>

                    {/* Zone de contrôle géométrique des signatures basse gauche / basse droite */}
                    <div style={{ marginTop: "40px", borderTop: "1px solid #000", paddingTop: "20px", display: "flex", justifyContent: "space-between" }}>
                      <div style={{ width: "45%", fontFamily: "sans-serif" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#004f52" }}>✍️ L'Emprunteur (Bas à gauche) :</span>
                        <p style={{ margin: "3px 0", fontSize: "0.8rem", color: "#475569" }}>Fait à distance par : {loan.firstName} {loan.lastName?.toUpperCase()}</p>
                        {loan.signatureData ? (
                          <img src={loan.signatureData} alt="Signature enregistrée du client" style={{ width: "100%", maxWidth: "180px", height: "75px", objectFit: "contain", border: "1px dashed #14b8a6", marginTop: "5px", background: "#f8fafc" }} />
                        ) : (
                          <div style={{ color: "#dc2626", fontSize: "0.8rem", fontStyle: "italic", marginTop: "5px" }}>⚠️ Aucune donnée de signature trouvée pour ce dossier.</div>
                        )}
                      </div>
                      <div style={{ width: "45%", textAlign: "right", fontFamily: "sans-serif" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#004f52" }}>🏢 Pour la banque BPER (Bas à droite) :</span>
                        <p style={{ margin: "3px 0", fontSize: "0.8rem", color: "#475569" }}>Le Directeur Général des Engagements</p>
                        <div style={{ color: "#0369a1", fontSize: "0.8rem", fontWeight: "bold", marginTop: "15px", background: "#f0f9ff", padding: "8px", borderRadius: "4px", border: "1px dashed #0369a1", display: "inline-block" }}>
                          [ CACHET OFFICIEL & GRIFFE AUTOMATIQUES ]
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Vos boutons d'origine pour l'action administrative */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "15px" }}>
                  {activeLoanId !== loan._id ? (
                    <>
                      <button 
                        onClick={() => setActiveLoanId(loan._id)} 
                        style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.9rem" }}
                      >
                        Refuser le dossier
                      </button>
                      <button 
                        onClick={() => handleDecision(loan._id, "APPROVED")} 
                        style={{ background: "#004f52", color: "#ffffff", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem", boxShadow: "0 2px 4px rgba(0,79,82,0.2)" }}
                      >
                        Accepter & Émettre le PDF Signé
                      </button>
                    </>
                  ) : (
                    <div style={{ width: "100%", background: "#fef2f2", padding: "20px", borderRadius: "8px", border: "1px solid #fca5a5" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "600", color: "#991b1b" }}>Motif réglementaire du refus bancaire :</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Taux d'endettement trop élevé ou pièces non conformes..." 
                        value={rejectionMessage} 
                        onChange={(e) => setRejectionMessage(e.target.value)} 
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #fca5a5", boxSizing: "border-box", marginBottom: "12px" }} 
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button onClick={() => setActiveLoanId(null)} style={{ background: "#e2e8f0", color: "#334155", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500" }}>
                          Annuler
                        </button>
                        <button onClick={() => handleDecision(loan._id, "REJECTED")} style={{ background: "#dc2626", color: "#white", border: "none", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>
                          Confirmer le Rejet du Prêt
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}