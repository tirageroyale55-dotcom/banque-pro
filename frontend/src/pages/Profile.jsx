import { useState } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, Camera 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css"; 

export default function Profile({ data = {} }) { // data={} évite le crash si undefined
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bper-profile-container">
      
      {/* HEADER */}
      <div style={{ padding: "15px 20px", display: "flex", alignItems: "center", background: "#fff", borderBottom: "1px solid #eee" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>
          ←
        </button>
        <span style={{ flex: 1, textAlign: "center", fontWeight: "600" }}>Mon Profil</span>
      </div>

      {/* CARD PROFIL (Le rectangle bleu de ton dessin) */}
      <div className="bper-profile-card">
        <div className="bper-profile-avatar">
          {photo ? <img src={photo} alt="avatar" style={{width:'100%', height:'100%', borderRadius:'50%'}}/> : (data.firstname?.charAt(0) || "U")}
          <label style={{ position: "absolute", bottom: 0, right: 0, background: "#fff", borderRadius: "50%", padding: "4px", border: "1px solid #ddd" }}>
            <Camera size={12} color="#000" />
            <input type="file" onChange={(e) => setPhoto(URL.createObjectURL(e.target.files[0]))} style={{ display: "none" }} />
          </label>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>Mon profil</div>
          <div style={{ color: "#64748b", fontSize: "14px" }}>
            {data.firstname ? `(${data.firstname} ${data.lastname})` : "(Utilisateur)"}
          </div>
          <div style={{ color: "#2563eb", fontWeight: "bold", fontSize: "13px", marginTop: "4px" }}>BPER BANCA</div>
        </div>
        <ChevronRight size={20} color="#cbd5e1" />
      </div>

      {/* LISTE DES OPTIONS */}
      <div className="bper-profile-menu-group">
        <MenuRow icon={<Settings size={20}/>} title="Paramètres et confidentialité" />
        <MenuRow icon={<Shield size={20}/>} title="Sécurité" />
        <MenuRow icon={<MessageCircle size={20}/>} title="Parlez-nous" />

        <div className="bper-profile-separator" />

        <MenuRow icon={<TrendingUp size={20}/>} title="Opérations d'investissement" />
        <MenuRow icon={<CreditCard size={20}/>} title="Financement" />
        <MenuRow icon={<Umbrella size={20}/>} title="Assurance et prévoyance" />
        <MenuRow icon={<Edit size={20}/>} title="Modifier le compte" />

        <div className="bper-profile-separator" />

        <div onClick={handleLogout}>
          <MenuRow icon={<LogOut size={20} color="#dc2626"/>} title="Déconnecter" color="#dc2626" />
        </div>
      </div>
    </div>
  );
}

function MenuRow({ icon, title, color = "#1e293b" }) {
  return (
    <div className="bper-profile-row">
      <div style={{ color: color, marginRight: "15px", display: "flex" }}>{icon}</div>
      <div style={{ flex: 1, fontSize: "15px", color: color }}>{title}</div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}