import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Blocked() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  
  const DURATION = 30; // secondes
  const [timeLeft, setTimeLeft] = useState(DURATION);

  useEffect(() => {
    setTimeout(() => setVisible(true), 150);
  }, []);

  return (
    <div className="blocked-screen">

      <div className={`blocked-card ${visible ? "active" : ""}`}>

        <div className="blocked-icon-zone">
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