import React, { useState, useEffect } from "react";

export default function AdminPrets() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [activeLoanId, setActiveLoanId] = useState(null); 
  const [expandedLoanId, setExpandedLoanId] = useState(null); // Pour afficher les détails du contrat

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const fetchPendingLoans = async () => {
    try {
      const res = await fetch("/api/admin/loans/pending", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (res.ok) setLoans(data);
    } catch (err) {
      console.error("Erreur de récupération des prêts:", err);
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

  if (loading) return <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#004f52" }}>Chargement des dossiers de crédits bancaires...</div>;

  return (
    <div style={{ padding: "15px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        
        <h2 style={{ color: "#004f52", marginBottom: "5px", fontSize: "1.8rem", fontWeight: "700" }}>
          BPER: Banca — Back-Office Engagements
        </h2>
        <p style={{ color: "#475569", marginBottom: "25px", fontSize: "0.95rem", lineHeight: "1.4" }}>
          Analyse réglementaire des risques, examen des signatures électroniques et validation des contrats de crédits.
        </p>

        {loans.length === 0 ? (
          <div style={{ background: "white", padding: "40px 20px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h4 style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>Aucun dossier en attente d'arbitrage de crédit.</h4>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loans.map((loan) => (
              <div 
                key={loan._id} 
                style={{ 
                  background: "white", 
                  borderRadius: "16px", 
                  padding: "20px", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)", 
                  borderLeft: "6px solid #004f52",
                  boxSizing: "border-box",
                  width: "100%"
                }}
              >
                
                {/* En-tête de la fiche de prêt */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  flexWrap: "wrap", 
                  gap: "15px", 
                  borderBottom: "1px solid #f1f5f9", 
                  paddingBottom: "15px", 
                  marginBottom: "15px" 
                }}>
                  <div style={{ flex: "1 1 280px" }}>
                    <span style={{ 
                      background: "#f0f7f7", 
                      color: "#004f52", 
                      padding: "4px 12px", 
                      borderRadius: "30px", 
                      fontSize: "0.75rem", 
                      fontWeight: "700", 
                      textTransform: "uppercase",
                      display: "inline-block",
                      marginBottom: "6px"
                    }}>
                      {loan.loanType}
                    </span>
                    <h3 style={{ margin: "4px 0", color: "#002f34", fontSize: "1.3rem", fontWeight: "700" }}>
                      {loan.civility} {loan.lastName.toUpperCase()} {loan.firstName}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                      <strong>Email :</strong> {loan.user?.email || "N/A"} | <strong>ID unique :</strong> {loan._id}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#004f52" }}>{loan.amount?.toLocaleString()} €</div>
                    <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "500" }}>sur {loan.duration} mois ({loan.monthlyPayment} €/mois)</div>
                  </div>
                </div>

                {/* Profil Financier et Professionnel Instruit */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
                  gap: "12px", 
                  backgroundColor: "#f8fafc", 
                  padding: "15px", 
                  borderRadius: "10px", 
                  marginBottom: "15px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase" }}>Profession Certifiée</span>
                    <strong style={{ color: "#002f34", fontSize: "0.95rem" }}>{loan.profession || "Non renseignée"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase" }}>Revenus Mensuels</span>
                    <strong style={{ color: "#16a34a", fontSize: "0.95rem" }}>{loan.income?.toLocaleString()} € net / mois</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase" }}>Co-Emprunteur</span>
                    <strong style={{ color: "#334155", fontSize: "0.95rem" }}>{loan.hasCoBorrower}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase" }}>Dépôt Dossier</span>
                    <strong style={{ color: "#334155", fontSize: "0.95rem" }}>{new Date(loan.createdAt).toLocaleString()}</strong>
                  </div>
                </div>

                {/* Bouton pour inspecter les pièces de signature */}
                <div style={{ marginBottom: "15px" }}>
                  <button
                    onClick={() => setExpandedLoanId(expandedLoanId === loan._id ? null : loan._id)}
                    style={{ background: "#e2e8f0", color: "#334155", border: "none", padding: "8px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                  >
                    <i className={`fas ${expandedLoanId === loan._id ? "fa-eye-slash" : "fa-eye"}`}></i>
                    {expandedLoanId === loan._id ? "Masquer les pièces contractuelles" : "Visualiser l'accord signé & le corps du contrat"}
                  </button>
                </div>

                {/* Section dépliable d'audit de signature */}
                {expandedLoanId === loan._id && (
                  <div style={{ padding: "15px", background: "#f1f5f9", borderRadius: "10px", marginBottom: "15px", border: "1px solid #cbd5e1" }}>
                    <h5 style={{ margin: "0 0 10px 0", color: "#004f52", fontSize: "0.85rem", textTransform: "uppercase" }}>Vérification de l'empreinte de la signature</h5>
                    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 300px", background: "#fff", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "5px" }}>Tracé numérique utilisateur :</span>
                        {loan.signatureData ? (
                          <img src={loan.signatureData} alt="Signature déposée" style={{ maxWidth: "100%", height: "80px", objectFit: "contain", background: "#fafafa", display: "block", border: "1px dashed #94a3b8" }} />
                        ) : (
                          <span style={{ color: "#dc2626", fontSize: "0.8rem", fontWeight: "bold" }}>⚠️ Aucune signature enregistrée</span>
                        )}
                      </div>
                      <div style={{ flex: "2 1 400px", background: "#fff", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", maxHeight: "120px", overflowY: "auto", fontSize: "0.75rem", fontFamily: "monospace" }}>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", fontFamily: "sans-serif", fontWeight: "bold" }}>Contenu validé au moment du clic :</span>
                        {loan.contractBody || "Généré dynamiquement à partir de la matrice d'édition BPER lors de l'envoi."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Zone d'action de validation / refus */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  {activeLoanId !== loan._id ? (
                    <>
                      <button 
                        onClick={() => setActiveLoanId(loan._id)}
                        style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Refuser le dossier
                      </button>
                      <button 
                        onClick={() => handleDecision(loan._id, "APPROVED")}
                        style={{ background: "#004f52", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem", boxShadow: "0 4px 6px rgba(0,79,82,0.2)" }}
                      >
                        Accepter & Émettre le Contrat Officiel
                      </button>
                    </>
                  ) : (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#fff1f1", padding: "15px", borderRadius: "10px", border: "1px solid #fca5a5" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#991b1b" }}>Notification de rejet (Obligatoire pour le client) :</label>
                      <input 
                        type="text"
                        placeholder="Ex: Capacité d'endettement maximale dépassée suite à l'analyse des pièces justificatives..."
                        value={rejectionMessage}
                        onChange={(e) => setRejectionMessage(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #fca5a5", boxSizing: "border-box", fontSize: "0.85rem" }}
                      />
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => { setActiveLoanId(null); setRejectionMessage(""); }}
                          style={{ background: "#cbd5e1", color: "#334155", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          Annuler
                        </button>
                        <button 
                          onClick={() => handleDecision(loan._id, "REJECTED")}
                          style={{ background: "#dc2626", color: "white", border: "none", padding: "8px 18px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          Confirmer la notification de rejet
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