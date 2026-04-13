import { 
  Home, ArrowRightLeft, Grid, Gem, Headphones, 
  CreditCard, Wallet, User 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ data }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extraction des données dynamiques
  const userInfo = data?.user || data;
  const nomUser = userInfo?.nom || "";
  const prenomUser = userInfo?.prenom || "";
  const displayName = `${prenomUser} ${nomUser}`.trim() || "Chargement...";
  const profileImage = userInfo?.profilePicture;

  return (
    <div className="sidebar">
      {/* SECTION PROFIL CLIQUABLE */}
      <div 
        className={`sidebar-profile ${location.pathname === "/profile" ? "active" : ""}`}
        onClick={() => navigate("/profile")}
        style={{ cursor: 'pointer' }}
      >
        <div className="avatar large">
          {profileImage ? (
            <img src={profileImage} alt="Profil" className="sidebar-img" />
          ) : (
            <User size={24} />
          )}
        </div>
        <div className="profile-text">
          <strong>{displayName}</strong>
          <span>Voir mon profil</span>
        </div>
      </div>

      
    </div>
  );
}

// Sous-composant pour éviter la répétition de code
function MenuButton({ active, onClick, icon, label }) {
  return (
    <button className={`side-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}