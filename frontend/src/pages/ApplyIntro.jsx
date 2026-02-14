import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  UserCheck,
  MapPin,
  Briefcase,
  IdCard,
  PenTool,
  ClipboardCheck
} from "lucide-react";

export default function ApplyIntro() {
  const navigate = useNavigate();

  const continueFlow = () => {
  sessionStorage.setItem("applyAllowed", "true");
  navigate("/apply/form");
 // ✅ ROUTE EXISTANTE
};


  return (
    <div className="apply-intro-page">
      <div className="apply-intro-card">

        <button
  type="button"
  className="back-arrow"
  onClick={() => navigate("/")}
  aria-label="Retour à l’accueil"
>
  <ArrowLeft size={20} />
</button>


        {/* HEADER */}
        <div className="apply-header">
          <span>Ouverture de compte • BPER BANQUE</span>
        </div>

        <h1>Que va-t-il se passer maintenant&nbsp;?</h1>

        <p className="subtitle">
          L’ouverture de votre compte se déroule en <strong>6 étapes simples et sécurisées</strong> :
        </p>

        {/* STEPS */}
        <div className="steps-card">

          <div className="step">
            <UserCheck size={22} />
            <span>Renseigner vos informations personnelles</span>
          </div>

          <div className="step">
            <MapPin size={22} />
            <span>Indiquer vos coordonnées et votre résidence fiscale</span>
          </div>

          <div className="step">
            <Briefcase size={22} />
            <span>Préciser votre situation professionnelle et vos revenus</span>
          </div>

          <div className="step">
            <IdCard size={22} />
            <span>Téléverser votre pièce d’identité</span>
          </div>

          <div className="step">
            <PenTool size={22} />
            <span>Lire et signer électroniquement le contrat</span>
          </div>

          <div className="step">
            <ClipboardCheck size={22} />
            <span>Vérifier vos informations avant l’envoi définitif</span>
          </div>

        </div>

        {/* ACTION */}
        <button className="btn-primary" onClick={continueFlow}>
          Commencer ma demande
        </button>

      </div>
    </div>
  );
}
