import { useState } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, Camera 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile({ data }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);

  // 1. SÉCURITÉ : Si data n'est pas encore chargé, on affiche un chargement
  // pour éviter que la page devienne blanche (le fameux crash "undefined")
  if (!data) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Chargement...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Force le reload pour vider le cache
  };

  const upload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: 'sans-serif' }}>
      
      {/* HEADER AVEC BOUTON RETOUR */}
      <div style={{ padding: "15px 20px", display: "flex", alignItems: "center", background: "#fff" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", marginRight: "15px" }}>
          ←
        </button>
        <span style={{ fontWeight: "600" }}>Profil</span>
      </div>

      {/* BLOC MON PROFIL (Rectangle de ton dessin) */}
      <div style={{ 
        margin: "15px", 
        padding: "20px", 
        backgroundColor: "#fff", 
        borderRadius: "12px", 
        border: "1px solid #e2e8f0", // Bordure discrète
        display: "flex", 
        alignItems: "center", 
        gap: "15px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }}>
        <div style={{ position: "relative" }}>
          <div style={{ 
            width: 55, height: 55, borderRadius: "50%", backgroundColor: "#2563eb", 
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", overflow: "hidden"
          }}>
            {photo ? <img src={photo} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : data.firstname?.charAt(0)}
          </div>
          <label style={{ position: "absolute", bottom: -2, right: -2, background: "#fff", borderRadius: "50%", border: "1px solid #ddd", padding: "3px", cursor: "pointer" }}>
            <Camera size={12} />
            <input type="file" onChange={upload} style={{ display: "none" }} />
          </label>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>Mon profil</div>
          <div style={{ color: "#64748b", fontSize: "14px" }}>({data.firstname} {data.lastname})</div>
          <div style={{ color: "#1e3a8a", fontWeight: "800", fontSize: "13px", marginTop: "4px" }}>BPER BANCA</div>
        </div>
        <ChevronRight size={20} color="#cbd5e1" />
      </div>

      {/* LISTE DES OPTIONS */}
      <div style={{ backgroundColor: "#fff", marginTop: "10px" }}>
        
        <MenuRow icon={<Settings size={20}/>} title="Paramètres et confidentialité" />
        <MenuRow icon={<Shield size={20}/>} title="Sécurité" />
        <MenuRow icon={<MessageCircle size={20}/>} title="Parlez-nous" />

        <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "5px 20px" }} />

        <MenuRow icon={<TrendingUp size={20}/>} title="Opérations d'investissement" />
        <MenuRow icon={<CreditCard size={20}/>} title="Financement" />
        <MenuRow icon={<Umbrella size={20}/>} title="Assurance et prévoyance" />
        <MenuRow icon={<Edit size={20}/>} title="Modifier le compte" />

        <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "5px 20px" }} />

        <div onClick={handleLogout}>
          <MenuRow icon={<LogOut size={20} color="#dc2626"/>} title="Déconnecter" color="#dc2626" />
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour les lignes du menu
function MenuRow({ icon, title, color = "#1e293b" }) {
  return (
    <div style={{ 
      display: "flex", alignItems: "center", padding: "16px 20px", 
      borderBottom: "1px solid #f8fafc", cursor: "pointer" 
    }}>
      <div style={{ color: color, marginRight: "15px", display: "flex" }}>{icon}</div>
      <div style={{ flex: 1, fontSize: "15px", color: color }}>{title}</div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}