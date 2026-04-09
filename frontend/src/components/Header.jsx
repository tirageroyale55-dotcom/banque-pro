import { Bell, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Header({ data }) {

const navigate = useNavigate();

const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

useEffect(() => {

const handleResize = () => {
setIsDesktop(window.innerWidth >= 1000);
};

window.addEventListener("resize", handleResize);

return () => window.removeEventListener("resize", handleResize);

}, []);

return (

<div className="header">

{/* Avatar seulement sur mobile */}

{!isDesktop && (

<div
className="profile"
onClick={() => navigate("/profile")}
>

<div className="avatar">
{data.firstname?.charAt(0)}
{data.lastname?.charAt(0)}
</div>

</div>

)}

<div className="header-icons">

<Bell
size={22}
onClick={() => navigate("/notifications")}
/>

<HelpCircle
size={22}
onClick={() => navigate("/help")}
/>

</div>

</div>

);

}