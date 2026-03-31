import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Blocked() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      navigate("/");
    }
  }, [seconds, navigate]);

  return (
    <div className="blocked-screen">

      <div className="blocked-card">

        <div className="blocked-icon">
          🔒
        </div>

        <h1>Compte bloqué</h1>

        <p className="blocked-main">
          Pour des raisons de sécurité, l’accès à votre espace client est suspendu.
        </p>

        <p className="blocked-sub">
          Merci de contacter le support pour obtenir plus d’informations.
        </p>

        <div className="blocked-timer">
          Retour à l’accueil dans <strong>{seconds}s</strong>
        </div>

        <button
          className="blocked-btn"
          onClick={() => navigate("/")}
        >
          Retour immédiat
        </button>

      </div>

    </div>
  );
}