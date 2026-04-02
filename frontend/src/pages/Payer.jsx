import React from "react";
import { ArrowRightLeft, Globe, Smartphone, CreditCard, CalendarClock, HeartHandshake, ChevronRight } from "lucide-react";
import "../styles/payer.css";

export default function Payer() {
  // Le composant pour une ligne de menu (identique à ton dessin)
  const MenuRow = ({ icon: Icon, title }) => (
    <div className="menu-row">
      <div className="menu-left">
        <div className="icon-wrapper"><Icon size={20} /></div>
        <span>{title}</span>
      </div>
      <ChevronRight size={18} className="chevron" />
    </div>
  );

  return (
    <div className="virement-menu-container">
      <h2 className="page-title-bper">Opérations</h2>

      {/* SECTION 1 */}
      <h3 className="section-label-bper">Opérations fréquentes</h3>
      <div className="menu-group-bper">
        <MenuRow icon={ArrowRightLeft} title="Virement vers un numéro de compte" />
      </div>

      {/* SECTION 2 */}
      <h3 className="section-label-bper">Toutes les opérations</h3>
      <div className="menu-group-bper">
        <MenuRow icon={ArrowRightLeft} title="Virement vers un numéro de compte" />
        <MenuRow icon={Globe} title="Virement international" />
      </div>

      {/* SECTION 3 */}
      <h3 className="section-label-bper">Recharges</h3>
      <div className="menu-group-bper">
        <MenuRow icon={Smartphone} title="Recharge de téléphone portable" />
        <MenuRow icon={CreditCard} title="Recharge de carte prépayée" />
      </div>

      {/* SECTION 4 */}
      <h3 className="section-label-bper">Autres opérations</h3>
      <div className="menu-group-bper">
        <MenuRow icon={CalendarClock} title="Opérations programmées" />
        <MenuRow icon={HeartHandshake} title="Don pour financement" />
      </div>
    </div>
  );
}