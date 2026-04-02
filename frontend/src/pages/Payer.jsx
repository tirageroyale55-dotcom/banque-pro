import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRightLeft, 
  Globe, 
  Smartphone, 
  CreditCard, 
  CalendarClock, 
  HeartHandshake, 
  ChevronRight 
} from "lucide-react";
import "../styles/payer.css";

export default function Payer() {
  const navigate = useNavigate();

  // Fonction pour simplifier le rendu des lignes de menu
  const MenuRow = ({ icon: Icon, title, onClick }) => (
    <div className="menu-row" onClick={onClick}>
      <div className="menu-left">
        <div className="icon-wrapper"><Icon size={20} /></div>
        <span>{title}</span>
      </div>
      <ChevronRight size={18} className="chevron" />
    </div>
  );

  return (
    <div className="page-content payer-page">
      <h2 className="page-title">Opérations</h2>

      {/* SECTION 1: OPÉRATIONS FRÉQUENTES */}
      <section className="ops-section">
        <h3 className="section-label">Opérations fréquentes</h3>
        <div className="menu-group">
          <MenuRow 
            icon={ArrowRightLeft} 
            title="Virement vers un numéro de compte" 
            onClick={() => navigate("/payer/virement")}
          />
        </div>
      </section>

      {/* SECTION 2: TOUTES LES OPÉRATIONS */}
      <section className="ops-section">
        <h3 className="section-label">Toutes les opérations</h3>
        <div className="menu-group">
          <MenuRow icon={ArrowRightLeft} title="Virement vers un numéro de compte" />
          <MenuRow icon={Globe} title="Virement international" />
        </div>
      </section>

      {/* SECTION 3: RECHARGES */}
      <section className="ops-section">
        <h3 className="section-label">Recharges</h3>
        <div className="menu-group">
          <MenuRow icon={Smartphone} title="Recharge de téléphone portable" />
          <MenuRow icon={CreditCard} title="Recharge de carte prépayée" />
        </div>
      </section>

      {/* SECTION 4: AUTRES OPÉRATIONS */}
      <section className="ops-section">
        <h3 className="section-label">Autres opérations</h3>
        <div className="menu-group">
          <MenuRow icon={CalendarClock} title="Opérations programmées" />
          <MenuRow icon={HeartHandshake} title="Don pour financement" />
        </div>
      </section>
    </div>
  );
}