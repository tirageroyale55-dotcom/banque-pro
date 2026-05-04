import { useState, useEffect } from "react";
import { 
  Settings, Shield, MessageCircle, TrendingUp, 
  CreditCard, Umbrella, Edit, LogOut, ChevronRight, User, Globe, MapPin, Phone, Mail, Camera
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api"; 
import "../styles/Profile.css";

export default function Profile({ data: initialData, isDesktop = false }) {
  const navigate = useNavigate();
  const [data, setData] = useState(initialData);
  const [showDetails, setShowDetails] = useState(false);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
  if (!data) {
    api("/client/dashboard")
      .then(res => {
        setData(res);
        // ✅ AJOUTE ÇA : Si le serveur renvoie une photo, on l'affiche
        const user = res.user || res;
        if (user.profilePicture) {
          setPhoto(user.profilePicture);
        }
      })
      .catch(() => navigate("/login"));
  } else {
    // ✅ AJOUTE ÇA AUSSI : Si data existe déjà (ex: passé par le Dashboard)
    const user = data.user || data;
    if (user.profilePicture) {
      setPhoto(user.profilePicture);
    }
  }
}, [data, navigate]);


  // Fonction à ajouter en dehors de ton composant pour réduire la taille
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // On réduit la largeur à 800px
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        }, "image/jpeg", 0.7); // Qualité à 70%
      };
    };
  });
};

  // --- NOUVELLE FONCTION POUR ENREGISTRER LA PHOTO ---
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. On affiche l'aperçu immédiatement (même si c'est le gros fichier)
    setPhoto(URL.createObjectURL(file));

    try {
      // 2. On compresse l'image (cela prend un peu de temps)
      const compressedFile = await compressImage(file);

      // 3. On prépare le formulaire d'envoi avec SEULEMENT le fichier compressé
      const formData = new FormData();
      formData.append("photo", compressedFile); // Un seul append suffit ici

      const token = localStorage.getItem("token");

      // 4. Envoi vers le serveur
      const res = await fetch("/api/client/upload-profile-picture", {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
          // Rappel : Pas de "Content-Type" pour les fichiers
        },
        body: formData
      });

      const result = await res.json();

      if (res.ok) {
        setPhoto(result.url); // On remplace l'aperçu par l'URL Cloudinary finale
        alert("Photo de profil enregistrée !");
      } else {
        alert("Erreur " + res.status + " : " + (result.message || "Échec de l'enregistrement"));
      }
    } catch (err) {
      console.error("Erreur connexion:", err);
      alert("Problème de connexion au serveur.");
    }
  };

  if (!data) {
    return (
      <div className="bper-profile-loader">
        <div className="spinner"></div>
        <p>Chargement sécurisé...</p>
      </div>
    );
  }

  const userInfo = data.user ? data.user : data; 
  const nomUser = userInfo.nom || "";
  const prenomUser = userInfo.prenom || "";
  const displayName = `${prenomUser} ${nomUser}`.trim() || "Client BPER";
  const initials = `${prenomUser.charAt(0)}${nomUser.charAt(0)}`.toUpperCase() || "BC";

  // On utilise la photo du serveur si elle existe, sinon celle qu'on vient de charger
  const profileImage = photo || userInfo.profilePicture || null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className={isDesktop ? "profile-desktop-view" : "bper-profile-container"}>
      {!isDesktop && (
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
      )}

      {!showDetails ? (
        <div className="fade-in">
          {isDesktop && <h2 className="cards-title">Mon Profil</h2>}
          <div className="bper-card-blue" onClick={() => setShowDetails(true)}>
            <div className="bper-avatar-circle">
               {profileImage ? (
                 <img src={profileImage} alt="avatar" className="avatar-img"/> 
               ) : initials}
               
               <label className="camera-badge" onClick={(e) => e.stopPropagation()}>
                  <Camera size={10} />
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*"
                    onChange={handlePhotoChange} 
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
        <div className="bper-details-view fade-in">
          {isDesktop && (
              <button onClick={() => setShowDetails(false)} style={{marginBottom: '10px', cursor: 'pointer', border: 'none', background: 'none', color: '#005a64', fontWeight: 'bold'}}>
                ← Retour au profil
              </button>
            )}
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
                <p>Référence Client : {data._id?.slice(-8).toUpperCase() || "BPER-00401"}</p>
                <p>Compte actif - Certifié par BPER Banca</p>
            </div>
        </div>
      )}
    </div>
  );
}

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