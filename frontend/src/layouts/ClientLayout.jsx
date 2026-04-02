import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";
// Importe ton composant Header s'il est séparé
import Header from "../components/Header"; 
import "../styles/layout.css"; // Nouveau fichier CSS pour le layout

export default function ClientLayout() {
  return (
    <div className="main-app-container">
      {/* 1. EN-TÊTE FIXE EN HAUT */}
      <header className="app-header-fixed">
        <Header /> {/* Ton Header vert avec le logo, etc. */}
      </header>

      {/* 2. ZONE DE CONTENU QUI DÉFILE */}
      <main className="app-content-scrollable">
        <Outlet />
      </main>

      {/* 3. MENU DU BAS FIXE EN BAS */}
      <footer className="app-nav-fixed">
        <BottomNav />
      </footer>
    </div>
  );
}