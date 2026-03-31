import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Blocked() {
  const navigate = useNavigate();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setTimeout(() => setActive(true), 100);
  }, []);

  return (
    <div className="blocked-screen">

      {/* PARTICULES / ENERGIE */}
      <div className="energy-bg"></div>

      <div className={`blocked-card ${active ? "show" : ""}`}>

        <div className="blocked-icon-zone">
          <div className="blocked-ring"></div>
          <div className="blocked-lock">🔐</div>
        </div>

        <h1>Compte bloqué</h1>

        <p className="blocked-main">
          Pour des raisons de sécurité, l’accès à votre espace est suspendu.
        </p>

        <p className="blocked-sub">
          Merci de contacter le support pour plus d’informations.
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