import { useState } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, Camera 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile({ data }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const upload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER DE LA PAGE */}
      <div style={{ padding: "20px", display: "flex", alignItems: "center", background: "#fff", borderBottom: "1px solid #eee" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>←</button>
        <h2 style={{ flex: 1, textAlign: "center", fontSize: "18px", margin: 0 }}>Mon Profil</h2>
      </div>

      {/* SECTION BANNIÈRE PROFIL (Le rectangle du haut sur ton dessin) */}
      <div style={{ margin: "20px", padding: "20px", backgroundColor: "#fff", borderRadius: "15px", border: "1px solid #2563eb", display: "flex", alignItems: "center", gap: "15px" }}>
        <div style={{ position: "relative" }}>
          <img
            src={photo || "https://via.placeholder.com/60"}
            alt="profil"
            style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", backgroundColor: "#eee" }}
          />
          <label style={{ position: "absolute", bottom: -5, right: -5, background: "#2563eb", borderRadius: "50%", padding: "4px", cursor: "pointer", display: "flex" }}>
            <Camera size={12} color="#fff" />
            <input type="file" onChange={upload} style={{ display: "none" }} />
          </label>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", fontSize: "16px", textTransform: "capitalize" }}>
            {data.firstname} {data.lastname}
          </div>
          <div style={{ color: "#2563eb", fontWeight: "bold", fontSize: "14px", marginTop: "2px" }}>BPER BANCA</div>
        </div>
        <ChevronRight size={20} color="#cbd5e1" />
      </div>

      {/* LISTE DES OPTIONS (Comme sur ton dessin) */}
      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #eee" }}>
        
        {/* GROUPE 1 */}
        <MenuRow icon={<Settings size={20}/>} title="Paramètres et confidentialité" />
        <MenuRow icon={<Shield size={20}/>} title="Sécurité" />
        <MenuRow icon={<MessageCircle size={20}/>} title="Parlez-nous" />

        <div style={{ height: "1px", backgroundColor: "#eee", margin: "10px 20px" }} />

        {/* GROUPE 2 */}
        <MenuRow icon={<TrendingUp size={20}/>} title="Opérations d'investissement" />
        <MenuRow icon={<CreditCard size={20}/>} title="Financement" />
        <MenuRow icon={<Umbrella size={20}/>} title="Assurance et prévoyance" />
        <MenuRow icon={<Edit size={20}/>} title="Modifier le compte" />

        <div style={{ height: "1px", backgroundColor: "#eee", margin: "10px 20px" }} />

        {/* DÉCONNEXION */}
        <div onClick={handleLogout}>
          <MenuRow icon={<LogOut size={20} color="#dc2626"/>} title="Déconnecter" color="#dc2626" hideArrow />
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour les lignes du menu (pour ne pas répéter le code)
function MenuRow({ icon, title, color = "#1e293b", hideArrow = false }) {
  return (
    <div style={{ 
      display: "flex", alignItems: "center", padding: "15px 20px", 
      cursor: "pointer", transition: "background 0.2s" 
    }}>
      <div style={{ color: color, marginRight: "15px" }}>{icon}</div>
      <div style={{ flex: 1, fontSize: "15px", color: color }}>{title}</div>
      {!hideArrow && <ChevronRight size={18} color="#cbd5e1" />}
    </div>
  );
}