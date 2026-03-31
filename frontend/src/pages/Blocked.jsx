import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Blocked() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 150);
  }, []);

  return (
    <div className="blocked-screen">

      {/* 💳 CARTE BANCAIRE */}
      <div className={`card-preview ${show ? "show" : ""}`}>
        <div className="card-chip"></div>
        <div className="card-number">**** **** **** 4589</div>
        <div className="card-name">CLIENT PREMIUM</div>

        {/* OVERLAY BLOQUÉ */}
        <div className="card-blocked-overlay">
          <span>CARTE BLOQUÉE</span>
        </div>
      </div>

      {/* 🚫 MESSAGE */}
      <div className={`blocked-card ${show ? "show" : ""}`}>

        <div className="lock-wrap">
          <div className="lock-ring"></div>
          <div className="lock-icon">🔒</div>
        </div>

        <h1>Compte bloqué</h1>

        <p>
          Pour des raisons de sécurité, l’accès à votre espace client est suspendu.
        </p>

        <button onClick={() => navigate("/contact")}>
          Contacter le support
        </button>

      </div>

    </div>
  );
}