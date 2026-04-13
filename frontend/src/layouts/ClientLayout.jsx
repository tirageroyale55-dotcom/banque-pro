import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";

export default function ClientLayout() {
  // Détecter si on est sur ordinateur (Desktop) ou mobile
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bank-layout">
      {/* Désormais, la structure Desktop est gérée DIRECTEMENT 
          à l'intérieur de tes pages (comme Dashboard.jsx).
          On ne met plus rien ici pour éviter les doublons.
      */}
      
      <div className={isDesktop ? "desktop-wrapper" : "mobile-wrapper"}>
        {/* L'Outlet affiche tes pages (Dashboard, etc.) */}
        <Outlet />
      </div>

      {/* Sur Mobile : On garde le menu du bas */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}