import React, { useState, useEffect } from "react";

export default function AdminPrets() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [activeLoanId, setActiveLoanId] = useState(null); 
  const [expandedLoanId, setExpandedLoanId] = useState(null); 

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

  if (loading) return <div style={{ padding: "20px", fontFamily: "sans-serif", color: "#004f52" }}>Connexion sécurisée aux serveurs d'engagements BPER...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f1f5f9", minHeight: "100vh", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ color: "#004f52", margin: 0, fontSize: "1.7rem", fontWeight: "bold" }}>BPER: Banca — Portail de Validation</h2>
            <p style={{ color: "#475569", margin: "4px 0 0 0", fontSize: "0.9rem" }}>Vérification des signatures numériques et émission automatisée des contrats PDF.</p>
          </div>
        </div>

        {loans.length === 0 ? (
          <div style={{ background: "#fff", padding: "40px", borderRadius: "12px", textAlign: "center", border: "1px solid #cbd5e1" }}>
            <p style={{ color: "#64748b", margin: 0, fontWeight: "500" }}>Aucune demande de financement en attente d'approbation contractuelle.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {loans.map((loan) => (
              <div key={loan._id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", borderLeft: "6px solid #004f52" }}>
                
                {/* En tête résumé */}
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "15px" }}>
                  <div>
                    <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold" }}>{loan.loanType}</span>
                    <h3 style={{ margin: "5px 0", color: "#0f172a" }}>{loan.civility} {loan.lastName?.toUpperCase()} {loan.firstName}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>ID Dossier : {loan._id} | Client : {loan.user?.email}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#004f52" }}>{loan.amount?.toLocaleString()} €</div>
                    <div style={{ fontSize: "0.8rem", color: "#475569" }}>{loan.duration} mois — {loan.monthlyPayment} €/mois</div>
                  </div>
                </div>

                {/* Grille des caractéristiques */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "15px" }}>
                  <div><span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Profession déclarée</span><strong>{loan.profession || "Non spécifiée"}</strong></div>
                  <div><span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Ressources mensuelles</span><strong style={{ color: "#16a34a" }}>{loan.income} € net</strong></div>
                  <div><span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Co-emprunteur</span><strong>{loan.hasCoBorrower}</strong></div>
                  <div><span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Créé le</span><strong>{new Date(loan.createdAt).toLocaleDateString()}</strong></div>
                </div>

                {/* Accordéon d'examen visuel du contrat */}
                <div style={{ marginBottom: "20px" }}>
                  <button 
                    onClick={() => setExpandedLoanId(expandedLoanId === loan._id ? null : loan._id)}
                    style={{ padding: "8px 14px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", color: "#334155" }}
                  >
                    {expandedLoanId === loan._id ? "🔼 Masquer la matrice d'audit" : "🔽 Inspecter l'alignement des Signatures et du Contrat"}
                  </button>
                </div>

                {expandedLoanId === loan._id && (
                  <div style={{ border: "1px solid #94a3b8", padding: "20px", background: "#fff", borderRadius: "4px", marginBottom: "20px", fontFamily: "'Times New Roman', serif" }}>
                    <div style={{ textSelf: "center", textAlign: "center", borderBottom: "2px solid #004f52", paddingBottom: "10px", marginBottom: "15px" }}>
                      <h4 style={{ margin: 0, color: "#004f52", textTransform: "uppercase" }}>Offre Préalable de Crédit — Matrice PDF</h4>
                    </div>
                    <p style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#475569" }}>Articles 1 à 5 acceptés par consentement numérique via jeton unique.</p>
                    
                    {/* Visualisation de l'alignement exact exigé pour le PDF */}
                    <div style={{ marginTop: "30px", borderTop: "1px solid #000", paddingTop: "15px", display: "flex", justifyContent: "space-between" }}>
                      <div style={{ width: "45%" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#004f52" }}>À GAUCHE : Emprunteur</span><br/>
                        <span style={{ fontSize: "0.75rem" }}>{loan.firstName} {loan.lastName?.toUpperCase()}</span><br/>
                        <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Date : {new Date(loan.createdAt).toLocaleDateString()}</span>
                        <img src={loan.signatureData} alt="Signature client" style={{ width: "100%", maxHeight: "70px", objectFit: "contain", border: "1px dashed #cbd5e1", marginTop: "5px", background: "#fafafa" }} />
                      </div>
                      <div style={{ width: "45%", textAlign: "right" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#004f52" }}>À DROITE : Direction BPER</span><br/>
                        <span style={{ fontSize: "0.75rem" }}>Cachet Officiel & Griffe Secrétariat</span><br/>
                        <div style={{ color: "#0369a1", fontSize: "0.7rem", fontWeight: "bold", marginTop: "10px" }}>[ CACHET ÉLECTRONIQUE BPER BANCA SUR PDF ]</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Traitement Décisionnel */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  {activeLoanId !== loan._id ? (
                    <>
                      <button onClick={() => setActiveLoanId(loan._id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "0.85rem" }}>Refuser le dossier</button>
                      <button onClick={() => handleDecision(loan._id, "APPROVED")} style={{ background: "#004f52", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem" }}>Accepter & Générer le PDF signé</button>
                    </>
                  ) : (
                    <div style={{ width: "100%", background: "#fff1f1", padding: "15px", borderRadius: "8px", border: "1px solid #fca5a5" }}>
                      <input type="text" placeholder="Indiquer la raison bancaire du refus..." value={rejectionMessage} onChange={(e) => setRejectionMessage(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #fca5a5" }} />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button onClick={() => setActiveLoanId(null)} style={{ background: "#cbd5e1", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>Annuler</button>
                        <button onClick={() => handleDecision(loan._id, "REJECTED")} style={{ background: "#dc2626", color: "white", border: "none", padding: "6px 15px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Confirmer le Rejet</button>
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