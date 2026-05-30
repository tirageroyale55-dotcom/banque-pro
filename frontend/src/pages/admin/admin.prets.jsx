import React, { useState, useEffect } from "react";

export default function AdminPrets() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [activeLoanId, setActiveLoanId] = useState(null); // Pour cibler le prêt en cours de rejet

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
      
      // Reset et rechargement
      setRejectionMessage("");
      setActiveLoanId(null);
      fetchPendingLoans();
    } catch (err) {
      console.error("Erreur décision:", err);
      alert("Erreur lors de l'envoi de la décision");
    }
  };

  if (loading) return <div style={{ padding: "30px", fontFamily: "sans-serif" }}>Chargement des dossiers de crédits...</div>;

  return (
    <div style={{ padding: "30px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ color: "#004f52", marginBottom: "10px" }}>Gestion des Demandes de Financement</h2>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>Examinez les dossiers professionnels des clients en attente de validation de crédit.</p>

        {loans.length === 0 ? (
          <div style={{ background: "white", padding: "40px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h4 style={{ color: "#64748b", margin: 0 }}>Aucune demande de prêt en attente pour le moment.</h4>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "25px" }}>
            {loans.map((loan) => (
              <div key={loan._id} style={{ background: "white", borderRadius: "20px", padding: "25px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", borderLeft: "6px solid #004f52" }}>
                
                {/* En-tête de la carte */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "15px" }}>
                  <div>
                    <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "30px", fontSize: "0.8rem", fontWeight: "bold", uppercase: "true" }}>{loan.loanType}</span>
                    <h3 style={{ margin: "8px 0 4px 0", color: "#004f52" }}>{loan.civility} {loan.firstName} {loan.lastName}</h3>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>ID Client lié : {loan.user?._id} | E-mail : {loan.user?.email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: "#004f52" }}>{loan.amount} €</div>
                    <div style={{ fontSize: "0.9rem", color: "#64748b" }}>sur {loan.duration} mois ({loan.monthlyPayment} €/mois)</div>
                  </div>
                </div>

                {/* Profil Financier Saisi */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", backgroundColor: "#f8fafc", padding: "15px", borderRadius: "12px", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Situation Professionnelle</span>
                    <strong style={{ color: "#334155" }}>{loan.profession || "Non spécifiée"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Revenus Mensuels Déclarés</span>
                    <strong style={{ color: "#059669" }}>{loan.income} € / net</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Co-emprunteur</span>
                    <strong style={{ color: "#334155" }}>{loan.hasCoBorrower}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>Date de la demande</span>
                    <strong style={{ color: "#334155" }}>{new Date(loan.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Zone d'action */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "15px" }}>
                  
                  {activeLoanId !== loan._id ? (
                    <>
                      <button 
                        onClick={() => setActiveLoanId(loan._id)}
                        style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                      >
                        Refuser le dossier
                      </button>
                      <button 
                        onClick={() => handleDecision(loan._id, "APPROVED")}
                        style={{ background: "#004f52", color: "white", border: "none", padding: "10px 25px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
                      >
                        Accepter & Débloquer les fonds
                      </button>
                    </>
                  ) : (
                    /* Si on clique sur Refuser, on ouvre l'input pour le motif obligatoire */
                    <div style={{ width: "100%", display: "flex", gap: "10px", alignItems: "center", backgroundColor: "#fff1f1", padding: "15px", borderRadius: "10px" }}>
                      <input 
                        type="text"
                        placeholder="Saisissez obligatoirement le motif du rejet envoyé au client..."
                        value={rejectionMessage}
                        onChange={(e) => setRejectionMessage(e.target.value)}
                        style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #fca5a5" }}
                      />
                      <button 
                        onClick={() => handleDecision(loan._id, "REJECTED")}
                        style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 15px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                      >
                        Confirmer le Rejet
                      </button>
                      <button 
                        onClick={() => { setActiveLoanId(null); setRejectionMessage(""); }}
                        style={{ background: "#cbd5e1", color: "#334155", border: "none", padding: "10px 15px", borderRadius: "6px", cursor: "pointer" }}
                      >
                        Annuler
                      </button>
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