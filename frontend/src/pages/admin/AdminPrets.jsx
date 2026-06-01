import React, { useState, useEffect } from "react";

export default function AdminPrets() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [activeLoanId, setActiveLoanId] = useState(null); 

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

  if (loading) return <div style={{ padding: "20px", fontFamily: "sans-serif" }}>Chargement des dossiers de crédits...</div>;

  return (
    <div style={{ padding: "15px", fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        
        <h2 style={{ color: "#004f52", marginBottom: "10px", fontSize: "1.6rem", wordBreak: "break-word" }}>
          Gestion des Demandes de Financement
        </h2>
        <p style={{ color: "#64748b", marginBottom: "25px", fontSize: "0.95rem", lineHeight: "1.4" }}>
          Examinez les dossiers professionnels des clients en attente de validation de crédit.
        </p>

        {loans.length === 0 ? (
          <div style={{ background: "white", padding: "40px 20px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h4 style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>Aucune demande de prêt en attente pour le moment.</h4>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {loans.map((loan) => (
              <div 
                key={loan._id} 
                style={{ 
                  background: "white", 
                  borderRadius: "20px", 
                  padding: "20px", 
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", 
                  borderLeft: "6px solid #004f52",
                  boxSizing: "border-box",
                  width: "100%",
                  overflow: "hidden"
                }}
              >
                
                {/* En-tête de la carte responsive */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  flexDirection: "row",
                  flexWrap: "wrap", 
                  gap: "15px", 
                  borderBottom: "1px solid #f1f5f9", 
                  paddingBottom: "15px", 
                  marginBottom: "15px" 
                }}>
                  <div style={{ flex: "1 1 280px", minWidth: 0, wordBreak: "break-word" }}>
                    <span style={{ 
                      background: "#e0f2fe", 
                      color: "#0369a1", 
                      padding: "4px 12px", 
                      borderRadius: "30px", 
                      fontSize: "0.75rem", 
                      fontWeight: "bold", 
                      textTransform: "uppercase",
                      display: "inline-block",
                      marginBottom: "6px"
                    }}>
                      {loan.loanType}
                    </span>
                    <h3 style={{ margin: "4px 0", color: "#004f52", fontSize: "1.25rem" }}>
                      {loan.civility} {loan.firstName} {loan.lastName}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", overflowWrap: "break-word" }}>
                      ID Client lié : {loan.user?._id} <br/> E-mail : {loan.user?.email}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: "left", flex: "1 1 auto" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#004f52" }}>{loan.amount} €</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>sur {loan.duration} mois ({loan.monthlyPayment} €/mois)</div>
                  </div>
                </div>

                {/* Profil Financier Saisi adaptable (Passe en colonnes uniques sur les petits smartphones) */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
                  gap: "12px", 
                  backgroundColor: "#f8fafc", 
                  padding: "12px", 
                  borderRadius: "12px", 
                  marginBottom: "20px" 
                }}>
                  <div style={{ wordBreak: "break-word" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Situation Professionnelle</span>
                    <strong style={{ color: "#334155", fontSize: "0.9rem" }}>{loan.profession || "Non spécifiée"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Revenus Mensuels Déclarés</span>
                    <strong style={{ color: "#059669", fontSize: "0.9rem" }}>{loan.income} € / net</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Co-emprunteur</span>
                    <strong style={{ color: "#334155", fontSize: "0.9rem" }}>{loan.hasCoBorrower}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Date de la demande</span>
                    <strong style={{ color: "#334155", fontSize: "0.9rem" }}>{new Date(loan.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>

                {/* Zone d'action fluide et empilable */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "flex-end", 
                  alignItems: "center", 
                  flexWrap: "wrap",
                  gap: "12px",
                  width: "100%"
                }}>
                  
                  {activeLoanId !== loan._id ? (
                    <>
                      <button 
                        onClick={() => setActiveLoanId(loan._id)}
                        style={{ 
                          background: "#fee2e2", 
                          color: "#991b1b", 
                          border: "none", 
                          padding: "10px 16px", 
                          borderRadius: "8px", 
                          fontWeight: "600", 
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          flex: "1 1 auto",
                          textAlign: "center"
                        }}
                      >
                        Refuser le dossier
                      </button>
                      <button 
                        onClick={() => handleDecision(loan._id, "APPROVED")}
                        style={{ 
                          background: "#004f52", 
                          color: "white", 
                          border: "none", 
                          padding: "10px 20px", 
                          borderRadius: "8px", 
                          fontWeight: "600", 
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          flex: "1 1 auto",
                          textAlign: "center"
                        }}
                      >
                        Accepter & Débloquer les fonds
                      </button>
                    </>
                  ) : (
                    /* Formulaire de saisie obligatoire du motif de rejet */
                    <div style={{ 
                      width: "100%", 
                      display: "flex", 
                      flexDirection: "column",
                      gap: "10px", 
                      backgroundColor: "#fff1f1", 
                      padding: "12px", 
                      borderRadius: "10px",
                      boxSizing: "border-box"
                    }}>
                      <input 
                        type="text"
                        placeholder="Saisissez obligatoirement le motif du rejet envoyé au client..."
                        value={rejectionMessage}
                        onChange={(e) => setRejectionMessage(e.target.value)}
                        style={{ 
                          width: "100%", 
                          padding: "10px", 
                          borderRadius: "6px", 
                          border: "1px solid #fca5a5",
                          boxSizing: "border-box",
                          fontSize: "0.85rem"
                        }}
                      />
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", width: "100%" }}>
                        <button 
                          onClick={() => { setActiveLoanId(null); setRejectionMessage(""); }}
                          style={{ 
                            background: "#cbd5e1", 
                            color: "#334155", 
                            border: "none", 
                            padding: "8px 12px", 
                            borderRadius: "6px", 
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          Annuler
                        </button>
                        <button 
                          onClick={() => handleDecision(loan._id, "REJECTED")}
                          style={{ 
                            background: "#dc2626", 
                            color: "white", 
                            border: "none", 
                            padding: "8px 15px", 
                            borderRadius: "6px", 
                            fontWeight: "bold", 
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          Confirmer le Rejet
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