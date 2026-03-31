import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Blocked() {
  const navigate = useNavigate();

  const [animate, setAnimate] = useState(false);
  const [freeze, setFreeze] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);

    // 🔥 STOP animation après 2s
    setTimeout(() => setFreeze(true), 2000);
  }, []);

  return (
    <div className="blocked-screen">

      <div className={`blocked-card ${animate ? "show" : ""}`}>

        <div className={`blocked-icon-zone ${freeze ? "freeze" : ""}`}>
          <div className="blocked-ring"></div>
          <div className="blocked-lock">🔒</div>
        </div>

        <h1>Compte bloqué</h1>

        <p className="blocked-text">
          L’accès à votre espace client a été suspendu pour des raisons de sécurité.
        </p>

        <p className="blocked-sub">
          Merci de contacter le support afin de rétablir votre accès.
        </p>

        <button
          className="blocked-btn-red"
          onClick={() => navigate("/contact")}
        >
          Contacter le support
        </button>

      </div>

    </div>
  );
}