import { useNavigate } from "react-router-dom";

export default function Blocked() {

  const navigate = useNavigate();

  return (
    <div className="blocked-page">

      <div className="blocked-card">

        <h1>⛔ Compte bloqué</h1>

        <p>
          Votre compte est actuellement bloqué pour des raisons de sécurité.
        </p>

        <p>
          Merci de contacter le support client afin de rétablir l’accès.
        </p>

        <button onClick={() => navigate("/contact")}>
          Contacter le support
        </button>

      </div>

    </div>
  );
}