import { useState, useEffect } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, Camera 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile({ data: initialData }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [data, setData] = useState(initialData || null);

  // RÉCUPÉRATION DES DONNÉES SI ELLES MANQUENT
  useEffect(() => {
    if (!data) {
      const token = localStorage.getItem("token");
      fetch("http://localhost:5000/api/client/dashboard", { // Remplace par ton URL API
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error("Erreur profil:", err));
    }
  }, [data]);

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '10px' }}>
        <div className="spinner"></div> {/* Si tu as un CSS de chargement */}
        <p>Récupération de votre compte...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const upload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* HEADER */}
      <div style={{ padding: "15px 20px", display: "flex", alignItems: "center", background: "#fff", borderBottom: '1px solid #f1f5f9' }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", marginRight: "15px" }}>
          ←
        </button>
        <span style={{ fontWeight: "600" }}>Mon Profil</span>
      </div>

      {/* BLOC PROFIL (DESSIN) */}
      <div style={{ 
        margin: "15px", padding: "20px", backgroundColor: "#fff", 
        borderRadius: "15px", border: "1.5px solid #2563eb", 
        display: "flex", alignItems: "center", gap: "15px"
      }}>
        <div style={{ position: "relative" }}>
          <div style={{ 
            width: 60, height: 60, borderRadius: "50%", backgroundColor: "#e2e8f0", 
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: '20px', fontWeight: 'bold', color: '#2563eb', overflow: 'hidden'
          }}>
            {photo ? <img src={photo} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : (data.firstname?.charAt(0))}
          </div>
          <label style={{ position: "absolute", bottom: -2, right: -2, background: "#2563eb", borderRadius: "50%", padding: "4px", cursor: "pointer", border: '2px solid #fff' }}>
            <Camera size={12} color="#fff" />
            <input type="file" onChange={upload} style={{ display: "none" }} />
          </label>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "17px" }}>Mon profil</div>
          <div style={{ color: "#64748b", fontSize: "14px" }}>({data.firstname} {data.lastname})</div>
          <div style={{ color: "#1e3a8a", fontWeight: "900", fontSize: "14px", marginTop: "4px", letterSpacing: '0.5px' }}>BPER BANCA</div>
        </div>
        <ChevronRight size={20} color="#cbd5e1" />
      </div>

      {/* OPTIONS MENU */}
      <div style={{ backgroundColor: "#fff", marginTop: "10px" }}>
        <MenuRow icon={<Settings size={22}/>} title="Paramètres et confidentialité" />
        <MenuRow icon={<Shield size={22}/>} title="Sécurité" />
        <MenuRow icon={<MessageCircle size={22}/>} title="Parlez-nous" />

        <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "10px 20px" }} />

        <MenuRow icon={<TrendingUp size={22}/>} title="Opérations d'investissement" />
        <MenuRow icon={<CreditCard size={22}/>} title="Financement" />
        <MenuRow icon={<Umbrella size={22}/>} title="Assurance et prévoyance" />
        <MenuRow icon={<Edit size={22}/>} title="Modifier le compte" />

        <div style={{ height: "1px", backgroundColor: "#f1f5f9", margin: "10px 20px" }} />

        <div onClick={handleLogout}>
          <MenuRow icon={<LogOut size={22} color="#dc2626"/>} title="Déconnecter" color="#dc2626" />
        </div>
      </div>
    </div>
  );
}

function MenuRow({ icon, title, color = "#1e293b" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid #f8fafc", cursor: "pointer" }}>
      <div style={{ color: color, marginRight: "18px", display: "flex" }}>{icon}</div>
      <div style={{ flex: 1, fontSize: "15px", color: color, fontWeight: '500' }}>{title}</div>
      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );
}