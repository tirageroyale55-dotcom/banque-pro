import { Clock, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Pending() {
  const navigate = useNavigate();
  const [reference, setReference] = useState("");

  /* 🔢 Génération référence dossier */
  useEffect(() => {
    const storedRef = sessionStorage.getItem("dossierRef");

    if (storedRef) {
      setReference(storedRef);
      return;
    }

    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);

    const ref = `BPER-${year}-${random}`;
    sessionStorage.setItem("dossierRef", ref);
    setReference(ref);
  }, []);

  return (
    <div className="apply-bg">

      <div className="apply-card pending-card">

        <div className="pending-icon">
          <Clock size={42} />
        </div>

        <h2 className="apply-title">
          Demande en cours de validation
        </h2>

        <p className="pending-text">
          Votre demande d’ouverture de compte a bien été transmise à nos services.
        </p>

        <p className="pending-ref">
          Référence dossier :
          <strong> {reference}</strong>
        </p>

        <p className="pending-text">
          Vous recevrez un email dès validation de votre dossier.
        </p>

        <p className="pending-delay">
          Délai moyen de traitement : <strong>24 à 48 heures ouvrées</strong>
        </p>

        <button
          className="btn-solid pending-home-btn"
          onClick={() => navigate("/")}
        >
          <Home size={18} />
          Retour à l’accueil
        </button>

      </div>

    </div>
  );
}
