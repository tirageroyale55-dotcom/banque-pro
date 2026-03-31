import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Blocked() {
  const navigate = useNavigate();

  const DURATION = 30; // secondes
  const [timeLeft, setTimeLeft] = useState(DURATION);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          navigate("/");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progress = ((DURATION - timeLeft) / DURATION) * 100;

  return (
    <div className="blocked-screen">

      {/* 🔴 PROGRESS BAR */}
      <div className="top-progress">
        <div
          className="top-progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="blocked-card show">

        <div className="blocked-icon-zone">
          <div className="blocked-ring"></div>
          <div className="blocked-lock">🔒</div>
        </div>

        <h1>Compte bloqué</h1>

        <p className="blocked-main">
          Pour des raisons de sécurité, l’accès à votre espace est suspendu.
        </p>

        <p className="blocked-sub">
          Vous serez redirigé automatiquement vers l’accueil.
        </p>

        {/* ⏱ TEXTE PRO */}
        <p className="blocked-timer">
          Retour à l’accueil dans <strong>{timeLeft}s</strong>
        </p>

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