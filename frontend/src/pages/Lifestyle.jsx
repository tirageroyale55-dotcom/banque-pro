import React, { useState, useEffect } from "react";
import "../styles/produits.css"; // Réutilisation de tes utilitaires fluides et sécurisés

export default function Lifestyle() {
  const [myLoans, setMyLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLoans();
  }, []);

  const fetchUserLoans = async () => {
    try {
      const res = await fetch("/api/auth/my-loans", {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyLoans(data);
      }
    } catch (err) {
      console.error("Erreur récupération prêts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire de style professionnel pour les badges BPER Banca
  const renderStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span style={{ background: "#e6f4ea", color: "#137333", padding: "6px 14px", borderRadius: "30px", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <i className="fas fa-check-circle"></i> Accordé & Débloqué
          </span>
        );
      case "REJECTED":
        return (
          <span style={{ background: "#fce8e6", color: "#c5221f", padding: "6px 14px", borderRadius: "30px", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <i className="fas fa-times-circle"></i> Refusé
          </span>
        );
      case "PENDING":
      default:
        return (
          <span style={{ background: "#fef7e0", color: "#b06000", padding: "6px 14px", borderRadius: "30px", fontSize: "0.8rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <i className="fas fa-clock"></i> En cours d'analyse
          </span>
        );
    }
  };

  if (loading) {
    return <div style={{ padding: "30px", fontFamily: "'Segoe UI', sans-serif", color: "#64748b" }}>Mise à jour de votre tableau des engagements...</div>;
  }

  return (
    <div className="page-contente bper-page-container" style={{ padding: "15px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
        
        {/* En-tête Institutionnel BPER */}
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#004f52", fontSize: "1.6rem", margin: "0 0 8px 0", fontWeight: "700" }}>
            Suivi de vos Engagements & Crédits
          </h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem", lineHeight: "1.4" }}>
            Consultez en temps réel l'état d'avancement, les rapports de décision et l'historique réglementaire de vos demandes de financement.
          </p>
        </div>

        {/* Liste des dossiers de l'utilisateur */}
        {myLoans.length === 0 ? (
          <div style={{ background: "white", padding: "40px 20px", borderRadius: "20px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <div style={{ color: "#94a3b8", fontSize: "2.5rem", marginBottom: "15px" }}>
              <i className="fas fa-folder-open"></i>
            </div>
            <h4 style={{ color: "#004f52", margin: "0 0 8px 0", fontSize: "1.1rem" }}>Aucun dossier actif</h4>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem", lineHeight: "1.4" }}>
              Vous n'avez soumis aucune demande de prêt de consommation ou immobilier pour le moment.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {myLoans.map((loan) => (
              <div 
                key={loan._id} 
                style={{ 
                  background: "white", 
                  borderRadius: "20px", 
                  padding: "20px", 
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)", 
                  border: "1px solid #e2e8f0",
                  borderLeft: loan.status === "APPROVED" ? "6px solid #059669" : loan.status === "REJECTED" ? "6px solid #dc2626" : "6px solid #eab308",
                  boxSizing: "border-box",
                  width: "100%"
                }}
              >
                {/* En-tête de la ligne Prêt */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "15px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", color: "#004f52", fontSize: "1.15rem", fontWeight: "700" }}>
                      {loan.loanType}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>
                      Référence dossier : BPER-{loan._id?.substring(0, 8).toUpperCase()} • Introduit le {new Date(loan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {renderStatusBadge(loan.status)}
                  </div>
                </div>

                {/* Métriques Financières du Crédit */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", 
                  gap: "15px", 
                  backgroundColor: "#f8fafc", 
                  padding: "15px", 
                  borderRadius: "12px"
                }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "2px" }}>Capital Sollicité</span>
                    <strong style={{ color: "#004f52", fontSize: "1.2rem" }}>{loan.amount} €</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Plan de Remboursement</span>
                    <strong style={{ color: "#334155", fontSize: "0.95rem" }}>{loan.duration} mois</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Mensualité Estimée</span>
                    <strong style={{ color: "#334155", fontSize: "0.95rem" }}>{loan.monthlyPayment} € / mois</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px" }}>Taux Appliqué</span>
                    <strong style={{ color: "#059669", fontSize: "0.95rem" }}>4.90% (Fixe)</strong>
                  </div>
                </div>

                {/* Notification de motif en cas de rejet (Bancaire strict) */}
                {loan.status === "REJECTED" && (
                  <div style={{ marginTop: "15px", backgroundColor: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "12px" }}>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#c5221f", fontWeight: "700", marginBottom: "4px", textTransform: "uppercase" }}>
                      Motif officiel de la commission des risques :
                    </span>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#9b1c1c", fontStyle: "italic", lineHeight: "1.4" }}>
                      "{loan.rejectionMessage || "Capacité de remboursement insuffisante au vu des standards réglementaires actuels."}"
                    </p>
                  </div>
                )}

                {/* Clause informative en cas d'approbation */}
                {loan.status === "APPROVED" && (
                  <div style={{ marginTop: "15px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px" }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534", lineHeight: "1.4" }}>
                      <i className="fas fa-info-circle"></i> Les fonds correspondants ont été virés sur votre solde disponible. Les prélèvements contractuels débuteront à la date anniversaire le mois prochain.
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}