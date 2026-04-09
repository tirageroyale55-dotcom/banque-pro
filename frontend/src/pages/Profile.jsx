import { useState, useEffect } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, User, Globe, MapPin, Phone, Mail, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api"; 
import "../styles/Profile.css";

export default function Profile({ data: initialData }) {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [showDetails, setShowDetails] = useState(false);
  const [photo, setPhoto] = useState(null);

  // SÉCURITÉ : Si data est vide au chargement, on va le chercher sur l'API
  useEffect(() => {
    if (!data) {
      api("/client/dashboard")
        .then(res => setData(res))
        .catch(() => navigate("/login"));
    }
  }, [data, navigate]);

  // Si toujours pas de data après l'appel API, on affiche un loader propre
  if (!data) {
    return (
      <div className="bper-profile-loader">
        <div className="spinner"></div>
        <p>Chargement sécurisé...</p>
      </div>
    );
  }

  // --- LOGIQUE D'EXTRACTION (Modèle User.js) ---
  // On cherche 'nom' et 'prenom' car ce sont les noms dans ton schéma Mongoose
  const userInfo = data.user || data; 
  const nomUser = userInfo.nom || "";
  const prenomUser = userInfo.prenom || "";
  
  const displayName = `${prenomUser} ${nomUser}`.trim() || "Client BPER";
  const initials = `${prenomUser.charAt(0)}${nomUser.charAt(0)}`.toUpperCase() || "BC";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bper-profile-container">
      
      {/* HEADER FIXE */}
      <div className="bper-header">
        <button 
          onClick={() => showDetails ? setShowDetails(false) : navigate(-1)} 
          className="back-btn"
        >
          ←
        </button>
        <span className="header-title">
          {showDetails ? "Données Personnelles" : "Mon Profil"}
        </span>
      </div>

      {!showDetails ? (
        <div className="fade-in">
          {/* BANNIÈRE PROFIL (Rectangle de ton dessin) */}
          <div className="bper-card-blue" onClick={() => setShowDetails(true)}>
            <div className="bper-avatar-circle">
               {photo ? <img src={photo} alt="avatar" className="avatar-img"/> : initials}
               <label 
  className="camera-badge"
  onClick={(e) => e.stopPropagation()} // 👈 AJOUTE CETTE LIGNE ICI
>
  <Camera size={10} />
  <input 
    type="file" 
    hidden 
    onChange={(e) => setPhoto(URL.createObjectURL(e.target.files[0]))} 
  />
</label>
            </div>
            <div className="profile-info-text">
              <div className="profile-label">Mon profil</div>
              <div className="profile-name">{displayName}</div>
              <div className="profile-bank-tag">BPER BANCA</div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>

          {/* LISTE DES MENUS */}
          <div className="bper-menu-section">
            <MenuRow icon={<Settings size={20}/>} title="Paramètres et confidentialité" />
            <MenuRow icon={<Shield size={20}/>} title="Sécurité" />
            <MenuRow icon={<MessageCircle size={20}/>} title="Parlez-nous" />

            <div className="section-divider" />

            <MenuRow icon={<TrendingUp size={20}/>} title="Opérations d'investissement" />
            <MenuRow icon={<CreditCard size={20}/>} title="Financement" />
            <MenuRow icon={<Umbrella size={20}/>} title="Assurance et prévoyance" />
            <div onClick={() => setShowDetails(true)}>
                <MenuRow icon={<Edit size={20}/>} title="Détails du compte" />
            </div>

            <div className="section-divider" />

            <div onClick={handleLogout}>
              <MenuRow icon={<LogOut size={20} color="#dc2626"/>} title="Déconnecter" color="#dc2626" />
            </div>
          </div>
        </div>
      ) : (
        /* VUE DÉTAILLÉE (Informations User) */
        <div className="bper-details-view fade-in">
            <div className="details-header-block">
                <h3>État Civil & Contact</h3>
                <p>Données certifiées conformes à votre pièce d'identité</p>
            </div>

            <InfoRow label="NOM" value={nomUser} icon={<User size={16}/>} />
            <InfoRow label="PRÉNOM" value={prenomUser} icon={<User size={16}/>} />
            <InfoRow label="E-MAIL" value={userInfo.email} icon={<Mail size={16}/>} />
            <InfoRow label="TÉLÉPHONE" value={userInfo.telephone} icon={<Phone size={16}/>} />
            <InfoRow label="ADRESSE" value={userInfo.adresse} icon={<MapPin size={16}/>} />
            <InfoRow label="VILLE" value={userInfo.ville} icon={<MapPin size={16}/>} />
            <InfoRow label="NATIONALITÉ" value={userInfo.nationalite} icon={<Globe size={16}/>} />

            <div className="client-footer">
                <p>Référence Client : {data._id?.slice(-8).toUpperCase() || "BPER-PRO-001"}</p>
                <p>Compte actif - Certifié par BPER Banca</p>
            </div>
        </div>
      )}
    </div>
  );
}

// COMPOSANTS INTERNES POUR LA LISIBILITÉ
function MenuRow({ icon, title, color = "#1e293b" }) {
  return (
    <div className="bper-row">
      <div className="row-icon" style={{ color: color }}>{icon}</div>
      <div className="row-title" style={{ color: color }}>{title}</div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="info-row">
        <div className="info-icon">{icon}</div>
        <div className="info-content">
            <div className="info-label">{label}</div>
            <div className="info-value">{value || "Non renseigné"}</div>
        </div>
    </div>
  );
}