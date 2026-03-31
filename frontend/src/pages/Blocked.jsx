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

      <div className={`blocked-container ${show ? "show" : ""}`}>

        <div className="blocked-icon-wrap">
          <div className="blocked-pulse"></div>
          <div className="blocked-icon">🔒</div>
        </div>

        <h1>Accès suspendu</h1>

        <p className="blocked-main">
          Pour des raisons de sécurité, l’accès à votre espace client est temporairement suspendu.
        </p>

        <p className="blocked-sub">
          Nous vous invitons à contacter le support afin de rétablir votre accès.
        </p>

        <button
          className="blocked-action"
          onClick={() => navigate("/contact")}
        >
          Contacter le support
        </button>

      </div>

    </div>
  );
}