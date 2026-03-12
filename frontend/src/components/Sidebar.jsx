import {
Home,
ArrowRightLeft,
Grid,
Gem,
Headphones,
CreditCard,
Wallet,
User
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar(){

const navigate = useNavigate();
const location = useLocation();

return(

<div className="sidebar">

<div className="sidebar-profile">

<div className="avatar large">
<User size={22}/>
</div>

<div className="profile-text">
<strong>John Doe</strong>
<span>Profil</span>
</div>

</div>

<div className="sidebar-menu">

<button
className={location.pathname === "/dashboard" ? "side-item active" : "side-item"}
onClick={()=>navigate("/dashboard")}
>
<Home size={18}/>
<span>Accueil</span>
</button>

<button
className={location.pathname === "/accounts" ? "side-item active" : "side-item"}
onClick={()=>navigate("/accounts")}
>
<Wallet size={18}/>
<span>Comptes</span>
</button>

<button
className={location.pathname === "/cards" ? "side-item active" : "side-item"}
onClick={()=>navigate("/cards")}
>
<CreditCard size={18}/>
<span>Cartes</span>
</button>

<button
className={location.pathname === "/payer" ? "side-item active" : "side-item"}
onClick={()=>navigate("/payer")}
>
<ArrowRightLeft size={18}/>
<span>Payer</span>
</button>

<button
className={location.pathname === "/produits" ? "side-item active" : "side-item"}
onClick={()=>navigate("/produits")}
>
<Grid size={18}/>
<span>Produits</span>
</button>

<button
className={location.pathname === "/lifestyle" ? "side-item active" : "side-item"}
onClick={()=>navigate("/lifestyle")}
>
<Gem size={18}/>
<span>Lifestyle</span>
</button>

<button
className={location.pathname === "/aide" ? "side-item active" : "side-item"}
onClick={()=>navigate("/aide")}
>
<Headphones size={18}/>
<span>Aide</span>
</button>

</div>

</div>

);

}