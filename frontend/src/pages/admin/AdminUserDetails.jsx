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
        setUser(data);
      } catch (err) {
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
        <p><strong>{user.status}</strong></p>
      </section>

      {/* IDENTITE */}
      <section>
        <h3>Identité</h3>
        <p>Civilité : {user.civilite}</p>
        <p>Nom : {user.nom}</p>
        <p>Prénom : {user.prenom}</p>
        <p>Date naissance : {user.dateNaissance}</p>
        <p>Lieu naissance : {user.lieuNaissance}</p>
        <p>Nationalité : {user.nationalite}</p>
        <p>Résidence fiscale : {user.residenceFiscale || "Non renseigné"}</p>
      </section>

      {/* CONTACT */}
      <section>
        <h3>Coordonnées</h3>
        <p>Email : {user.email}</p>
        <p>Téléphone : {user.telephone}</p>
        <p>Adresse : {user.adresse}</p>
        <p>{user.codePostal} {user.ville}</p>
        <p>Pays : {user.pays}</p>
      </section>

      {/* FINANCIER */}
      <section>
        <h3>Situation financière</h3>
        <p>Profession : {user.situationProfessionnelle}</p>
        <p>Source revenus : {user.sourceRevenus}</p>
        <p>Revenus mensuels : {user.revenusMensuels} €</p>
      </section>

      {/* DOCUMENTS */}
      <section>
        <h3>Documents</h3>
        {user.pieceIdentiteRecto && (
          <a href={`http://localhost:5000/${user.pieceIdentiteRecto}`} target="_blank">
            📄 Pièce identité recto
          </a>
        )}
        <br />
        {user.pieceIdentiteVerso && (
          <a href={`http://localhost:5000/${user.pieceIdentiteVerso}`} target="_blank">
            📄 Pièce identité verso
          </a>
        )}
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
