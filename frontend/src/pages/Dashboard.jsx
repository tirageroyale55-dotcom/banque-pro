import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Tabs from './Tabs';
import BottomNav from './BottomNav';
import './dashboard.css';

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

  // Détecte le changement de taille d'écran
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. VERSION ORDINATEUR (Exactement comme votre dessin)
  if (!isMobile) {
    return (
      <div className="bank-app desktop-mode">
        {/* SIDEBAR À GAUCHE */}
        <Sidebar /> 

        {/* CONTENU À DROITE */}
        <div className="desktop-content">
          <Header />
          <Tabs />
          <div className="page-content">
             {/* Vos cartes de solde et historique ici */}
          </div>
        </div>
      </div>
    );
  }

  // 2. VERSION MOBILE (Ancienne version)
  return (
    <div className="bank-app mobile-mode">
      <Header />
      <Tabs />
      <div className="page-content">
         {/* Contenu mobile */}
      </div>
      <BottomNav /> {/* S'affiche UNIQUEMENT sur mobile maintenant */}
    </div>
  );
};

export default Dashboard;