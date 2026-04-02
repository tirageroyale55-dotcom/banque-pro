import React, { useState } from "react";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar"; // Import Sidebar
import "../styles/payer.css";

export default function Payer() {
  const [form, setForm] = useState({ id: "", amount: "", msg: "" });
  
  // Simulation pour savoir si on est sur desktop
  const isDesktop = window.innerWidth >= 1000;

  return (
    <div className={`bank-layout ${isDesktop ? 'desktop' : 'mobile'}`}>
      
      {/* 1. SIDEBAR (Uniquement sur PC) */}
      {isDesktop && <Sidebar />}

      <div className="main-container">
        {/* 2. L'EN-TÊTE FIXE (Le bloc vert) */}
        <header className="fixed-header">
          <div className="header-content">
            <h1 className="main-title">BPER</h1>
            <p className="subtitle">Payer & Transférer</p>
          </div>
        </header>

        {/* 3. LE CONTENU QUI SCROLLE (La carte blanche) */}
        <main className="scrolling-content">
          <div className="account-card payer-card">
            <h2 className="cards-title">Nouveau Virement</h2>
            
            <form className="virement-form">
              {/* Tes champs de formulaire ici (identiques) */}
              <div className="form-group">
                <label>Identifiant destinataire (IBAN ou N°)</label>
                <input className="bank-input" placeholder="Ex: IT37Q..." />
              </div>
              
              <div className="form-group">
                <label>Montant (€)</label>
                <input type="number" className="bank-input" placeholder="0.00" />
              </div>

              <button className="btn-solid">Confirmer</button>
            </form>
          </div>
          
          {/* Bloc d'espace en bas pour le BottomNav sur mobile */}
          <div className="bottom-spacer"></div>
        </main>
      </div>

      {/* 4. BOTTOMNAV (Uniquement sur Mobile) */}
      {!isDesktop && <BottomNav />}
    </div>
  );
}