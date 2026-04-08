import { useState } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, User, Globe, MapPin, Phone, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile({ data = {} }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Correction ici : on utilise les noms de ton modèle User.js (nom, prenom)
  const displayName = `${data.prenom || ""} ${data.nom || ""}`.trim();
  const initials = `${data.prenom?.charAt(0) || ""}${data.nom?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="bper-profile-container">
      
      <div className="bper-header">
        <button onClick={() => showDetails ? setShowDetails(false) : navigate(-1)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>
          ←
        </button>
        <span style={{ flex: 1, textAlign: "center", fontWeight: "600" }}>
          {showDetails ? "Données Personnelles" : "Mon Profil"}
        </span>
      </div>

      {!showDetails ? (
        <>
          {/* VUE PRINCIPALE (Ton dessin) */}
          <div className="bper-card-blue" onClick={() => setShowDetails(true)}>
            <div className="bper-avatar-circle">
              {initials || "U"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>Mon profil</div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>({displayName || "Utilisateur"})</div>
              <div style={{ color: "#1e3a8a", fontWeight: "800", fontSize: "12px", marginTop: "4px" }}>BPER BANCA</div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>

          <div className="bper-menu-section">
            <MenuRow icon={<Settings size={20}/>} title="Paramètres et confidentialité" />
            <MenuRow icon={<Shield size={20}/>} title="Sécurité" />
            <MenuRow icon={<MessageCircle size={20}/>} title="Parlez-nous" />

            <div style={{ height: "10px", background: "#f4f7f9" }} />

            <MenuRow icon={<TrendingUp size={20}/>} title="Opérations d'investissement" />
            <MenuRow icon={<CreditCard size={20}/>} title="Financement" />
            <MenuRow icon={<Umbrella size={20}/>} title="Assurance et prévoyance" />
            <div onClick={() => setShowDetails(true)}>
                <MenuRow icon={<Edit size={20}/>} title="Modifier le compte" />
            </div>

            <div style={{ height: "10px", background: "#f4f7f9" }} />

            <div onClick={handleLogout}>
              <MenuRow icon={<LogOut size={20} color="#dc2626"/>} title="Déconnecter" color="#dc2626" />
            </div>
          </div>
        </>
      ) : (
        /* VUE DÉTAILLÉE (Ouverture des infos User) */
        <div style={{ background: "white", minHeight: "90vh", padding: "20px" }}>
            <div style={{ marginBottom: "25px", borderBottom: "2px solid #1e3a8a", paddingBottom: "10px" }}>
                <h3 style={{ margin: 0, color: "#1e3a8a" }}>Informations Certifiées</h3>
                <p style={{ fontSize: "12px", color: "#64748b" }}>Données vérifiées par BPER Banca</p>
            </div>

            <InfoBlock label="Nom complet" value={displayName} icon={<User size={16}/>} />
            <InfoBlock label="Email" value={data.email} icon={<Mail size={16}/>} />
            <InfoBlock label="Téléphone" value={data.telephone} icon={<Phone size={16}/>} />
            <InfoBlock label="Adresse" value={`${data.adresse}, ${data.codePostal} ${data.ville}`} icon={<MapPin size={16}/>} />
            <InfoBlock label="Nationalité" value={data.nationalite} icon={<Globe size={16}/>} />
            
            <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#64748b", border: "1px dashed #cbd5e1" }}>
                Pour modifier vos données certifiées (adresse, revenus), veuillez contacter votre conseiller en agence ou envoyer un document signé via la section "Parlez-nous".
            </div>
        </div>
      )}
    </div>
  );
}

// Composants internes pour le style
function MenuRow({ icon, title, color = "#1e293b" }) {
  return (
    <div className="bper-row">
      <div style={{ color: color, marginRight: "15px", display: "flex" }}>{icon}</div>
      <div style={{ flex: 1, fontSize: "15px", color: color }}>{title}</div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}

function InfoBlock({ label, value, icon }) {
  return (
    <div style={{ marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ marginTop: "12px", color: "#1e3a8a" }}>{icon}</div>
        <div style={{ flex: 1, borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <div className="bper-label-small">{label}</div>
            <div className="bper-value-main">{value || "Non renseigné"}</div>
        </div>
    </div>
  );
}