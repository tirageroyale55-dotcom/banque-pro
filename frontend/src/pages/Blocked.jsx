import { useNavigate } from "react-router-dom";

export default function Blocked() {
  const navigate = useNavigate();

  return (
    <div className="blocked-wrapper">

      <div className="blocked-box">

        <div className="blocked-header">
          <span className="blocked-icon">⛔</span>
          <h2>Accès indisponible</h2>
        </div>

        <p className="blocked-text">
          Pour des raisons de sécurité, l’accès à votre espace est actuellement suspendu.
        </p>

        <p className="blocked-subtext">
          Nous vous invitons à contacter votre conseiller ou le support client
          afin d’obtenir plus d’informations.
        </p>

        <button
          className="blocked-btn"
          onClick={() => navigate("/contact")}
        >
          Contacter le support
        </button>

      </div>

    </div>
  );
}