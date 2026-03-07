import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ClientLayout() {

const location = useLocation();

const hideNavbar = location.pathname === "/dashboard";

return (

<div className="bank-layout">

{!hideNavbar && <Navbar />}

<div className="page-content">
<Outlet />
</div>

</div>

);

}