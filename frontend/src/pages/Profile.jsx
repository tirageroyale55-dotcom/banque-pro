import { useState } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, User, Globe, MapPin, Phone, Mail, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile({ data }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [photo, setPhoto] = useState(null);

  // --- LOGIQUE DE DÉTECTION DES NOMS (Adaptée à ton modèle User.js) ---
  // On cherche 'nom' ou 'lastname' ou 'user.nom'
  const userInfo = data?.user || data || {}; 
  const nomUser = userInfo.nom || userInfo.lastname || "";
  const prenomUser = userInfo.prenom || userInfo.firstname || "";
  
  const displayName = `${prenomUser} ${nomUser}`.trim() || "Client BPER";
  const initials = `${prenomUser.charAt(0)}${nomUser.charAt(0)}`.toUpperCase() || "BC";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!data) return <div className="loading">Chargement du profil...</div>;

  return (
    <div className="bper-profile-container">
      
      {/* HEADER DYNAMIQUE */}
      <div className="bper-header">
        <button 
          onClick={() => showDetails ? setShowDetails(false) : navigate(-1)} 
          style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
        >
          ←
        </button>
        <span style={{ flex: 1, textAlign: "center", fontWeight: "600" }}>
          {showDetails ? "Informations Personnelles" : "Mon Profil"}
        </span>
      </div>

      {!showDetails ? (
        <>
          {/* SECTION MON PROFIL (Rectangle de ton dessin) */}
          <div className="bper-card-blue" onClick={() => setShowDetails(true)}>
            <div className="bper-avatar-circle">
               {photo ? <img src={photo} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : initials}
               <label className="camera-badge">
                  <Camera size={10} />
                  <input type="file" hidden onChange={(e) => setPhoto(URL.createObjectURL(e.target.files[0]))} />
               </label>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>Mon profil</div>
              <div style={{ color: "#64748b", fontSize: "14px" }}>({displayName})</div>
              <div style={{ color: "#1e3a8a", fontWeight: "800", fontSize: "12px", marginTop: "4px" }}>BPER BANCA</div>
            </div>
            <ChevronRight size={20} color="#cbd5e1" />
          </div>

          <div className="bper-menu-section">
            <MenuRow icon={<Settings size={20}/>} title="Paramètres et confidentialité" />
            <MenuRow icon={<Shield size={20}/>} title="Sécurité" />
            <MenuRow icon={<MessageCircle size={20}/>} title="Parlez-nous" />

            <div className="bper-separator" style={{height:'8px', background:'#f4f7f9'}} />

            <MenuRow icon={<TrendingUp size={20}/>} title="Opérations d'investissement" />
            <MenuRow icon={<CreditCard size={20}/>} title="Financement" />
            <MenuRow icon={<Umbrella size={20}/>} title="Assurance et prévoyance" />
            <div onClick={() => setShowDetails(true)}>
                <MenuRow icon={<Edit size={20}/>} title="Détails du compte" />
            </div>

            <div className="bper-separator" style={{height:'8px', background:'#f4f7f9'}} />

            <div onClick={handleLogout}>
              <MenuRow icon={<LogOut size={20} color="#dc2626"/>} title="Déconnecter" color="#dc2626" />
            </div>
          </div>
        </>
      ) : (
        /* VUE DÉTAILLÉE (Ouverture pro des infos) */
        <div className="bper-details-view" style={{ background: "white", padding: "20px", minHeight: '100vh' }}>
            <div style={{ marginBottom: "25px", borderLeft: "4px solid #1e3a8a", paddingLeft: "15px" }}>
                <h3 style={{ margin: 0, color: "#1e3a8a", fontSize: '18px' }}>État Civil & Contact</h3>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>Données certifiées conformes à votre pièce d'identité</p>
            </div>

            <InfoRow label="NOM" value={nomUser} icon={<User size={16}/>} />
            <InfoRow label="PRÉNOM" value={prenomUser} icon={<User size={16}/>} />
            <InfoRow label="E-MAIL" value={userInfo.email} icon={<Mail size={16}/>} />
            <InfoRow label="TÉLÉPHONE" value={userInfo.telephone} icon={<Phone size={16}/>} />
            <InfoRow label="RÉSIDENCE" value={`${userInfo.adresse || ""}, ${userInfo.ville || ""}`} icon={<MapPin size={16}/>} />
            <InfoRow label="NATIONALITÉ" value={userInfo.nationalite} icon={<Globe size={16}/>} />

            <div style={{ marginTop: "40px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#cbd5e1" }}>Référence Client : {data._id?.slice(-8).toUpperCase() || "N/A"}</p>
            </div>
        </div>
      )}
    </div>
  );
}

// COMPOSANTS INTERNES
function MenuRow({ icon, title, color = "#1e293b" }) {
  return (
    <div className="bper-row" style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ color: color, marginRight: "15px" }}>{icon}</div>
      <div style={{ flex: 1, fontSize: "15px", color: color }}>{title}</div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "15px" }}>
        <div style={{ color: "#1e3a8a", opacity: 0.7 }}>{icon}</div>
        <div style={{ flex: 1, borderBottom: "1px solid #f1f5f9", paddingBottom: "5px" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 'bold' }}>{label}</div>
            <div style={{ fontSize: "15px", color: "#334155" }}>{value || "Non renseigné"}</div>
        </div>
    </div>
  );
}