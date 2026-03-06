import {
Home,
ArrowRightLeft,
Grid,
Gem,
Headphones
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {

const navigate = useNavigate();
const location = useLocation();

return (

<div className="bottom-nav">

<button
className={location.pathname === "/dashboard" ? "nav-item active" : "nav-item"}
onClick={() => navigate("/dashboard")}
>
<Home size={24}/>
<span>Accueil</span>
</button>

<button
className={location.pathname === "/payer" ? "nav-item active" : "nav-item"}
onClick={() => navigate("/payer")}
>
<ArrowRightLeft size={24}/>
<span>Payer</span>
</button>

<button
className={location.pathname === "/produits" ? "nav-item active" : "nav-item"}
onClick={() => navigate("/produits")}
>
<Grid size={24}/>
<span>Produits</span>
</button>

<button
className={location.pathname === "/lifestyle" ? "nav-item active" : "nav-item"}
onClick={() => navigate("/lifestyle")}
>
<Gem size={24}/>
<span>Lifestyle</span>
</button>

<button
className={location.pathname === "/aide" ? "nav-item active" : "nav-item"}
onClick={() => navigate("/aide")}
>
<Headphones size={24}/>
<span>Aide</span>
</button>

</div>

);

}