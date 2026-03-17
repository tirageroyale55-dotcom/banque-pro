import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api("/admin/pending");

        // Sécurise si la réponse n’est pas un tableau
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les demandes");
        setUsers([]); // on vide le tableau si erreur
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  if (loading) return <div className="card">Chargement...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="card">
      <h2>Demandes KYC en attente</h2>

      {users.length === 0 && <p>Aucune demande en attente</p>}

      {users.map(user => (
        <div key={user._id} className="kyc-row">
          <div>
            <strong>{user.nom} {user.prenom}</strong><br />
            <small>{user.email}</small>
          </div>
<Link to={"/admin/client/"+user._id}>
Voir client
</Link>
          <Link className="btn-small" to={`/admin/user/${user._id}`}>
            Vérifier
          </Link>
        </div>
      ))}
    </div>
  );
}