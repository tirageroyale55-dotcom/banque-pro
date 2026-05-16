import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";

export default function ClientLayout() {
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Vérification des pages où le menu doit être CACHÉ
  const isProfilePage = location.pathname === "/profile";
  const isCardDetailsPage = location.pathname === "/card-details"; 
  const isCardOrderConfirmation = location.pathname ===  "/order-confirmation"

  return (
    <div className="bank-layout">
      <div className={isDesktop ? "desktop-wrapper" : "mobile-wrapper"}>
        <Outlet />
      </div>

      {/* Le menu s'affiche seulement si :
          1. On est sur mobile (!isDesktop)
          2. ET qu'on n'est PAS sur le profil (!isProfilePage)
          3. ET qu'on n'est PAS sur les détails de carte (!isCardDetailsPage)
      */}
      {!isDesktop && !isProfilePage && !isCardDetailsPage && !isCardOrderConfirmation && <BottomNav />}
    </div>
  );
}