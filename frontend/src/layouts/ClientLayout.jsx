import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";

export default function ClientLayout() {
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  // Nouvel état pour cacher dynamiquement le menu depuis les sous-vues
  const [forceHideNav, setForceHideNav] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Réinitialise le masquage forcé si l'utilisateur change de page complète URL
  useEffect(() => {
    setForceHideNav(false);
  }, [location.pathname]);

  const isProfilePage = location.pathname === "/profile";
  const isCardDetailsPage = location.pathname === "/card-details"; 
  const isCardOrderConfirmation = location.pathname === "/order-confirmation";

  return (
    <div className="bank-layout">
      <div className={isDesktop ? "desktop-wrapper" : "mobile-wrapper"}>
        {/* On passe la fonction setForceHideNav via le context de l'Outlet */}
        <Outlet context={{ setForceHideNav }} />
      </div>

      {/* Le menu s'affiche selon tes règles + la règle dynamique de la sous-vue */}
      {!isDesktop && 
       !isProfilePage && 
       !isCardDetailsPage && 
       !isCardOrderConfirmation && 
       !forceHideNav && <BottomNav />}
    </div>
  );
}