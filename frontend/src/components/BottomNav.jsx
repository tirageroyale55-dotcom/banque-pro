import {
  Home,
  ArrowRightLeft,
  Grid,
  Gem,
  Headphones
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function BottomNav() {

  const navigate = useNavigate();

  return (

    <div className="bottom-nav">

      <div
        className="nav-item active"
        onClick={() => navigate("/dashboard")}
      >
        <Home size={24}/>
        <span>Accueil</span>
      </div>

      <div className="nav-item">
        <ArrowRightLeft size={24}/>
        <span>Payer</span>
      </div>

      <div className="nav-item">
        <Grid size={24}/>
        <span>Produits</span>
      </div>

      <div className="nav-item">
        <Gem size={24}/>
        <span>Lifestyle</span>
      </div>

      <div
        className="nav-item"
        onClick={() => navigate("/help")}
      >
        <Headphones size={24}/>
        <span>Aide</span>
      </div>

    </div>

  );

}