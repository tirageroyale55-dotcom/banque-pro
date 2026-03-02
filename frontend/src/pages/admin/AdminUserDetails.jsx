import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les infos utilisateur
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchUser = async () => {
      try {
        const data = await api(`/admin/user/${id}`, "GET");

        // Vérifie que data est un objet
        if (data && typeof data === "object") {
          setUser(data);
        } else {
          setUser(null);
          setError("Aucun utilisateur trouvé");
        }
      } catch (err) {
        setUser(null);
        setError(err.message || "Erreur lors du chargement du dossier");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>Aucun utilisateur trouvé</p>;

  // Action accepter / refuser
  const action = async (type) => {
    if (!window.confirm("Action définitive. Confirmer ?")) return;

    try {
      await api(`/admin/${type}/${id}`, "POST");
      alert("Dossier traité avec succès");
      navigate("/admin");
    } catch (err) {
      alert(err.message || "Erreur lors du traitement du dossier");
    }
  };

  return (
    <div className="card">
      <h2>Dossier KYC</h2>

      {/* STATUS */}
      <section>
        <h3>Statut</h3>
        <p><strong>{user.status || "Non renseigné"}</strong></p>
      </section>

      {/* IDENTITE */}
      <section>
        <h3>Identité</h3>
        <p>Civilité : {user.civilite || "Non renseigné"}</p>
        <p>Nom : {user.nom || "Non renseigné"}</p>
        <p>Prénom : {user.prenom || "Non renseigné"}</p>
        <p>Date naissance : {user.dateNaissance || "Non renseigné"}</p>
        <p>Lieu naissance : {user.lieuNaissance || "Non renseigné"}</p>
        <p>Nationalité : {user.nationalite || "Non renseigné"}</p>
        <p>Résidence fiscale : {user.residenceFiscale || "Non renseigné"}</p>
      </section>

      {/* CONTACT */}
      <section>
        <h3>Coordonnées</h3>
        <p>Email : {user.email || "Non renseigné"}</p>
        <p>Téléphone : {user.telephone || "Non renseigné"}</p>
        <p>Adresse : {user.adresse || "Non renseigné"}</p>
        <p>{user.codePostal || ""} {user.ville || ""}</p>
        <p>Pays : {user.pays || "Non renseigné"}</p>
      </section>

      {/* FINANCIER */}
      <section>
        <h3>Situation financière</h3>
        <p>Profession : {user.situationProfessionnelle || "Non renseigné"}</p>
        <p>Source revenus : {user.sourceRevenus || "Non renseigné"}</p>
        <p>Revenus mensuels : {user.revenusMensuels ? `${user.revenusMensuels} €` : "Non renseigné"}</p>
      </section>

      {/* DOCUMENTS */}
      <section>
        <h3>Documents</h3>
        {user.pieceIdentiteRecto ? (
          <a href={user.pieceIdentiteRecto} target="_blank" rel="noreferrer">
            📄 Pièce identité recto
          </a>
        ) : <p>Pièce identité recto non fournie</p>}

        <br />

        {user.pieceIdentiteVerso ? (
          <a href={user.pieceIdentiteVerso} target="_blank" rel="noreferrer">
            📄 Pièce identité verso
          </a>
        ) : <p>Pièce identité verso non fournie</p>}
      </section>

      {/* SIGNATURE */}
      <section>
        <h3>Signature</h3>
        {user.signature ? (
          <img
            src={user.signature}
            alt="Signature"
            style={{ maxWidth: "300px", border: "1px solid #ccc" }}
          />
        ) : (
          <p>Aucune signature fournie</p>
        )}
      </section>

      {/* CONSENTEMENT */}
      <section>
        <h3>Contrat</h3>
        <p>{user.acceptContrat ? "✅ Accepté" : "❌ Non accepté"}</p>
      </section>

      {/* ACTIONS ADMIN */}
      <div className="admin-actions">
        <button className="btn-accept" onClick={() => action("validate")}>
          Accepter
        </button>
        <button className="btn-reject" onClick={() => action("reject")}>
          Refuser
        </button>
      </div>
    </div>
  );
}