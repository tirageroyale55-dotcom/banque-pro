import { useLocation, useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = location.state?.user;

  // sécurité si accès direct
  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="apply-bg welcome-page">

      <div className="apply-card welcome-card">

        <h2 className="welcome-title">
          Bienvenue {user.prenom} {user.nom}
        </h2>

        <button
          className="btn-solid welcome-btn"
          onClick={() => navigate("/dashboard")}
        >
          Entrer
        </button>

      </div>
    </div>
  );
}