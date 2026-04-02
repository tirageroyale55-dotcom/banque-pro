import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";

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
      {/* 1. Sur PC : On affiche la Sidebar à gauche */}
      {isDesktop && <Sidebar />}
      
      {/* 1. L'écart en haut (Header de sécurité) */}
      <div className="top-spacer" style={{ height: '20px', flexShrink: 0 }}></div>
      
      <div className={isDesktop ? "desktop-content" : "mobile-content"}>
        {/* 2. L'Outlet : C'est ici que tes pages (Dashboard, Payer...) s'affichent */}
        <Outlet />
      </div>

      {/* 3. Sur Mobile : On affiche TOUJOURS le menu du bas */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}