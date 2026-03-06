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

const isActive = (path) => location.pathname === path;

return (

<div className="bottom-nav">

<button
className={isActive("/dashboard") ? "nav-item active" : "nav-item"}
onClick={() => navigate("/dashboard")}
>
<Home size={22}/>
<span>Home</span>
</button>

<button
className={isActive("/pay") ? "nav-item active" : "nav-item"}
onClick={() => navigate("/pay")}
>
<ArrowRightLeft size={22}/>
<span>Paga</span>
</button>

<button
className={isActive("/products") ? "nav-item active" : "nav-item"}
onClick={() => navigate("/products")}
>
<Grid size={22}/>
<span>Prodotti</span>
</button>

<button
className={isActive("/lifestyle") ? "nav-item active" : "nav-item"}
onClick={() => navigate("/lifestyle")}
>
<Gem size={22}/>
<span>Lifestyle</span>
</button>

<button
className={isActive("/help") ? "nav-item active" : "nav-item"}
onClick={() => navigate("/help")}
>
<Headphones size={22}/>
<span>Aiuto</span>
</button>

</div>

);

}