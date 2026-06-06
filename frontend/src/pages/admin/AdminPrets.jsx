import React, { useState, useEffect } from "react";

export default function AdminPrets() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processApproval = async (loanId) => {
    try {
      const res = await fetch(`/api/admin/loan-decision/${loanId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ decision: "APPROVED" })
      });
      const data = await res.json();
      alert(data.message);
      fetchPendingLoans();
    } catch (err) {
      alert("Erreur de traitement réseau.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Chargement sécurisé de la base de données...</div>;

  return (
    <div style={{ padding: "20px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#004f52" }}>Espace d'Arbitrage des Prêts - BPER Banca</h2>
      
      {loans.length === 0 ? (
        <p>Aucun dossier en attente d'émission.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loans.map((loan) => (
            <div key={loan._id} style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <div>
                  <h3>{loan.lastName?.toUpperCase()} {loan.firstName}</h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Montant sollicité : <strong>{loan.amount} EUR</strong></p>
                </div>
                <button 
                  onClick={() => setExpandedLoanId(expandedLoanId === loan._id ? null : loan._id)}
                  style={{ background: "#004f52", color: "white", padding: "8px 12px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  {expandedLoanId === loan._id ? "Hide / Fermer la vue PDF" : "👁️ Voir l'exact aperçu du Contrat PDF"}
                </button>
              </div>

              {/* APERÇU IDÉAL DU PDF QUE LE CLIENT VA RECEVOIR DIRECTEMENT DANS SON MAIL */}
              {expandedLoanId === loan._id && (
                <div style={{ border: "2px solid #004f52", padding: "20px", marginTop: "15px", background: "#ffffff", fontFamily: "'Times New Roman', Times, serif" }}>
                  <div style={{ background: "#004f52", padding: "10px", color: "#fff", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <span>BPER: Banca</span>
                    <span>RÉF: BPER-CONTRACT-{loan._id}</span>
                  </div>
                  
                  <div style={{ padding: "10px 20px" }}>
                    <h2 style={{ textAlign: "center", color: "#004f52" }}>OFFRE PRÉALABLE DE CRÉDIT</h2>
                    <p><strong>Bénéficiaire :</strong> {loan.civility} {loan.lastName?.toUpperCase()} {loan.firstName}</p>
                    <p><strong>Profession :</strong> {loan.profession}</p>
                    <p><strong>Montant du Capital :</strong> {loan.amount} EUR</p>
                    <hr/>
                    <p style={{ fontSize: "0.9rem", textAlign: "justify" }}>
                      <em>[Texte des Articles 1 à 5 de Produits.jsx reproduit à l'identique dans le moteur PDF...]</em>
                    </p>

                    {/* Bloc visuel de contrôle des signatures alignées */}
                    <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", borderTop: "1px solid #000", paddingTop: "15px" }}>
                      <div style={{ width: "45%" }}>
                        <strong>L'Emprunteur (En bas à gauche) :</strong>
                        <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem" }}>{loan.firstName} {loan.lastName?.toUpperCase()}</p>
                        <img src={loan.signatureData} alt="Signature déposée" style={{ width: "100%", height: "70px", objectFit: "contain", border: "1px dashed red", marginTop: "5px" }} />
                      </div>
                      <div style={{ width: "45%", textAlign: "right" }}>
                        <strong>BPER Banca (En bas à droite) :</strong>
                        <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem" }}>Le Directeur Général</p>
                        <div style={{ fontStyle: "italic", color: "#004f52", fontSize: "0.8rem", marginTop: "10px" }}>[ Cachet & Griffe Pré-embarqués ]</div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              <div style={{ marginTop: "15px", textAlign: "right" }}>
                <button 
                  onClick={() => processApproval(loan._id)}
                  style={{ background: "#16a34a", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  🚀 Valider & Envoyer le contrat PDF par mail au client
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}