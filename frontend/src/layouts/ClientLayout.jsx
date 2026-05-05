import { Outlet, useLocation } from "react-router-dom"; // On ajoute useLocation
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";

export default function ClientLayout() {
  const location = useLocation(); // On récupère l'URL actuelle
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // On vérifie si la route actuelle est le profil
  const isProfilePage = location.pathname === "/profile";

  return (
    <div className="bank-layout">
      <div className={isDesktop ? "desktop-wrapper" : "mobile-wrapper"}>
        <Outlet />
      </div>

      {/* 
          MODIFICATION ICI : 
          Le menu s'affiche seulement si :
          1. On est sur mobile (!isDesktop)
          2. ET qu'on n'est PAS sur la page profil (!isProfilePage)
      */}
      {!isDesktop && !isProfilePage && <BottomNav />}
    </div>
  );
}