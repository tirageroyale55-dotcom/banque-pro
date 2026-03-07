import { useLocation, useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateUser = location.state?.user;

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const user = stateUser || storedUser;

  // sécurité si accès direct
  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="apply-bg welcome-page">

      <div className="apply-card welcome-card">

        <h2 className="welcome-title">
          Bienvenue {user.firstname || user.prenom} {user.lastname || user.nom}
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